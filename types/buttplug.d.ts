/*
 * Resources
 * https://github.com/buttplugio/buttplug/blob/master/buttplug/buttplug-schema/schema/buttplug-schema.json
 * https://github.com/buttplugio/buttplug/tree/master/spec/protocol-spec
 * https://buttplug-spec.docs.buttplug.io/#the-need-for-a-computer-controlled-intimate-device-protocol-standard
 */

// eslint-disable-next-line @typescript-eslint/ban-types
type EmptyObject = {}

declare namespace Buttplug {
    type Message =
    // Handshake
        | RequestServerInfoMessage
        | ServerInfoMessage
        // Device-List / Device-Discovery
        | RequestDeviceListMessage
        | DeviceListMessage
        | DeviceAddedMessage
        | DeviceRemovedMessage
        | StartScanningMessage
        | StopScanningMessage
        | ScanningFinishedMessage
        // Device-Interaction
        | ScalarCmdMessage
        | StopDeviceMessage
        | StopAllDevicesMessage
        // Misc
        | ErrorMessage
        | OkMessage
        | PingMessage

    type BaseMessage = {
        /** User-set id for the message. 0 denotes system message and is reserved. */
        Id: number
    }

    // ---------
    // Handshake
    // ---------
    /** Request server version, and relay client name. */
    type RequestServerInfo = {
        /** Name of the client software. */
        ClientName: string
        MessageVersion: number
    }
    type RequestServerInfoMessage = {
        RequestServerInfo: BaseMessage & RequestServerInfo
    }

    /** Server version information, in Major.Minor.Build format. */
    type ServerInfo = {
        /** Name of the server. Can be 0-length. */
        ServerName: string
        /** Message template version of the server software. */
        MessageVersion: number
        /** Maximum time (in milliseconds) the server will wait between ping messages from client before shutting down. */
        MaxPingTime: number
    }
    type ServerInfoMessage = {
        ServerInfo: BaseMessage & ServerInfo
    }

    // ------------------------------
    // Device-List / Device-Discovery
    // ------------------------------
    /** Request for the server to send a list of devices to the client. */
    type RequestDeviceListMessage = {
        RequestDeviceList: BaseMessage
    }

    /** List of all available devices known to the system. */
    type DeviceList = BaseMessage & {
        /** Array of device ids and names. */
        Devices: Device[]
    }
    type DeviceListMessage = {
        DeviceList: BaseMessage & DeviceList
    }

    /** Notifies client that a device of a certain type has been added to the server. */
    type DeviceAddedMessage = {
        DeviceAdded: BaseMessage & Device
    }

    /** Notifies client that a device of a certain type has been removed from the server. */
    type DeviceRemoved = {
        /** Index used for referencing the device in device messages. */
        DeviceIndex: number
    }
    type DeviceRemovedMessage = {
        DeviceRemoved: BaseMessage & DeviceRemoved
    }

    type Device = {
        /** Descriptive name of the device, as taken from the base device configuration file */
        DeviceName: string
        /** User provided display name for a device */
        DeviceDisplayName?: string
        /** Index used for referencing the device in device messages. */
        DeviceIndex: number
        /** Recommended minimum gap between device commands, in milliseconds */
        DeviceMessageGap?: number
        /** A list of the messages a device will accept on this server implementation. */
        DeviceMessages: DeviceCommandDescriptions
    }

    /** Request for the server to start scanning for new devices. */
    type StartScanningMessage = {
        StartScanning: BaseMessage
    }

    /** Request for the server to stop scanning for new devices. */
    type StopScanningMessage = {
        StopScanning: BaseMessage
    }

    /**
     * Server notification to client that scanning has ended.
     */
    type ScanningFinishedMessage = {
        ScanningFinished: BaseMessage
    }

    // ---------------
    // Device-Commands
    // ---------------
    type DeviceCommandDescriptions = {
        ScalarCmd?: ScalarCmdDescription[]
        LinearCmd?: LinearCmdDescription[]
        RotateCmd?: RotateCmdDescription[]
        SensorReadCmd?: SensorReadCmdDescription[]
        SensorSubscribeCmd?: SensorSubscribeCmdDescription[]
        RawReadCmd?: RawReadCmdDescription
        RawWriteCmd?: RawWriteCmdDescription
        RawSubscribeCmd?: RawSubscribeCmdDescription
        StopDeviceCmd?: EmptyObject
    }

    type BaseDeviceCmd = {
        /** Index used for referencing the device in device messages. */
        DeviceIndex: number
    }

    enum ActuatorType {
        VIBRATE = 'Vibrate',
        ROTATE = 'Rotate',
        OSCILLATE = 'Oscillate',
        CONSTRICT = 'Constrict',
        INFLATE = 'Inflate',
        POSITION = 'Position',
    }

    enum SensorType {
        BATTERY = 'Battery',
        RSSI = 'RSSI',
        BUTTON = 'Button',
        PRESSURE = 'Pressure',
    }

    // Scalar
    type ScalarCmdDescription = {
        /** Text descriptor for a feature. */
        FeatureDescriptor: string
        /** Specifies granularity of each feature on the device. */
        StepCount: number
        /** Denotes type of actuator (Vibrator, Linear, Oscillator, etc...) */
        ActuatorType: ActuatorType
    }

    /** Sends a vibrate command to a device that supports vibration. */
    type ScalarCmd = BaseDeviceCmd & {
        /** Device actution scalar (floating point, range can vary) keyed on acutator index, stepping will be device specific. */
        Scalars: Array<{
            /** Actuator index. */
            Index: number
            /** Actuator scalar (floating point, range can vary), stepping will be device specific. */
            Scalar: number
            /** Actuator type that is expected to be controlled with this subcommand. */
            ActuatorType: ActuatorType
        }>
    }

    type ScalarCmdMessage = {
        ScalarCmd: BaseMessage & ScalarCmd
    }

    // Linear
    type LinearCmdDescription = {
        FeatureDescriptor: string
        /** Specifies granularity of each feature on the device. */
        StepCount: number
        /** Denotes type of actuator (Vibrator, Linear, Oscillator, etc...) */
        ActuatorType: ActuatorType
    }

    type LinearCmd = BaseDeviceCmd & {
        /** Device linear movement times (milliseconds) and positions (floating point, 0 < x < 1) keyed on linear actuator number, stepping will be device specific. */
        Vectors: Array<{
            /** Linear actuator number. */
            Index: number
            /** Linear movement time in milliseconds. */
            Duration: number
            /** Linear movement position (floating point, 0 < x < 1), stepping will be device specific. */
            Position: number
        }>
    }

    type RotateCmdDescription = {
        FeatureDescriptor: string
        /** Specifies granularity of each feature on the device. */
        StepCount: number
        /** Denotes type of actuator (Vibrator, Linear, Oscillator, etc...) */
        ActuatorType: ActuatorType
    }

    type RotateCmd = BaseDeviceCmd & {
        /** Device rotation speeds (floating point, 0 < x < 1) keyed on rotator number, stepping will be device specific. */
        Rotations: Array<{
            /** Rotator number.  */
            Index: number
            /** Rotation speed (floating point, 0 < x < 1), stepping will be device specific. */
            Speed: number
            /** Rotation direction (boolean). Not all devices have a concept of actual clockwise. */
            Clockwise: boolean
        }>
    }

    type SensorReadCmdDescription = {
        SensorType: SensorType
        FeatureDescriptor: string
        SensorRange: number[][]
    }

    type SensorReadCmd = BaseDeviceCmd & {
        SensorIndex: number
        SensorType: SensorType
    }

    type SensorReading = BaseDeviceCmd & {
        SensorIndex: number
        SensorType: SensorType
        Data: number[]
    }

    type SensorSubscribeCmdDescription = {
        SensorType: SensorType
        FeatureDescriptor: string
        SensorRange: number[][]
    }

    type SensorSubscribeCmd = BaseDeviceCmd & {
        SensorIndex: number
        SensorType: SensorType
    }

    type SensorUnsubscribeCmd = BaseDeviceCmd & {
        SensorIndex: number
        SensorType: SensorType
    }

    /** Attributes for raw device messages. */
    type RawReadCmdDescription = {
        Endpoints?: [string, ...string[]]
    }

    type RawReadCmd = BaseDeviceCmd & {
        /** Endpoint (from device config file) from which the data was retrieved. */
        Endpoint: string
        /** Amount of data to read from device, 0 to exhaust whatever is in immediate buffer */
        Length: number
        /** If true, then wait until Length amount of data is available. */
        WaitForData: boolean
    }

    type RawReading = BaseDeviceCmd & {
        /** Endpoint (from device config file) from which the data was retrieved. */
        Endpoint: string
        /** Raw byte string received from device. */
        Data: [number, ...number[]]
    }

    /** Attributes for raw device messages. */
    type RawWriteCmdDescription = {
        Endpoints?: [string, ...string[]]
    }

    type RawWriteCmd = BaseDeviceCmd & {
        /** Endpoint (from device config file) to send command to. */
        Endpoint: string
        /** Raw byte string to send to device. */
        Data: [number, ...number[]]
        /** If true, BLE writes will use WriteWithResponse. Value ignored for all other types. */
        WriteWithResponse: boolean
    }

    /** Attributes for raw device messages. */
    type RawSubscribeCmdDescription = {
        Endpoints?: [string, ...string[]]
    }

    type RawSubscribeCmd = BaseDeviceCmd & {
        /** Endpoint (from device config file) from which the data was retrieved. */
        Endpoint: string
    }

    type RawUnsubscribeCmd = BaseDeviceCmd & {
        /** Endpoint (from device config file) from which the data was retrieved. */
        Endpoint: string
    }

    /** Stops the all actions currently being taken by a device. */
    type StopDeviceCmd = BaseDeviceCmd
    type StopDeviceMessage = {
        StopDeviceCmd: BaseMessage & StopDeviceCmd
    }

    /** Stops all actions currently being taken by all connected devices. */
    type StopAllDevicesMessage = {
        StopAllDevices: BaseMessage
    }

    // ----
    // Misc
    // ----
    /** Signifies the server encountered an error while processing the message indicated by the id. */
    type Error = {
        ErrorMessage: string
        ErrorCode: number
    }
    type ErrorMessage = {
        Error: BaseMessage & Error
    }

    /** Signifies successful processing of the message indicated by the id. */
    type OkMessage = {
        Ok: BaseMessage
    }

    /** Connection keep-alive message. */
    type PingMessage = {
        Ping: BaseMessage
    }

    namespace V2 {
        type Message =
        // Handshake
            | RequestServerInfoMessage
            | ServerInfoMessage
            // Device-List / Device-Discovery
            | RequestDeviceListMessage
            | Deprecated.DeviceListMessageV1
            | DeviceAddedMessage
            | DeviceRemovedMessage
            | StartScanningMessage
            | StopScanningMessage
            | ScanningFinishedMessage
            // Device-Interaction
            | ScalarCmdMessage
            | StopDeviceMessage
            | StopAllDevicesMessage
            | Deprecated.VibrateCmdMessage
            // Misc
            | ErrorMessage
            | OkMessage
            | PingMessage
    }

    namespace Deprecated {
        type DeviceCommandDescriptionsV0 = Array<
            | 'FleshlightLaunchFW12Cmd'
            | 'SingleMotorVibrateCmd'
            | 'KiirooCmd'
            | 'LovenseCmd'
            | 'VorzeA10CycloneCmd'>
        type DeviceV0 = {
            DeviceName: string
            DeviceIndex: number
            DeviceMessages: DeviceCommandDescriptionsV0
        }
        // https://buttplug-spec.docs.buttplug.io/deprecated.html#devicelist-spec-v0
        type DeviceListV0 = BaseMessage & {
            Devices: DeviceV0[]
        }
        // https://buttplug-spec.docs.buttplug.io/deprecated.html#deviceadded-spec-v0
        type DeviceAddedV0 = BaseMessage & DeviceV0

        type DeviceCommandDescriptionsV1 = {
            StopDeviceCmd?: EmptyObject
            VibrateCmd?: {
                FeatureCount: number
                StepCount?: number[]
            }
        }
        type DeviceV1 = {
            DeviceName: string
            DeviceIndex: number
            DeviceMessages: DeviceCommandDescriptionsV1
        }
        // https://buttplug-spec.docs.buttplug.io/deprecated.html#devicelist-spec-v1
        type DeviceListMessageV1 = BaseMessage & {
            Devices: DeviceV1[]
        }
        // https://buttplug-spec.docs.buttplug.io/deprecated.html#message-attributes-spec-v2
        type DeviceAddedV1 = BaseMessage & DeviceV1

        // https://buttplug-spec.docs.buttplug.io/deprecated.html#requestserverinfo-spec-v0
        type RequestServerInfoV0 = BaseMessage & {
            ClientName: string
        }

        // https://buttplug-spec.docs.buttplug.io/deprecated.html#serverinfo-spec-v0
        type ServerInfoV0 = BaseMessage & {
            ServerName: string
            MajorVersion: number
            MinorVersion: number
            BuildVersion: number
            MessageVersion: number
            MaxPingTime: number
        }

        // https://buttplug-spec.docs.buttplug.io/deprecated.html#rawcmd
        type RawCmd = BaseMessage & {
            DeviceIndex: number
            Command: number[]
        }

        type SingleMotorVibrateCmd = BaseMessage & BaseDeviceCmd & {
            Speed: number
        }

        type KiirooCmd = BaseMessage & BaseDeviceCmd & {
            Command: '0' | '1' | '2' | '3' | '4'
        }

        type FleshlightLaunchFW12Cmd = BaseMessage & BaseDeviceCmd & {
            Position: number
            Speed: number
        }

        type LovenseCmd = BaseMessage & BaseDeviceCmd & {
            Command: string
        }

        type VorzeA10CycloneCmd = BaseMessage & BaseDeviceCmd & {
            Speed: string
            Clockwise: boolean
        }

        type VibrateCmd = BaseMessage & BaseDeviceCmd & {
            Speeds: Array<{
                Index: number
                Speed: number
            }>
        }
        type VibrateCmdMessage = {
            VibrateCmd: BaseMessage & VibrateCmd
        }

        type BatteryLevelCmd = BaseMessage & BaseDeviceCmd

        type BatteryLevelReading = BaseMessage & BaseDeviceCmd & {
            BatteryLevel: number
        }

        type RSSILevelCmd = BaseMessage & BaseDeviceCmd

        type RSSILevelReading = BaseMessage & BaseDeviceCmd & {
            RSSILevel: number
        }

        /** Used for connection/application testing. Causes server to echo back the string sent. Sending string of 'Error' will result in a server error. */
        type Test = BaseMessage & {
            /** String to be echo'd back from server. Setting this to 'Error' will cause an error to be thrown. */
            TestString: string
        }
        type TestMessage = {
            TestMessage: BaseMessage & Test
        }
        /** Request for server to stream log messages of a certain level to client. */
        type RequestLog = {
            /** Maximum level of log message to receive. */
            LogLevel: LogLevel
        }
        type RequestLogMessage = {
            RequestLog: BaseMessage & RequestLog
        }

        /** Log message from the server. */
        type Log = {
            /** Log level of message. */
            LogLevel: LogLevel
            /** Log message from server. */
            LogMessage: string
        }
        type LogMessage = {
            Log: BaseMessage & Log
        }

        enum LogLevel {
            OFF = 'Off',
            FATAL = 'Fatal',
            ERROR = 'Error',
            WARN = 'Warn',
            INFO = 'Info',
            DEBUG = 'Debug',
            TRACE = 'Trace',
        }
    }
}
