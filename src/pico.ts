import log from 'loglevel'
import {SerialPort} from 'serialport'
import {Deferred} from './library.js'

export class Pico {
    port: SerialPort
    openingPromise = new Deferred<void>()

    constructor(path: string) {
        const port = this.port = new SerialPort({
            path,
            baudRate: 115200,
            autoOpen: false,
        })
        port.on('open', () => {
            log.info('port opened')
        })
        port.on('error', (error) => {
            log.error('Error:', error.message)
        })
        port.on('data', (data: Buffer) => {
            log.debug('Data:', data.toString('ascii'))
            this.openingPromise.resolve()
        })
    }

    public async open(): Promise<void> {
        if (this.port.isOpen || this.port.opening) {
            return this.openingPromise.promise
        }
        this.port.open()
        return this.openingPromise.promise
    }

    /* eslint-disable @typescript-eslint/no-misused-promises */
    public async close(): Promise<void> {
        if (!this.port.isOpen) {
            return
        }
        return new Promise(async (resolve, reject) => {
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
}
