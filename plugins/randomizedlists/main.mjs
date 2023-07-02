import {
    genres
}
from "./src/genres.mjs";
import {
    instruments
}
from "./src/instruments.mjs";

import {
    Constants
}
from "../../src/Constants.mjs";
var plugin = {
    name: "randomizedlists",

    //commands is a map of keys and functions that take an object as a parameter and return a string
    // {
    // target: target,
    // msg: msg,
    // context: new TwitchChatMessageContext(context),
    // "self": isSelf,
    // chatBot: self
    // }
    exports: {},
    commands: new Map(),
    load: function (globalState) {
        var FileRepository = globalState.get("filerepository");
				var Constants = globalState.get("constants");

        FileRepository.log("randomizedlists.load");

        // this function will be called by Main.js in the app
        //load whatever dependencies you need in here and do setup

        plugin.commands.set("prinstrument", {
            description: "",
            handler: function (obj) {
                var index = Math.floor(Math.random() * instruments.length);
                var msg = instruments[index].word + " - " + instruments[index].definition;
                return msg;
            }
        });

        plugin.commands.set("prgenre", {
            description: "",
            handler: function (obj) {
                var index = Math.floor(Math.random() * genres.length);
                return genres[index];
            }
        });

        return Promise.resolve();
    }
};

export default plugin;
