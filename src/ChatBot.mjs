import tmi from 'tmi.js';
import HandlerMap from "./HandlerMap.mjs";
import {
    Constants
}
from './Constants.mjs';
import {
    Secrets
}
from './Secrets.mjs';
import {
    exec
}
from 'child_process';
import {
    FileRepository
}
from "./FileRepository.mjs";

export default class ChatBot extends HandlerMap {
    constructor(username, secrets, chatDelay, commandManager) {
        // console.log("ChatBot.ctor " + commands);
        super();
        var self = this;
        secrets = new Secrets(secrets);
        var instance = this;
        this.commandManager = commandManager;

        // Define configuration options
        const opts = {
            identity: {
                username: username,
                password: secrets.tmi
            }
        };

        this.commandState = new Map();
        this.chatDelay = chatDelay;
        this.channels = new Set();

        // Create a client with our options
        this.client = new tmi.client(opts);

        // Register our event handlers (defined below)
        this.client.on('message', function (target, context, msg, isSelf) {
            instance.onMessageHandler.call(instance, target, context, msg, isSelf);
        });
        this.AddHandler("message", function (x) {
            instance.processCommand(x);
        }, true);
        this.client.on('connected', function (address, port) {
            instance.onConnectedHandler.call(instance, address, port);
        });

        // Connect to Twitch:
        this.client.connect();
    }

    joinChannel(name) {
        this.channels.add(name);
        return this.client.join(name);
    }

    leaveChannel(name) {
        if (this.channels.has(name)) {
            this.channels.delete(name);
            return this.client.part(name);
        } else {
            return Promise.resolve(null);
        }
    }

    addCommand(key, value) {
        this.commands.set(key, value);
    }

    enableCommand(key, value) {
        var command = this.commands.get(key);
        comand.enabled = true;
        this.commands.set(key, command);
    }

    disableCommand(key, value) {
        var command = this.commands.get(key);
        comand.enabled = false;
        this.commands.set(key, command);
    }

    // Called every time a message comes in
    onMessageHandler(target, context, msg, isSelf) {

        //example message
        /*
        interpreting chat
        #crimebastard

    {
        'badge-info': null,
        badges: {
        broadcaster: '1'
        },
        'client-nonce': 'e56934cc3a372a24f9b4a3acd94382c1',
        color: '#8A2BE2',
        'display-name': 'Crimebastard',
        emotes: {
        '116625': ['18-25'],
        '166263': ['27-35'],
        '305890916': ['37-46'],
        '555555584': ['15-16'],
        emotesv2_880ee86f4d544cab81ab9b609da2ed7e: ['48-59'],
        emotesv2_3b10f370b0e242e1a23f69e8b24c9f5c: ['2-13']
        },
        'first-msg': false,
        flags: null,
        id: 'c36f61ec-c947-435e-9e52-ab29306e66e8',
        mod: false,
        'returning-chatter': false,
        'room-id': '109465513',
        subscriber: false,
        'tmi-sent-ts': '1672998396672',
        turbo: false,
        'user-id': '109465513',
        'user-type': null,
        'emotes-raw': '305890916:37-46/emotesv2_880ee86f4d544cab81ab9b609da2ed7e:48-59/emotesv2_3b10f370b0e242e1a23f69e8b24c9f5c:2-13/555555584:15-16/116625:18-25/166263:27-35',
        'badge-info-raw': null,
        'badges-raw': 'broadcaster/1',
        username: 'crimebastard',
        'message-type': 'chat'
        }

        a beatclWiggle <3 CurseLit TwitchLit beatclLove beatclGLONKY
        false
         */

        // FileRepository.log(target, context.username, msg, self);
        // if (self) {
        // FileRepository.log("Ignore messages from the bot");

        // return;
        // } // Ignore messages from the bot

        this.ExecuteHandlers("message", {
            target: target,
            msg: msg,
            context: context,
            "self": isSelf,
            chatBot: this
        });
    }

    sendMessage(channel, text) {
        FileRepository.log("sendMessage " + channel + ": " + text);
        if (text && text.length > 0) {
            return this.client.say(channel, text);
        }
    }

    action(channel, text) {
        return this.client.action(channel, text);
    }

    sendMessages(channel, messages) {
        var self = this;
        if (messages.length > 0) {

            return messages.reduce(function (a, c, i, arr) {
                // return new Promise(function(resolve, reject){
                // setTimeout(function(){
                return a.then(function () {
                    return self.sendMessage(channel, c);
                })
                .then(function () {
                    return new Promise(function (resolve, reject) {
                        setTimeout(function () {
                            resolve();
                        }, self.chatDelay);
                    });
                });
                // resolve();
                // }, delay);
                // });
            }, Promise.resolve());
        } else {
            return null;

        }
    }

    // Called every time the bot connects to Twitch chat
    onConnectedHandler(addr, port) {
        FileRepository.log(`* Connected to ${addr}:${port}`);
    }
}
