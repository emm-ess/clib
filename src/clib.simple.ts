import type {PortInfo} from '@serialport/bindings-cpp'
import {SerialPort} from 'serialport'

import {MAX_POWER, MIN_POWER} from './const'
import {clamp} from './library'

export default class Clib {
    port: SerialPort

    constructor(path: string) {
        const port = this.port = new SerialPort({
            path,
            baudRate: 9600,
        })
        port.on('open', () => {
            console.log('port opened')
        })
        port.on('error', (error) => {
            console.log('Error:', error.message)
        })
        port.on('data', (data: Buffer) => {
            console.log('Data:', data.toString('ascii'))
        })
    }

    public static async getPorts(): Promise<PortInfo[]> {
        return SerialPort.list()
    }

    public async open(): Promise<void> {
        if (this.port.isOpen || this.port.opening) {
            return
        }
        return new Promise((resolve, reject) => {
            this.port.open((error) => {
                if (error) {
                    console.log(error)
                    reject()
                    return
                }
                this.setPower(0)
                resolve()
            })
        })
    }

    /* eslint-disable @typescript-eslint/no-misused-promises */
    public async close(): Promise<void> {
        if (!this.port.isOpen) {
            return
        }
        return new Promise(async (resolve, reject) => {
            await this.setPower(0)
            this.port.close((error) => {
                if (error) {
                    console.log(error)
                    reject()
                    return
                }
                resolve()
            })
        })
    }
    /* eslint-enable @typescript-eslint/no-misused-promises */

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
