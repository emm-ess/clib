import type {PortInfo} from '@serialport/bindings-cpp'
import log from 'loglevel'
import {SerialPort} from 'serialport'

import {MAX_POWER, MIN_POWER} from './const.js'
import {clamp, Deferred} from './library.js'

export default class Clib {
    port: SerialPort
    openingPromise = new Deferred<void>()

    constructor(path: string) {
        const port = this.port = new SerialPort({
            path,
            baudRate: 9600,
            autoOpen: false,
        })
        port.on('open', () => {
            log.info('port opened')
            this.setPower(0)
        })
        port.on('error', (error) => {
            log.error('Error:', error.message)
        })
        port.on('data', (data: Buffer) => {
            log.debug('Data:', data.toString('ascii'))
            this.openingPromise.resolve()
        })
    }

    public static async getPorts(): Promise<PortInfo[]> {
        return SerialPort.list()
    }

    public async open(): Promise<void> {
        if (this.port.isOpen || this.port.opening) {
            return this.openingPromise.promise
        }
        this.port.open()
        return this.openingPromise.promise
    }

    public async close(): Promise<void> {
        if (!this.port.isOpen) {
            return
        }
        await this.setPower(0)
        return new Promise((resolve, reject) => {
            this.port.close((error) => {
                if (error) {
                    console.log(error)
                    reject(error)
                    return
                }
                resolve()
            })
        })
    }

    public async setPower(power: number): Promise<void> {
        power = clamp(power, MIN_POWER, MAX_POWER)
        return new Promise((resolve, reject) => {
            this.port.write([power])
            this.port.drain((error) => {
                if (error) {
                    reject(error)
                    return
                }
                resolve()
            })
        })
    }
}
