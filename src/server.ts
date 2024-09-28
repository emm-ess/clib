import log from 'loglevel'
import {WebSocket, WebSocketServer} from 'ws'

import {
    ActuatorType,
    isRequestDeviceList,
    isRequestServerInfo,
    isScalarCmd,
    isStartScanning, isStopAllDevices, isStopDevice,
    isStopScanning, isVibrateCmd,
} from './buttplug.js'
import type Clib from './clib.simple.js'
import {
    CLIB_DEVICE_DESCRIPTION_V2,
    CLIB_DEVICE_DESCRIPTION_V3,
    MAX_POWER,
    WEBSOCKET_PORT,
} from './const.js'

log.setLevel('debug')

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

function getClientMessageId(message: Buttplug.Command): number {
    return Object.values(message)[0]?.Id || 0
}

class ButtplugConnection {
    ws: WebSocket
    clib: Clib
    _nextMessageId = 0
    clientMessageVersion = 3

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

    handleMessage(data: Buffer): void {
        if (!data) {
            log.info('received empty message')
            return
        }
        log.debug('received: %s', data)

        const parsed = JSON.parse(data.toString()) as Buttplug.Command[]
        if (!Array.isArray(parsed)) {
            log.info('invalid message')
        }

        const responseMessages = parsed.map((message) => this.answerMessage(message))
        this.send(responseMessages)
    }

    send(message: Buttplug.Command[]): void {
        const messageString = JSON.stringify(message)
        log.debug('send: %s', messageString)
        this.ws.send(messageString)
    }

    answerMessage(message: Buttplug.Command): Buttplug.Command {
        if (isRequestServerInfo(message)) {
            return this.handleRequestServerInfoMessage(message)
        }
        if (isRequestDeviceList(message)) {
            return this.handleRequestDeviceListMessage(message)
        }
        if (isVibrateCmd(message)) {
            return this.handleVibrateCmdMessage(message)
        }
        if (isStopDevice(message) || isStopAllDevices(message)) {
            return this.handleStopMessage(message)
        }
        if (isStartScanning(message) || isStopScanning(message)) {
            return this.returnOkHandler(message)
        }
        if (isScalarCmd(message)) {
            return this.handleScalarCmdMessage(message)
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

    handleRequestServerInfoMessage(message: Buttplug.RequestServerInfo): Buttplug.ServerInfo {
        this.clientMessageVersion = message.RequestServerInfo.MessageVersion
        return {
            ServerInfo: {
                Id: message.RequestServerInfo.Id,
                ServerName: 'Clib-Server',
                MessageVersion: this.clientMessageVersion,
                MaxPingTime: 0,
            },
        }
    }

    handleRequestDeviceListMessage(message: Buttplug.RequestDeviceList): Buttplug.DeviceList | Buttplug.Error {
        const deviceDescription = this.clientMessageVersion === 3
            ? CLIB_DEVICE_DESCRIPTION_V3
            : CLIB_DEVICE_DESCRIPTION_V2
        return {
            DeviceList: {
                Id: message.RequestDeviceList.Id,
                Devices: [deviceDescription],
            },
        }
    }

    handleVibrateCmdMessage(message: Buttplug.Deprecated.VibrateCmd): Buttplug.Ok {
        const power = (message.VibrateCmd.Speeds[0]?.Speed || 0) * MAX_POWER
        this.clib.setPower(power)
        return {
            Ok: {
                Id: message.VibrateCmd.Id,
            },
        }
    }

    handleScalarCmdMessage(message: Buttplug.ScalarCmd): Buttplug.Ok {
        const power = (message.ScalarCmd.Scalars.find((entry) => entry.ActuatorType === ActuatorType.VIBRATE)?.Scalar || 0) * MAX_POWER
        this.clib.setPower(power)
        return {
            Ok: {
                Id: message.ScalarCmd.Id,
            },
        }
    }

    handleStopMessage(message: Buttplug.StopDevice | Buttplug.StopAllDevices): Buttplug.Ok {
        this.clib.setPower(0)
        return this.returnOkHandler(message)
    }

    returnOkHandler(message: Buttplug.Command): Buttplug.Ok {
        return {
            Ok: {
                Id: getClientMessageId(message),
            },
        }
    }
}
