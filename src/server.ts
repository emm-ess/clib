import log from 'loglevel'
import {RawData, WebSocket, WebSocketServer} from 'ws'

import {
    isRequestDeviceListMessage,
    isRequestServerInfoMessage,
    isStartScanningMessage, isStopAllDevicesMessage, isStopDeviceMessage,
    isStopScanningMessage, isVibrateCmdMessage,
} from './buttplug'
import type Clib from './clib.simple'
import {CLIB_DEVICE_DESCRIPTION_V2, MAX_POWER, WEBSOCKET_PORT} from './const'

export class ButtplugServer extends WebSocketServer {
    connection: ButtplugConnection | undefined

    constructor(clib: Clib) {
        super({
            port: WEBSOCKET_PORT,
        })

        this.on('connection', (ws) => {
            if (this.connection) {
                ws.terminate()
                return
            }
            ws.on('close', () => {
                this.connection = undefined
            })
            this.connection = new ButtplugConnection(ws, clib)
        })
    }
}

function getClientMessageId(message: Buttplug.Message): number {
    return Object.values(message)[0]?.Id || 0
}

class ButtplugConnection {
    ws: WebSocket
    clib: Clib
    _nextMessageId = 0

    get nextMessageId(): number {
        const id = this._nextMessageId
        this._nextMessageId++
        return id
    }

    constructor(ws: WebSocket, clib: Clib) {
        this.ws = ws
        this.clib = clib
        ws.on('message', this.handleMessage.bind(this))
    }

    handleMessage(data: RawData): void {
        if (!data) {
            log.info('received empty message')
            return
        }
        log.debug('received: %s', data)

        const parsed = JSON.parse(data.toString()) as Buttplug.Message[]
        if (!Array.isArray(parsed)) {
            log.info('invalid message')
        }

        const responseMessages = parsed.map((message) => this.answerMessage(message))
        this.send(responseMessages)
    }

    send(message: Buttplug.Message[]): void {
        const messageString = JSON.stringify(message)
        log.debug('send: %s', messageString)
        this.ws.send(messageString)
    }

    answerMessage(message: Buttplug.Message): Buttplug.Message {
        if (isRequestServerInfoMessage(message)) {
            return this.handleRequestServerInfoMessage(message)
        }
        if (isRequestDeviceListMessage(message)) {
            return this.handleRequestDeviceListMessage(message)
        }
        if (isVibrateCmdMessage(message)) {
            return this.handleVibrateCmdMessage(message)
        }
        if (isStopDeviceMessage(message) || isStopAllDevicesMessage(message)) {
            return this.handleStopMessage(message)
        }
        if (isStartScanningMessage(message) || isStopScanningMessage(message)) {
            return this.returnOkHandler(message)
        }
        log.error('could not process message: %s', message)
        return {
            Error: {
                Id: getClientMessageId(message),
                ErrorCode: 1,
                ErrorMessage: 'could not process message',
            },
        }
    }

    handleRequestServerInfoMessage(message: Buttplug.RequestServerInfoMessage): Buttplug.ServerInfoMessage {
        return {
            ServerInfo: {
                Id: message.RequestServerInfo.Id,
                ServerName: 'Clib-Server',
                MessageVersion: 2,
                MaxPingTime: 0,
            },
        }
    }

    handleRequestDeviceListMessage(message: Buttplug.RequestDeviceListMessage): Buttplug.DeviceListMessage | Buttplug.ErrorMessage {
        return {
            DeviceList: {
                Id: message.RequestDeviceList.Id,
                Devices: [CLIB_DEVICE_DESCRIPTION_V2],
            },
        }
    }

    handleVibrateCmdMessage(message: Buttplug.Deprecated.VibrateCmdMessage): Buttplug.OkMessage {
        const power = (message.VibrateCmd.Speeds[0]?.Speed || 0) * MAX_POWER
        this.clib.setPower(power)
        return {
            Ok: {
                Id: message.VibrateCmd.Id,
            },
        }
    }

    handleStopMessage(message: Buttplug.Message): Buttplug.OkMessage {
        this.clib.setPower(0)
        return this.returnOkHandler(message)
    }

    returnOkHandler(message: Buttplug.Message): Buttplug.OkMessage {
        return {
            Ok: {
                Id: getClientMessageId(message),
            },
        }
    }
}
