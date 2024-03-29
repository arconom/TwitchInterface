import VoicemodApi from "./src/VoicemodApi.mjs";
import VoicemodConfig from "./src/VoicemodConfig.mjs";
import OverlayMessage from "../../src/OverlayMessage.mjs";

var plugin = {
    name: "voicemod",

    //an array of strings, naming the other plugins that are dependencies
    dependencies: [],

    //commands is a map of keys and functions that take an object as a parameter and return a string
    // {
    // target: string,
    // msg: string,
    // context: Object<TwitchChatMessageContext>,
    // "self": bool,
    // chatBot: Object<ChatBot>
    // }
    exports: {},
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

        let config = new VoicemodConfig();


        plugin.exports.actions = new Map();

        FileRepository.readFileAsync(configFilePath).then(function (data) {

            FileRepository.log("voicemod.load", data);

            if (data) {
                var obj = JSON.parse(data);

                config.uri = obj.uri;
                config.clientKey = obj.clientKey;
            } else {
                FileRepository.writeFileAsync(configFilePath, config, true);
            }

            // this function will be called by Main.js in the app
            //load whatever dependencies you need in here and do setup

            // const Constants = globalState.get("constants");
            // const App = globalState.get("App");

            plugin.exports.VoicemodApi =
                new VoicemodApi(config.uri,
                    config.clientKey);

            plugin.exports.VoicemodApi.onErrorHandlers.push(e => FileRepository.log(e));
        });

        plugin.commands.set("prsound", {
            description: "play a sound",
            handler: function (obj) {
                const key = obj.args[0];
                
                try {
                     plugin.exports.VoicemodApi.PlaySound(key);
                } catch (e) {
                    FileRepository.log(new Date(Date.now()).toISOString() + " \r\n "
                         + "VoicemodAPI encountered an error" + " \r\n " + e);
                }
            }
        });

        return Promise.resolve();
    }
};

export default plugin;
