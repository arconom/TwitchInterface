import {
    Constants
}
from "./Constants.mjs";

import {
    ChatCommand
}
from "./ChatCommand.mjs";

import {
    FileRepository
}
from "./FileRepository.mjs";
import {
    ChatCommandConfigItem
}
from "./ChatCommandConfigItem.mjs";
import {
    TwitchChatMessageContext
}
from './TwitchChatMessageContext.mjs';
import {
    ChatRoles
}
from './ChatRoles.mjs';
import Currency from './Currency.mjs';

export default class ChatCommandManager {

    //manage a map of commands, each of which can have its own state per channel
    //because we are using a Map for commands,
    //setting the same command name twice will overwrite the first entry
    //this means that if you want a command to do two things,
    //just put those things in one function and then set it

    constructor(app) {
        // config = Object<Config>
        // oscManager = Object<OscManager>
        // chatBot = Object<ChatBot>
        var self = this;
        self.chatBot;
        self.app = app;
        self.config = app.config;
        self.oscManager = app.oscManager;
        self.commands = new Map();
        self.commandsEnabledForViewers = true;
        self.pluginState = new Map();
        self.commandState = new Map();
        self.commandConfig = new Map();

        FileRepository.readCommandState().then(function (data) {
            try {
                var arr = JSON.parse(data, Constants.reviver);
                for (let i = 0; i < arr.length; i++) {
                    self.commandState.set(arr[i][0], arr[i][1]);
                }
            } catch (e) {
                //no state data saved
            }
        });

        FileRepository.readChatCommandConfig()
        .then(function (data) {
            if (data) {
                var commandConfigArray = JSON.parse(data);

                if (commandConfigArray.length > 0) {
                    commandConfigArray.forEach(function (chatCommandConfigItem) {
                        // FileRepository.log("ChatCommandManager.constructor chatCommandConfigItem " + JSON.stringify(chatCommandConfigItem[1]));

                        self.setCommandConfig(chatCommandConfigItem[0], chatCommandConfigItem[1]);
                    });
                }
            }
        });
    }

    toggleCommands(){
        const self = this;
        self.commandsEnabledForViewers = !self.commandsEnabledForViewers;
    }

    getCommandConfig(key) {
        return this.commandConfig.get(key);
    }

    setCommandConfig(key, value) {
        this.commandConfig.set(key, new ChatCommandConfigItem(value));
    }

    setCommand(name, command) {
        // FileRepository.log("ChatCommandManager.setCommand " + name);
        this.commands.set(name, new ChatCommand(command));
    }

    removeCommand(name) {
        this.commands.delete(name);
    }

    setPluginState(key, value) {
        this.pluginState.set(key, value);
    }

    removePluginState(key) {
        this.pluginState.delete(key);
    }

    hasCommandState(id) {
        return this.commandState.has(id);
    }

    getCommandState(id) {
        return this.commandState.get(id);
    }

    setCommandState(id, state) {
        this.commandState.set(id, state);
        FileRepository.saveCommandState(Array.from(this.commandState.entries()));
    }

    deleteCommandState(id) {
        this.commandState.delete(id);
        FileRepository.saveCommandState(Array.from(this.commandState.entries()));
    }

    getCommandResult(obj) {
        //FileRepository.log("getCommandResult " + obj.msg);

        //obj = {
        // target: String,
        // msg: String,
        // context: TwitchChatMessageContext,
        // "self": boolean,
        // chatBot: Object<ChatBot>
        // }

        const self = this;
        // Remove whitespace from chat message
        const commandName = obj.msg.trim();
        var match = commandName.match(Constants.commandRegex);
        FileRepository.log("getCommandResult:  " + commandName);

        if (match?.index === 0 && match[1]?.length > 0) {
            FileRepository.log("getCommandResult match found");
            const chatCommand = self.commands.get(match[1]);
            const commandConfig = self.commandConfig.get(match[1]);

            // ["prroll", {
            // "key": "prroll",
            // "cooldownSeconds": 0,
            // "role": 0,
            // "enabled": true
            // }
            // ],

            if (!chatCommand || !commandConfig.enabled) {
                FileRepository.log("ChatCommandManager.getCommandResult command disabled " + commandName);
                return "";
            }

            if (commandConfig.currencyType !== "" && commandConfig.cost > 0) {
                let wallet = self.app.getWallet(obj.context.userId, obj.target);

                let cur = new Currency({
                    name: commandConfig.currencyType,
                    value: commandConfig.cost
                });

                if (wallet.hasCurrency(cur)) {
					wallet.subtractCurrency(cur);
				}
				else{
					//not enough cash
					return "not enough " + commandConfig.currencyType;
				}
            }

            const key = obj.target + match[1];
            let commandState = self.getCommandState(key);

            if (!commandState) {
                commandState = {};
            }

            let roleToCheck = self.commandsEnabledForViewers ? commandConfig?.role : ChatRoles.get(Constants.chatRoles.broadcaster);

            if (self.hasRole(obj.context, roleToCheck)) {
                FileRepository.log("getCommandResult permission granted");
                if ((commandState.lastExecution ?? -Infinity) + (commandConfig.cooldownSeconds * 1000) < Date.now()) {
                    FileRepository.log("getCommandResult executing command");
                    commandState.executionCount = (commandState.executionCount ?? 0) + 1;
                    commandState.lastExecution = Date.now();
                    self.setCommandState(key, commandState);
                    return chatCommand.handler(obj);
                } else {
                    return "Wait for command to cool down in " +
                    (commandState.lastExecution + (commandConfig.cooldownSeconds * 1000) - Date.now()) +
                    " ms";
                }
            }
        }
    }

    getCommandDescriptions() {
        return Array.from(this.commands.entries().map(function (x) {
                return x[0] + "\r\n" +
                x[1].description + "\r\n" +
                x[1].cooldown + "\r\n" +
                x[1].lastExecution + "\r\n" +
                x[1].role + "\r\n" +
                x[1].enabled + "\r\n";
            })).join("\r\n");
    }

    hasRole(context, role) {
        //context = Object<TwitchChatMessageContext>
        //role = String

        FileRepository.log("hasRole " + JSON.stringify(context) + " " + role);

        var userRoleValue = ChatRoles.get(Constants.chatRoles.viewer);

        if (context.subscriber) {
            FileRepository.log("hasRole subscriber");
            userRoleValue = ChatRoles.get(Constants.chatRoles.subscriber);
        }

        if (context.mod) {
            FileRepository.log("hasRole moderator");
            userRoleValue = ChatRoles.get(Constants.chatRoles.moderator);
        }

        if (context.badges.broadcaster === "1") {
            FileRepository.log("hasRole broadcaster");
            userRoleValue = ChatRoles.get(Constants.chatRoles.broadcaster);
        }

        if (context.badges.vip === " 1 ") {
            FileRepository.log("hasRole vip");
            userRoleValue = ChatRoles.get(Constants.chatRoles.vip);
        }

        if (userRoleValue < role) {
            FileRepository.log("command access denied to user " + context.username + ".  Current role " + userRoleValue);

        }

        return userRoleValue >= role;
    }
}
