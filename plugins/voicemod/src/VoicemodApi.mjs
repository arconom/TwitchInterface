import WebSocket from "ws";
import {
    v4 as uuidv4
}
from "uuid";
import HandlerMap from "../../../src/HandlerMap.mjs";

const ports = ["59129", "20000", "39273", "42152", "43782", "46667", "35679", "37170", "38501", "33952", "30546"];
const path = "v1";

const voices = {
    none: "nofx",
    robot: "robot"
};

export default class VoicemodApi extends HandlerMap {
    constructor(uri = "ws://127.0.0.1", clientKey) {
        super();
        var self = this;
        this.webSocket = null;
        this.uri = uri;
        this.connectionAttempts = 0;
        this.maxConnectionAttempts = 5;
        this.messages = new Map();
        this.responses = new Map();
        this.clientKey = clientKey;
        this.connected = false;
        this.currentPortIndex = 0;

        this.onMessageOnceHandlers = [];
        this.onMessageHandlers = [];

        this.onErrorHandlers = [];

        this.soundsMap = new Map();

        this.onopen = (e) => {
            const self = this;
            
            self.onMessageOnceHandlers.push(function (message) {
                self.GetSounds();
            });

            self.SendMessage("registerClient", {
                "clientKey": self.clientKey
            });
        };
        this.onclose = (e) => {};
        this.onmessage = (m) => {
            this.responses.set(m.data.actionId ?? ((new Date().getTime() * 1000) + (Math.floor(Math.random() * 1000))).toString(), m);
            this.onMessageOnceHandlers.forEach(function (handler) {
                handler(m.data);
            });
            this.onMessageOnceHandlers.length = 0;
            this.onMessageHandlers.forEach(function (handler) {
                handler(m.data);
            });

            if (m?.data?.indexOf("getMemes") > -1) {
                self.ProcessMemes(m);
            }
        };
        this.onerror = (e) => {
            this.onErrorHandlers.forEach(function (handler) {
                handler(e);
            });
        };

        this.Connect();
    }

    get NextPort() {
        this.currentPortIndex++;
        if (this.currentPortIndex > ports.length - 1) {
            this.currentPortIndex = 0;
        }
        return ports[this.currentPortIndex];
    }

    get CurrentPort() {
        return ports[this.currentPortIndex];
    }

    Connect() {
        if (this.currentPortIndex === 0) {
            this.connectionAttempts++;
        }


        if (this.connectionAttempts > this.maxConnectionAttempts) {
            return;
        }

        try {
            let url = this.uri + ":" + this.CurrentPort + "/" + path;

            this.webSocket = new WebSocket(url);
            this.webSocket.onopen = this.onopen;
            this.webSocket.onclose = this.onclose;
            this.webSocket.onmessage = this.onmessage;
            this.webSocket.onerror = this.onerror;

        } catch (e) {
            // console.log(e);
            setTimeout(function () {
                this.Connect(this.NextPort);
            }, 1000);
        }
    }

    SendMessage(/*string*/ action, /*object*/ payload) {
        let messageObject = {
            id: uuidv4(),
            action: action,
            payload: payload
        };

        var message = JSON.stringify(messageObject);
        //todo I don't remember why I am saving messages here
        this.messages.set(messageObject.id, messageObject);
        // console.log("SendMessage", message);
        this.webSocket?.send(message);
    }

    LoadVoice(id) {
        this.SendMessage("loadVoice", {
            "voiceID": id
        });
    }

    GetSounds() {
        this.SendMessage("getMemes", {});
    }

    ProcessMemes(message) {
            console.log("ProcessMemes");
        let memes = null;
        const self = this;

        if (message.data) {
            memes = JSON.parse(message.data);
        }

        try {
            console.log("processing Voicemod sounds");

        /*
            voicemod sound
            {
                FileName: "",
                Image: "",
                Name: "",
                Type: ""
            }
        */

            let mappedMemes = memes?.actionObject.listOfMemes.map(x => {
                return [x.Name.toLowerCase().replaceAll(/[^\w]/g, ""), x.FileName];
            }).sort((a, b) => {
                return a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0
            });

            //we make a map containing a list of filenames for each unique key
            //the keys are the names of the sounds in Voicemod
            //this means that several sounds that are named the same
            //will be put into a pool for random selection
            for (let i = 0; i < mappedMemes?.length; i++) {
                const key = mappedMemes[i][0];
                const fileName = mappedMemes[i][1];

                // console.log(key);

                if (self.soundsMap.has(key)) {
                    let fileNameArray = self.soundsMap.get(key);
                    fileNameArray.push(fileName);
                    self.soundsMap.set(key, fileNameArray);
                } else {
                    self.soundsMap.set(key, [fileName]);
                }
            }
            
            self.ExecuteHandlers("memesGot", self.soundsMap);
            
        } catch (e) {
            console.log(e);
        }
    }

    PlaySound(key) {
        // console.log("PlaySound", key);
        if (this.soundsMap.has(key)) {
            let index = 0;
            let arr = this.soundsMap.get(key);

            if (arr.length > 1) {
                index = Math.floor(Math.random() * arr.length);
            }

            // console.log("PlaySound playing", arr[index]);

            this.SendMessage("playMeme", {
                FileName: arr[index],
                IsKeyDown: true
            });
        }
    }

    StopSounds() {
        this.SendMessage("stopAllMemeSounds", {});
    }

}
