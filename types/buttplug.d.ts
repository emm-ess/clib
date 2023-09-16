/*
 * Resources
 * https://github.com/buttplugio/buttplug/blob/master/buttplug/buttplug-schema/schema/buttplug-schema.json
 * https://github.com/buttplugio/buttplug/tree/master/spec/protocol-spec
 * https://buttplug-spec.docs.buttplug.io/#the-need-for-a-computer-controlled-intimate-device-protocol-standard
 */

// eslint-disable-next-line @typescript-eslint/ban-types
type EmptyObject = {}

declare namespace Buttplug {
    type Command =
    // Handshake
        | RequestServerInfo
        | ServerInfo
        // Device-List / Device-Discovery
        | RequestDeviceList
        | DeviceList
        | DeviceAdded
        | DeviceRemoved
        | StartScanning
        | StopScanning
        | ScanningFinished
        // Device-Interaction
        | ScalarCmd
        | StopDevice
        | StopAllDevices
        // Misc
        | Error
        | Ok
        | Ping

    type BaseMessage = {
        /** User-set id for the message. 0 denotes system message and is reserved. */
        Id: number
    }

    // ---------
    // Handshake
    // ---------
    /** Request server version, and relay client name. */
    type RequestServerInfo = {
        RequestServerInfo: BaseMessage & {
            /** Name of the client software. */
            ClientName: string
            MessageVersion: number
        }
    }

    namespace RequestServerInfo {
        // https://buttplug-spec.docs.buttplug.io/deprecated.html#requestserverinfo-spec-v0
        type v0 = {
            RequestServerInfo: BaseMessage & {
                /** Name of the client software. */
                ClientName: string
            }
        }
    }

    /** Server version information, in Major.Minor.Build format. */
    type ServerInfo = {
        ServerInfo: BaseMessage & {
            /** Name of the server. Can be 0-length. */
            ServerName: string
            /** Message template version of the server software. */
            MessageVersion: number
            /** Maximum time (in milliseconds) the server will wait between ping messages from client before shutting down. */
            MaxPingTime: number
        }
    }

    namespace ServerInfo {
        // https://buttplug-spec.docs.buttplug.io/deprecated.html#serverinfo-spec-v0
        type v0 = {
            ServerInfo: BaseMessage & {
                ServerName: string
                MajorVersion: number
                MinorVersion: number
                BuildVersion: number
                MessageVersion: number
                MaxPingTime: number
            }
        }
    }

    // ------------------------------
    // Device-List / Device-Discovery
    // ------------------------------

    /** Request for the server to start scanning for new devices. */
    type StartScanning = {
        StartScanning: BaseMessage
    }

    /** Request for the server to stop scanning for new devices. */
    type StopScanning = {
        StopScanning: BaseMessage
    }

    /**
     * Server notification to client that scanning has ended.
     */
    type ScanningFinished = {
        ScanningFinished: BaseMessage
    }

    /** Request for the server to send a list of devices to the client. */
    type RequestDeviceList = {
        RequestDeviceList: BaseMessage
    }

    /** List of all available devices known to the system. */
    type DeviceList = {
        DeviceList: BaseMessage & {
            /** Array of device ids and names. */
            Devices: Device[]
        }
    }

    namespace DeviceList {
        // https://buttplug-spec.docs.buttplug.io/deprecated.html#devicelist-spec-v0
        type v0 = {
            DeviceList: BaseMessage & {
                /** Array of device ids and names. */
                Devices: Device.v0[]
            }
        }

        // https://buttplug-spec.docs.buttplug.io/deprecated.html#devicelist-spec-v1
        type v1 = {
            DeviceList: BaseMessage & {
                /** Array of device ids and names. */
                Devices: Device.v1[]
            }
        }
    }

    /** Notifies client that a device of a certain type has been added to the server. */
    type DeviceAdded = {
        DeviceAdded: BaseMessage & Device
    }

    namespace DeviceAdded {
        // https://buttplug-spec.docs.buttplug.io/deprecated.html#deviceadded-spec-v0
        type v0 = {
            DeviceAdded: BaseMessage & Device.v0
        }

        // https://buttplug-spec.docs.buttplug.io/deprecated.html#message-attributes-spec-v2
        type v1 = {
            DeviceAdded: BaseMessage & Device.v1
        }
    }

    /** Notifies client that a device of a certain type has been removed from the server. */
    type DeviceRemoved = {
        DeviceRemoved: BaseMessage & {
            /** Index used for referencing the device in device messages. */
            DeviceIndex: number
        }
    }

    type Device = {
        /** Descriptive name of the device, as taken from the base device configuration file */
        DeviceName: string
        /** User provided display name for a device */
        DeviceDisplayName?: string
        /** Index used for referencing the device in device messages. */
        DeviceIndex: number
        /** Recommended minimum gap between device commands, in milliseconds */
        DeviceMessageTimingGap ?: number
        /** A list of the messages a device will accept on this server implementation. */
        DeviceMessages: DeviceCommandDescriptions
    }

    namespace Device {
        type v0 = {
            DeviceName: string
            DeviceIndex: number
            DeviceMessages: DeviceCommandDescriptions.v0
        }

        type v1 = {
            DeviceName: string
            DeviceIndex: number
            DeviceMessages: DeviceCommandDescriptions.v1
        }
    }

    // ---------------
    // Device-Commands
    // ---------------
    /**
     * Accepted Device Messages
     * Key: Type names of Device Messages that the device will accept
     * Value: Attributes for the Device Messages
     */
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

    namespace DeviceCommandDescriptions {
        type v0 = Array<
            | 'FleshlightLaunchFW12Cmd'
            | 'SingleMotorVibrateCmd'
            | 'KiirooCmd'
            | 'LovenseCmd'
            | 'VorzeA10CycloneCmd'>

        /** note: only used parts are documented here */
        type v1 = {
            StopDeviceCmd?: EmptyObject
            VibrateCmd?: {
                FeatureCount: number
                StepCount?: number[]
            }
        }
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
        ActuatorType: ActuatorType[keyof ActuatorType]
    }

    /** Sends a vibrate command to a device that supports vibration. */
    type ScalarCmd = {
        ScalarCmd: BaseMessage & BaseDeviceCmd & {
            /** Device actution scalar (floating point, range can vary) keyed on acutator index, stepping will be device specific. */
            Scalars: Array<{
                /** Actuator index. */
                Index: number
                /** Actuator scalar (floating point, range can vary), stepping will be device specific. */
                Scalar: number
                /** Actuator type that is expected to be controlled with this subcommand. */
                ActuatorType: ActuatorType[keyof ActuatorType]
            }>
        }
    }

    // // Linear
    // type LinearCmdDescription = {
    //     FeatureDescriptor: string
    //     /** Specifies granularity of each feature on the device. */
    //     StepCount: number
    //     /** Denotes type of actuator (Vibrator, Linear, Oscillator, etc...) */
    //     ActuatorType: ActuatorType
    // }
    //
    // type LinearCmd = BaseDeviceCmd & {
    //     /** Device linear movement times (milliseconds) and positions (floating point, 0 < x < 1) keyed on linear actuator number, stepping will be device specific. */
    //     Vectors: Array<{
    //         /** Linear actuator number. */
    //         Index: number
    //         /** Linear movement time in milliseconds. */
    //         Duration: number
    //         /** Linear movement position (floating point, 0 < x < 1), stepping will be device specific. */
    //         Position: number
    //     }>
    // }
    //
    // type RotateCmdDescription = {
    //     FeatureDescriptor: string
    //     /** Specifies granularity of each feature on the device. */
    //     StepCount: number
    //     /** Denotes type of actuator (Vibrator, Linear, Oscillator, etc...) */
    //     ActuatorType: ActuatorType
    // }
    //
    // type RotateCmd = BaseDeviceCmd & {
    //     /** Device rotation speeds (floating point, 0 < x < 1) keyed on rotator number, stepping will be device specific. */
    //     Rotations: Array<{
    //         /** Rotator number.  */
    //         Index: number
    //         /** Rotation speed (floating point, 0 < x < 1), stepping will be device specific. */
    //         Speed: number
    //         /** Rotation direction (boolean). Not all devices have a concept of actual clockwise. */
    //         Clockwise: boolean
    //     }>
    // }
    //
    // type SensorReadCmdDescription = {
    //     SensorType: SensorType
    //     FeatureDescriptor: string
    //     SensorRange: number[][]
    // }
    //
    // type SensorReadCmd = BaseDeviceCmd & {
    //     SensorIndex: number
    //     SensorType: SensorType
    // }
    //
    // type SensorReading = BaseDeviceCmd & {
    //     SensorIndex: number
    //     SensorType: SensorType
    //     Data: number[]
    // }
    //
    // type SensorSubscribeCmdDescription = {
    //     SensorType: SensorType
    //     FeatureDescriptor: string
    //     SensorRange: number[][]
    // }
    //
    // type SensorSubscribeCmd = BaseDeviceCmd & {
    //     SensorIndex: number
    //     SensorType: SensorType
    // }
    //
    // type SensorUnsubscribeCmd = BaseDeviceCmd & {
    //     SensorIndex: number
    //     SensorType: SensorType
    // }
    //
    // /** Attributes for raw device messages. */
    // type RawReadCmdDescription = {
    //     Endpoints?: [string, ...string[]]
    // }
    //
    // type RawReadCmd = BaseDeviceCmd & {
    //     /** Endpoint (from device config file) from which the data was retrieved. */
    //     Endpoint: string
    //     /** Amount of data to read from device, 0 to exhaust whatever is in immediate buffer */
    //     Length: number
    //     /** If true, then wait until Length amount of data is available. */
    //     WaitForData: boolean
    // }
    //
    // type RawReading = BaseDeviceCmd & {
    //     /** Endpoint (from device config file) from which the data was retrieved. */
    //     Endpoint: string
    //     /** Raw byte string received from device. */
    //     Data: [number, ...number[]]
    // }
    //
    // /** Attributes for raw device messages. */
    // type RawWriteCmdDescription = {
    //     Endpoints?: [string, ...string[]]
    // }
    //
    // type RawWriteCmd = BaseDeviceCmd & {
    //     /** Endpoint (from device config file) to send command to. */
    //     Endpoint: string
    //     /** Raw byte string to send to device. */
    //     Data: [number, ...number[]]
    //     /** If true, BLE writes will use WriteWithResponse. Value ignored for all other types. */
    //     WriteWithResponse: boolean
    // }
    //
    // /** Attributes for raw device messages. */
    // type RawSubscribeCmdDescription = {
    //     Endpoints?: [string, ...string[]]
    // }
    //
    // type RawSubscribeCmd = BaseDeviceCmd & {
    //     /** Endpoint (from device config file) from which the data was retrieved. */
    //     Endpoint: string
    // }
    //
    // type RawUnsubscribeCmd = BaseDeviceCmd & {
    //     /** Endpoint (from device config file) from which the data was retrieved. */
    //     Endpoint: string
    // }

    /** Stops the all actions currently being taken by a device. */
    type StopDevice = {
        StopDeviceCmd: BaseMessage & BaseDeviceCmd
    }

    /** Stops all actions currently being taken by all connected devices. */
    type StopAllDevices = {
        StopAllDevices: BaseMessage
    }

    // ----
    // Misc
    // ----
    enum ErrorCode {
        /** An unknown error occurred. */
        ERROR_UNKNOWN = 0,
        /** Handshake did not succeed. */
        ERROR_INIT = 1,
        /** A ping was not sent in the expected time. */
        ERROR_PING = 2,
        /** A message parsing or permission error occurred */
        ERROR_MSG = 3,
        /** A command sent to a device returned an error. */
        ERROR_DEVICE = 4,
    }
    /** Signifies the server encountered an error while processing the message indicated by the id. */
    type Error = {
        Error: BaseMessage & {
            ErrorMessage: string
            ErrorCode: ErrorCode
        }
    }

    /** Signifies successful processing of the message indicated by the id. */
    type Ok = {
        Ok: BaseMessage
    }

    /** Connection keep-alive message. */
    type Ping = {
        Ping: BaseMessage
    }

    namespace Deprecated {
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

        type VibrateCmd = {
            VibrateCmd: BaseMessage & BaseDeviceCmd & {
                Speeds: Array<{
                    Index: number
                    Speed: number
                }>
            }
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
        type Test = {
            TestMessage: BaseMessage & {
                /** String to be echo'd back from server. Setting this to 'Error' will cause an error to be thrown. */
                TestString: string
            }
        }
        /** Request for server to stream log messages of a certain level to client. */
        type RequestLog = {
            RequestLog: BaseMessage & {
                /** Maximum level of log message to receive. */
                LogLevel: LogLevel
            }
        }

        /** Log message from the server. */
        type Log = {
            Log: BaseMessage & {
                /** Log level of message. */
                LogLevel: LogLevel
                /** Log message from server. */
                LogMessage: string
            }
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
