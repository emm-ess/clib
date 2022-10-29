import inquirer from 'inquirer'

import Clib from './clib.simple'
import {ARDUINO_REGEX} from './const'
import {ButtplugServer} from './server'

let clib: Clib
let server: ButtplugServer

// exit code taken from https://stackoverflow.com/questions/14031763/doing-a-cleanup-action-just-before-node-js-exits
// so the program will not close instantly
process.stdin.resume()

async function exitHandler(exit = false, exitCode?: number): Promise<void> {
    if (clib) {
        await clib.close()
    }
    if (server) {
        server.close()
    }
    if (exit) {
        // eslint-disable-next-line unicorn/no-process-exit
        process.exit(exitCode)
    }
}

/* eslint-disable @typescript-eslint/no-misused-promises */
// do something when app is closing
process.on('exit', exitHandler.bind(undefined, false))
// catches ctrl+c event
process.on('SIGINT', exitHandler.bind(undefined, true))
// catches "kill pid" (for example: nodemon restart)
process.on('SIGUSR1', exitHandler.bind(undefined, true))
process.on('SIGUSR2', exitHandler.bind(undefined, true))
// catches uncaught exceptions
process.on('uncaughtException', exitHandler.bind(undefined, true))
/* eslint-enable @typescript-eslint/no-misused-promises */

async function main() {
    const availablePorts = await Clib.getPorts()
    const defaultPath = availablePorts.find(({manufacturer}) => manufacturer && ARDUINO_REGEX.test(manufacturer))?.path
    const {selectedPath} = await inquirer.prompt<{selectedPath: string}>([{
        name: 'selectedPath',
        message: 'Port?',
        type: 'list',
        choices: availablePorts.map(({path}) => path),
        default: defaultPath,
    }])
    if (selectedPath) {
        clib = new Clib(selectedPath)
        await clib.open()
        server = new ButtplugServer(clib)
    }
}
// eslint-disable-next-line @typescript-eslint/no-floating-promises
await main()
