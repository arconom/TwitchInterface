import VoicemodApi from "./src/VoicemodApi.mjs";
import VoicemodConfig from "./src/VoicemodConfig.mjs";
import OverlayMessage from "../../src/OverlayMessage.mjs";

var plugin = {
    name: "voicemod",

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
    commands: new Map(),
    load: function (globalState) {
        const FileRepository = globalState.get("filerepository");
        FileRepository.log("voicemod.load");
        const App = globalState.get("app");
        const OverlayWebSocket = App.overlayWebSocket;
        const ObsManager = App.ObsManager;
        const Constants = globalState.get("constants");
        const stateKey = "voicemod";
        const configFilePath = `./plugins/voicemod/data/config.json`;
        // const Constants = globalState.get("constants");
        // const App = globalState.get("App");
        let config = new VoicemodConfig();

        plugin.exports.actions = new Map();

        plugin.exports.actions.set("Play Sound", {
            description: "play a sound",
            defaultJson: `{"soundName": ""}`,
            handler: function (globalState, obj, json) {
                const FileRepository = globalState.get("filerepository");
                FileRepository.log("VoicemodAPI.PlaySound" + " \r\n " + JSON.stringify(json));
                
                let key = json.soundName;
                
                if(!key)
                {
                    key = obj?.msg?.split(" ")[1] ?? "";
                }

                try {
                    // console.log("prsound playing sound", key);
                    plugin.exports.VoicemodApi.PlaySound(key);
                } catch (e) {
                    FileRepository.log(new Date(Date.now()).toISOString() + " \r\n "
                         + "VoicemodAPI encountered an error" + " \r\n " + e);
                }
            }
        });

        plugin.exports.actions.set("Set Voice", {
            description: "set voice",
            defaultJson: `{"voiceId": ""}`,
            handler: function (globalState, obj, json) {
                const FileRepository = globalState.get("filerepository");
                FileRepository.log("VoicemodAPI.SetVoice" + " \r\n " + JSON.stringify(json));
                
                let key = json.voiceId;
                
                if(!key)
                {
                    key = obj?.msg?.split(" ")[1] ?? "";
                }

                try {
                    FileRepository.log("prsound loading voice " + key);
                    plugin.exports.VoicemodApi.LoadVoice(key);
                } catch (e) {
                    FileRepository.log(new Date(Date.now()).toISOString() + " \r\n "
                         + "VoicemodAPI encountered an error" + " \r\n " + e);
                }
            }
        });

        FileRepository.readFileAsync(configFilePath)?.then(function (data) {

            FileRepository.log("voicemod.load" + data);

            if (data) {
                var obj = JSON.parse(data);
                config.uri = obj.uri;
                config.clientKey = obj.clientKey;
            } else {
                FileRepository.writeFileAsync(configFilePath, config, true);
            }

            // this function will be called by Main.js in the app
            //load whatever dependencies you need in here and do setup


            plugin.exports.VoicemodApi =
                new VoicemodApi(config.uri,
                    config.clientKey, FileRepository);

            // plugin.exports.VoicemodApi.AddHandler("memesGot", getActions);
            plugin.exports.VoicemodApi.onMessageHandlers.push(msg => FileRepository.log("Voicemod API response: " + msg));
            plugin.exports.VoicemodApi.onErrorHandlers.push(e => FileRepository.log("Voicemod API error:  " + e));

        })
        .catch((e) => {
            FileRepository.log("voicemod.load error " + e);
        });
        return Promise.resolve();
    }
};

/* function getActions(soundsMap) {
    console.log("trying to map voicemod actions ");
    let returnMe = new Map();

    for (let kvp of soundsMap) {
        // console.log("voicemod.action " + kvp[0]);

        returnMe.set(kvp[0], {
            handler: () => {
                plugin.exports.VoicemodApi.PlaySound(kvp[0])
            }
        });
    }

    plugin.exports.actions = returnMe;
    // console.log("this should be a map full of sounds ", Array.from(plugin.exports.actions.keys()));
}
 */
export default plugin;
