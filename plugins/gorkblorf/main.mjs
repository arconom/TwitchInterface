import {
    Worker,
    isMainThread,
    parentPort,
    workerData
}
from 'node:worker_threads';

import Gorkblorf from "./src/gorkblorf.mjs";
import {
    Constants
}
from "../../src/Constants.mjs";
var plugin = {
    name: "gorkblorf",
    loadComplete: false,
    //commands is a map of keys and functions that take an object as a parameter and return a string
    // {
    // target: target,
    // msg: msg,
    // context: new TwitchChatMessageContext(context),
    // "self": isSelf,
    // chatBot: self
    // }
    exports: {
        //gorkblorf: Gorkblorf
    },
    chatMessageHandler: function (message) {
        if (!message.self && plugin.loadComplete) {
            plugin.exports.gorkblorf?.read(message.msg, message.context["user-id"]);

            if (message.msg.toLowerCase().indexOf("@" + message.chatBot.username.toLowerCase()) > -1) {
                var respondingTo = "@" + message.context.username;
                var responseMessage = plugin.exports.gorkblorf.getText(null, Math.ceil(Math.random() * 20));

                if (responseMessage.length === 0) {
                    responseMessage = "gorkblorf molunga spafs spafs spafs >><<";
                }
				
				message.chatBot.sendMessage(message.target.substr(1), respondingTo + " " + responseMessage);
            }
			else{
				console.log("gorkblorf chose not to respond to you");
			}
        }else{
			console.log("gorkblorf not done loading, so it can't respond");
		}
    },
    commands: new Map(),
    load: function (globalState) {
        var FileRepository = globalState.get("filerepository");
        FileRepository.log("gorkblorf.load");
        var ChatLog = globalState.get("chatlog");
        // this function will be called by Main.js in the app
        //load whatever dependencies you need in here and do setup

        //we need the wordgenerator plugin to run this
        FileRepository.log("Gorkblorf is reading the chat log.  This takes a while.");
        var Constants = globalState.get("constants");

        plugin.commands.set("prgbstats", {
            description: "gorkblorf statistics",
            handler: function (obj) {
                return "@" + obj.context.username + "\r\n " + plugin.exports.gorkblorf.getStatisticsMessage(obj.context["user-id"]);
            }
        });

        return FileRepository.loadChatMessages(
            function (msg) {
            var obj = JSON.parse(msg);
            var channelName = obj.target.substr(1);
            var messageList = ChatLog.get(channelName);

            if (messageList?.length > 0) {
                messageList.push(obj);
            } else {
                messageList = [obj];
            }
            ChatLog.set(channelName, messageList);
        })
        .then(function (data) {
            return new Promise(function (resolve, reject) {
                //loading the text takes a long time because of levenshtein distance,
                //so we do it in another thread

                var worker = new Worker("./plugins/gorkblorf/src/loadGorkblorf.js", {
                    workerData: {
                        chatLog: ChatLog,
                        vocab: plugin.exports.vocab
                    }
                });

                worker.on('message', function (data) {
                    plugin.exports.gorkblorf = new Gorkblorf(data.gorkblorf, FileRepository);
                    plugin.loadComplete = true;
                    FileRepository.log("Gorkblorf load complete.");
                });
                worker.on('error', function (err) {
                    console.log("error", err);
                    reject(err);
                });
                worker.on('exit', (code) => {
                    if (code !== 0) {
                        console.log(`Worker stopped with exit code ${code}`);
                    }

                    var startTime = Date.now();
                    var keys = ChatLog.keys();
                    for (const key of keys) {
                        var messages = ChatLog.get(key);
                        messages.forEach(function (x) {
                            plugin.exports.gorkblorf.read(x.msg, x.context["user-id"]);
                        });
                    }
                    var endTime = Date.now();
                    resolve();
                });
            });
        });

        function loadGorkblorfVocab() {
            var self = this;
            return FileRepository.readLargeFileAsync("./data/gorkblorfVocab.json",
                function (line) {
                if (!plugin.exports.vocab) {
                    plugin.exports.vocab = [];
                }
                plugin.exports.vocab.push(line);
            });
        }

        function saveGorkblorfVocab(data) {
            return FileRepository.appendFileAsync("./data/gorkblorfVocab.json", data + "\r\n");
        }

    }
};

export default plugin;
