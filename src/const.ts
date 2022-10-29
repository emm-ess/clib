import {ActuatorType} from './buttplug'

export const TICKS_PER_SECOND = 30
/** in seconds */
export const MAX_BLEND_TIME = 1.5
export const MIN_POWER = 0
export const MAX_POWER = 127

export const ARDUINO_REGEX = /arduino/i

export const WEBSOCKET_PORT = 12_345

export const CLIB_DEVICE_DESCRIPTION_V2: Buttplug.Deprecated.DeviceV1 = {
    DeviceName: 'Clib',
    DeviceIndex: 0,
    DeviceMessages: {
        StopDeviceCmd: {},
        VibrateCmd: {
            FeatureCount: 1,
            StepCount: [126],
        },
    },
}

export const CLIB_DEVICE_DESCRIPTION: Buttplug.Device = {
    DeviceName: 'Clib',
    // DeviceDisplayName: 'Clib',
    // DeviceMessageGap: 50,
    DeviceIndex: 0,
    DeviceMessages: {
        ScalarCmd: [{
            FeatureDescriptor: 'Test Vibrator',
            StepCount: 126,
            ActuatorType: ActuatorType.VIBRATE,
        }],
        StopDeviceCmd: {},
    },
}
