import {ActuatorType} from './buttplug.js'

export const TICKS_PER_SECOND = 30
/** in seconds */
export const MAX_BLEND_TIME = 1.5
export const MIN_POWER = 0
export const MAX_POWER = 127
const STEPS = 127

export const ARDUINO_REGEX = /arduino/i
export const PICO_REGEX = /pico/i

export const WEBSOCKET_PORT = 12_345

export const CLIB_DEVICE_DESCRIPTION_V2: Buttplug.Device.v1 = {
    DeviceName: 'Clib',
    DeviceIndex: 0,
    DeviceMessages: {
        StopDeviceCmd: {},
        VibrateCmd: {
            FeatureCount: 1,
            StepCount: [STEPS],
        },
    },
}

export const CLIB_DEVICE_DESCRIPTION_V3: Buttplug.Device = {
    DeviceName: 'Clib',
    DeviceIndex: 0,
    DeviceMessages: {
        StopDeviceCmd: {},
        ScalarCmd: [{
            FeatureDescriptor: 'vibrator',
            ActuatorType: ActuatorType.VIBRATE,
            StepCount: STEPS,
        }],
    },
    DeviceMessageTimingGap: 10,
}
