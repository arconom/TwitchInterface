import { spawn, fork } from "child_process";
import process from 'node:process';

// const path = `C:\\Users\\arcon\\Downloads\\libdev_v2_1_0_7\\libdev_v2.1.0_7\\windows\\win64-release\\OBSBOT_Sample.exe`;
const path = `C:\\Users\\arcon\\Downloads\\libdev_v2_1_0_7\\libdev_v2.1.0_7\\OBSBOT_Sample\\out\\build\\x64-Debug\\OBSBOT_Sample.exe`;
let child = getSpawn();

function getSpawn() {
    try {

        // Start the app (for example: python, bash, mysql, ffmpeg, anything)
        let child = spawn(path, [], {
            stdio: "pipe" /*, detached: true, shell: true */
        });

        // Read output
        // child.stdout.on("data", (data) => {
        // console.log("OBSBOT OUTPUT:", data.toString());
        // });

        // Handle errors and exit
        child.stderr.on("error", (data) => {
            console.error("ERROR:", data.toString());
        });

        child.on("exit", code => console.log("Child exited:", code));

        console.log("getSpawn returning");
        return child;
    } catch (e) {
        console.log("error while setting up OBSBOT", e);
    }
}

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
            description: "Set camera zoom to a value between 1 and 2",
            handler: function (globalState, obj, json) {
                FileRepository.log("obsbot.Set Zoom");
                const key = obj.target + ":" + stateKey;
                const zoomFraction = json.fraction ?? obj.args[0];

                let isOp = ChatCommandManager.getCommandState(key + ":operator", obj.userId);
                let isLeet = ChatCommandManager.hasRole(obj.context, Constants.chatRoles.moderator);

                if (isCameraOperator(key, obj)) {
                    send("11 " + zoomFraction);
                }

                // ChatCommandManager.setCommandState(key + ":options", optionsMap);
                return "";
            }
        });

        plugin.exports.actions.set("Control Gimbal", {
            name: "Control Gimbal",
            defaultJSON: `{"deltaY": "0.0", "deltaX": "0.0", "c": "0.0"}`,
            description: "Move Gimbal by the specified amount",
            handler: function (globalState, obj, json) {
                FileRepository.log("obsbot.Control Gimbal " + obj.args[0]);
                const key = obj.target + ":" + stateKey;
                const deltaY = obj.args[0] ?? json.deltaY ?? 0;
                const deltaX = obj.args[1] ?? json.deltaX ?? 0;
                const c = obj.args[2] ?? json.c ?? 0;

                let isOp = ChatCommandManager.getCommandState(key + ":operator", obj.userId);
                let isLeet = ChatCommandManager.hasRole(obj.context, Constants.chatRoles.moderator);

                if (isCameraOperator(key, obj)) {
                    send("5 " + deltaY + " " + deltaX + " " + c);
                }

                // ChatCommandManager.setCommandState(key + ":options", optionsMap);
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
