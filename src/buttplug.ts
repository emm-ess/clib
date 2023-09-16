export enum ActuatorType {
    VIBRATE = 'Vibrate',
    ROTATE = 'Rotate',
    OSCILLATE = 'Oscillate',
    CONSTRICT = 'Constrict',
    INFLATE = 'Inflate',
    POSITION = 'Position',
}

export enum SensorType {
    BATTERY = 'Battery',
    RSSI = 'RSSI',
    BUTTON = 'Button',
    PRESSURE = 'Pressure',
}

export function isRequestServerInfo(message: unknown): message is Buttplug.RequestServerInfo {
    return !!(message as Buttplug.RequestServerInfo).RequestServerInfo
}

export function isRequestDeviceList(message: unknown): message is Buttplug.RequestDeviceList {
    return !!(message as Buttplug.RequestDeviceList).RequestDeviceList
}

export function isStartScanning(message: unknown): message is Buttplug.StartScanning {
    return !!(message as Buttplug.StartScanning).StartScanning
}

export function isStopScanning(message: unknown): message is Buttplug.StopScanning {
    return !!(message as Buttplug.StopScanning).StopScanning
}

export function isStopDevice(message: unknown): message is Buttplug.StopDevice {
    return !!(message as Buttplug.StopDevice).StopDeviceCmd
}

export function isStopAllDevices(message: unknown): message is Buttplug.StopAllDevices {
    return !!(message as Buttplug.StopAllDevices).StopAllDevices
}

export function isVibrateCmd(message: unknown): message is Buttplug.Deprecated.VibrateCmd {
    return !!(message as Buttplug.Deprecated.VibrateCmd).VibrateCmd
}

export function isScalarCmd(message: unknown): message is Buttplug.ScalarCmd {
    return !!(message as Buttplug.ScalarCmd).ScalarCmd
}
