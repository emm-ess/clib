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

export function isRequestServerInfoMessage(message: unknown): message is Buttplug.RequestServerInfoMessage {
    return !!(message as Buttplug.RequestServerInfoMessage).RequestServerInfo
}

export function isRequestDeviceListMessage(message: unknown): message is Buttplug.RequestDeviceListMessage {
    return !!(message as Buttplug.RequestDeviceListMessage).RequestDeviceList
}

export function isStartScanningMessage(message: unknown): message is Buttplug.StartScanningMessage {
    return !!(message as Buttplug.StartScanningMessage).StartScanning
}

export function isStopScanningMessage(message: unknown): message is Buttplug.StopScanningMessage {
    return !!(message as Buttplug.StopScanningMessage).StopScanning
}

export function isVibrateCmdMessage(message: unknown): message is Buttplug.Deprecated.VibrateCmdMessage {
    return !!(message as Buttplug.Deprecated.VibrateCmdMessage).VibrateCmd
}

export function isStopDeviceMessage(message: unknown): message is Buttplug.StopDeviceMessage {
    return !!(message as Buttplug.StopDeviceMessage).StopDeviceCmd
}

export function isStopAllDevicesMessage(message: unknown): message is Buttplug.StopAllDevicesMessage {
    return !!(message as Buttplug.StopAllDevicesMessage).StopAllDevices
}
