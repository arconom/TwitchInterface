import { spawn, fork } from "child_process";
import process from 'node:process';


// "q             quit!" << endl;
// "p             printf device info!" << endl;
// "s             select device!" << endl;
// "1              set status callback!" << endl;
// "2              set event notify callback!" << endl;
// "3              wakeup or sleep!" << endl;
// "4              control the gimbal to move to the specified angle!" << endl;
// "5              control the gimbal to move by the specified speed!" << endl;
// "6              set the boot initial position and zoom ratio and move to the preset position!" << endl;
// "7              set the preset position and move to the preset positions!" << endl;
// "8              set ai mode!" << endl;
// "9              cancel ai mode!" << endl;
// "10             set ai tracking type!" << endl;
// "11             set the absolute zoom level!" << endl;
// "12             set the absolute zoom level and speed!" << endl;
// "13             set fov of the camera!" << endl;
// "14             set media mode!" << endl;
// "15             set hdr!" << endl;
// "16             set face focus!" << endl;
// "17             set the manual focus value!" << endl;
// "18             set the white balance!" << endl;
// "19             start or stop taking photos!" << endl;
// "21             download file!" << endl;

const directionMap = new Map();
directionMap.set("up", "/OBSBOT/WebCam/General/SetGimbalUp");
directionMap.set("down", "/OBSBOT/WebCam/General/SetGimbalDown");
directionMap.set("left", "/OBSBOT/WebCam/General/SetGimbalLeft");
directionMap.set("right", "/OBSBOT/WebCam/General/SetGimbalRight");

/*     "OSC Server Connected",
"/OBSBOT/WebCam/General/Connected,i"
//i	x	Optional. The client will receive responses "Server Connected Reply" and all the "Device Infomation" after sending this message. (Tips：This Command takes only one Argument)

"Server Connected Reply",
"/OBSBOT/WebCam/General/ConnectedResp"
//	i	1	Reply to the client.

"OSC Server Disconnected",
"/OBSBOT/WebCam/General/Disconnected"
//	i	x	Optional. Used to notify the server when a client stops working. (Tips：This Command takes only one Argument)

"Gimbal Reset",
"/OBSBOT/WebCam/General/ResetGimbal"
//	i	x	Gimbal reset.

"Zoom Set",
"/OBSBOT/WebCam/General/SetZoom"
//	i	0-100	0-100 corresponds to 0%~100% of full range in zoom adjustment.

"Zoom Speed Set",
"/OBSBOT/WebCam/General/SetZoomSpeed"
//	ii	0-100,0-11	The first variable is the target zoom value (0-100), 0-100 corresponds to 0%~100% of full range in zoom adjustment. The second variable is target zoom speed (0-11). 0->default speed. 1~11->Higher value means faster zooming.

"Zoom Max",
"/OBSBOT/WebCam/General/SetZoomMax"
//	i	x

"Zoom Min",
"/OBSBOT/WebCam/General/SetZoomMin"
//	i	x

"Gimbal Set Up"
"/OBSBOT/WebCam/General/SetGimbalUp"
//	i	0-100	0->Gimbal stop moving；1-100->Gimbal move up; Higher value means faster movement.

"Gimbal Set Down",
"/OBSBOT/WebCam/General/SetGimbalDown"
// i	0-100	0->Gimbal stop moving；1-100->Gimbal move down; Higher value means faster movement.

"Gimbal Set Left",
"/OBSBOT/WebCam/General/SetGimbalLeft"
// i	0-100	0->Gimbal stop moving；1-100->Gimbal move left; Higher value means faster movement.

"Gimbal Set Right",
"/OBSBOT/WebCam/General/SetGimbalRight"
// i	0-100	0->Gimbal stop moving；1-100->Gimbal move right; Higher value means faster movement.

"Gimbal Set Motor Degree",
"/OBSBOT/WebCam/General/SetGimMotorDegree"
// iii	0-90,-129-129,-59-59	The first variable is speed (0, 90). The second variable is pan degree (-129°, 129°) ; The third variable is pitch degree (-59°, 59°);

"Mirror Set",
"/OBSBOT/WebCam/General/SetMirror"
// i	0\1	0->Not Mirror; 1->Mirror

"Auto Focus",
"/OBSBOT/WebCam/General/SetAutoFocus"
// i	0\1	0->Manual Focus; 1->Auto Focus

"Manual Focus",
"/OBSBOT/WebCam/General/SetManualFocus"
// i	0-100	Manual focus value.

"Auto Exposure",
"/OBSBOT/WebCam/General/SetAutoExposure"
// i	0\1	0->Manual Exposure; 1->Auto Exposure

"Exposure Compensate",
"/OBSBOT/WebCam/General/SetExposureCompensate"
// i	-30-30	Exposure compensation value, (-30, 30) corresponds to the actual exposure compensation (-3.0, 3.0) in OBSBOT WebCam.  The valid values can be one of (-30  -27  -23  -20  -17  -13  -10  -7  -3  0  3  7  10  13  17  20  23  27  30).

"Shutter Speed",
"/OBSBOT/WebCam/General/SetShutterSpeed"
// i	1-6400	Shutter speed value, eg. 6400 means the actual shutter speed is 1/6400, other values are similar.  The valid values can be one of (6400, 5000, 3200, 2500, 2000, 1600, 1250, 1000, 800, 640, 500, 400, 320, 240, 200, 160, 120, 100, 80, 60, 50, 40, 30, 25, 20, 15, 12.5, 10, 8, 6.25, 5, 4, 3, 2.5).

"ISO",
"/OBSBOT/WebCam/General/SetISO"
// i	100-6400	ISO value.

"Auto WhiteBalance",
"/OBSBOT/WebCam/General/SetAutoWhiteBalance"
// i	0\1	0->Manual WhiteBalance; 1->Auto WhiteBalance

"Color Temperature",
"/OBSBOT/WebCam/General/SetColorTemperature"
// i	2000~10000	Color temperature value.

"AIMode",
"/OBSBOT/Camera/TailAir/SetAiMode"
// i	0\1\2\3\6\7	0->No Tracking；1->Normal Tracking；2->Upper Body；3->Close-up；6->Animal Tracking；7->Group

"Tracking Speed",
"/OBSBOT/Camera/TailAir/SetTrackingSpeed"
// i	0\1\2	0->Slow；1->Standard；2->Fast

"Start \ Stop Recording",
"/OBSBOT/Camera/TailAir/SetRecording"
// i	0\1	0->Stop Recording；1->Start Recording

"Snapshot",
"/OBSBOT/Camera/TailAir/Snapshot"
// i	1	1->Snapshot

"Select Trigger Preset Position",
"/OBSBOT/Camera/TailAir/TriggerPreset"
// i	0\1\2	0->Preset Position 1；1->Preset Position 2；2->Preset Position 3

"Get Device Info",
"/OBSBOT/WebCam/General/GetDeviceInfo"
// i	x	Get device information, response is "DeviceInfo"

"Device Info Reply",
"/OBSBOT/WebCam/General/DeviceInfo"
// isisisisiii		Connection state of Device 1(1->connnected; 0->disconnected), Name of Device 1; Followed by those of Device 2/3/4; The number of the currently selected device (0,1,2,3); Run state of the currently selected device (0->Sleep; 1->Run), The type of currently selected device (0->Tiny, 1->Tiny 4K, 2->Meet, 3->Meet 4K)

"Get Zoom Info:",
"/OBSBOT/WebCam/General/GetZoomInfo"
// i	x	Get zoom information, response is "Zoom Info Reply"

"Zoom Info Reply",
"/OBSBOT/WebCam/General/ZoomInfo"
// ii		zoom value (0~100), fov value (0->86°; 1->78°; 2->65°)

"Get Gimbal Position Info",
"/OBSBOT/WebCam/General/GetGimbalPosInfo"
// i	x	Get the motor degree information, response is "Gimbal PosInfo Reply".

"Gimbal Position Info Reply",
"/OBSBOT/WebCam/General/GetGimbalPosInfoResp"
// iii		Gimbal motor angle, the variables are roll degree (not used at present), pitch degree (-90°~90°), yaw degree (-140°~140°).

 */
var plugin = {
    name: "obsbot",

    //commands is a map of keys and functions that take an object as a parameter and return a string
    // {
    // target: string,
    // msg: string,
    // context: Object<TwitchChatMessageContext>,
    // "self": bool,
    // chatBot: Object<ChatBot>
    // }
    exports: {
        actions: null
    },
    load: function (globalState) {
        const App = globalState.get("app");
        const Constants = globalState.get("constants");
        const ChatCommandManager = App?.chatBot?.chatCommandManager;
        const FileRepository = globalState.get("filerepository");
        const stateKey = "obsbot";
        const OverlayWebSocket = App.overlayWebSocket;
        FileRepository.log("obsbot.load");

        // this function will be called by Main.js in the app
        //load whatever dependencies you need in here and do setup

        plugin.exports.actions = new Map();

        plugin.exports.actions.set("Set Zoom", {
            name: "Set Zoom",
            defaultJSON: `{"fraction": 1.0}`,
            description: "Set camera zoom to a value between 0 and 100",
            handler: function (globalState, obj, json) {
                FileRepository.log("obsbot.Set Zoom");
                const key = obj.target + ":" + stateKey;
                const zoomFraction = json.fraction ?? parseInt(obj.args[0]);

                let isOp = ChatCommandManager.getCommandState(key + ":operator", obj.userId);
                let isLeet = ChatCommandManager.hasRole(obj.context, Constants.chatRoles.moderator);

                if (isCameraOperator(key, obj)) {
                    // send("11 " + zoomFraction);
                    App.oscManager.send("/OBSBOT/WebCam/General/SetZoom", [zoomFraction], true);
                }

                // ChatCommandManager.setCommandState(key + ":options", optionsMap);
                return "";
            }
        });

        plugin.exports.actions.set("Control Gimbal", {
            name: "Control Gimbal",
            defaultJSON: `{"speed": "0-90", "pan": "-129-129", "pitch": "-59-59"}`,
            description: "Move Gimbal by the specified amount",
            handler: function (globalState, obj, json) {
                FileRepository.log("obsbot.Control Gimbal " + obj.args[0]);
                // pitch -59-59
                // pan -129-129
                // speed 0-90
                const key = obj.target + ":" + stateKey;
                const speed = parseInt(obj.args[0]) ?? json.speed ?? 5;
                const pan = parseInt(obj.args[1]) ?? json.pan ?? 0;
                const pitch = parseInt(obj.args[2]) ?? json.pitch ?? 0;

                let isOp = ChatCommandManager.getCommandState(key + ":operator", obj.userId);
                let isLeet = ChatCommandManager.hasRole(obj.context, Constants.chatRoles.moderator);

                if (isCameraOperator(key, obj)) {
                    // send("5 " + deltaY + " " + deltaX + " " + c);
                    App.oscManager.send("/OBSBOT/WebCam/General/SetGimMotorDegree", [speed, pan, pitch], true);
                }

                return "";
            }
        });

        plugin.exports.actions.set("Gimbal Move", {
            name: "Gimbal Move",
            defaultJSON: `{"speed": "0-90", "direction": "up, down, left, right"}`,
            description: "Move Gimbal in the specified vector",
            handler: function (globalState, obj, json) {
                FileRepository.log("obsbot.Gimbal Move " + obj.args[0] + " " + obj.args[1]);
                const key = obj.target + ":" + stateKey;
                const speed = parseInt(obj.args[0]) ?? json.speed ?? 5;
                const vector = obj.args[1].toLowerCase();

                let isOp = ChatCommandManager.getCommandState(key + ":operator", obj.userId);
                let isLeet = ChatCommandManager.hasRole(obj.context, Constants.chatRoles.moderator);

                if (isCameraOperator(key, obj)) {
                    if (directionMap.has(vector)) {
                        App.oscManager.send(directionMap.get(vector), [speed], true);
                        
                        setTimeout(function(){
                            App.oscManager.send(directionMap.get(vector), [0], true);
                        }, 1000);
                    }
                }

                return "";
            }
        });

        plugin.exports.actions.set("Gimbal Reset", {
            name: "Gimbal Reset",
            defaultJSON: `{}`,
            description: "Reset gimbal",
            handler: function (globalState, obj, json) {
                FileRepository.log("obsbot.Gimbal Reset");
                const key = obj.target + ":" + stateKey;

                let isOp = ChatCommandManager.getCommandState(key + ":operator", obj.userId);
                let isLeet = ChatCommandManager.hasRole(obj.context, Constants.chatRoles.moderator);

                if (isCameraOperator(key, obj)) {
                    App.oscManager.send("/OBSBOT/WebCam/General/ResetGimbal", [0], true);
                }

                return "";
            }
        });

        function isCameraOperator(key, obj) {
            let isOp = ChatCommandManager.getCommandState(key + ":operator") === obj.context.userId;
            let isLeet = ChatCommandManager.hasRole(obj.context, Constants.chatRoles.moderator);
            return isOp || isLeet;
        }

        function send(message) {
            FileRepository.log("obsbot.send " + message);
            child.stdin.write(message + "\n");
        }
        return Promise.resolve();
    }
};

export default plugin;
