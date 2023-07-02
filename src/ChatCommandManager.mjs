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

export default class ChatCommandManager {

    //manage a map of commands, each of which can have its own state per channel
    //because we are using a Map for commands,
    //setting the same command name twice will overwrite the first entry
    //this means that if you want a command to do two things,
    //just put those things in one function and then set it

    constructor(config, oscManager) {
        // config = Object<Config>
        // oscManager = Object<OscManager>
        // chatBot = Object<ChatBot>
        var self = this;
        this.chatBot;
        this.config = config;
        this.oscManager = oscManager;
        this.commands = new Map();
        this.pluginState = new Map();
        this.commandState = new Map();
        this.commandConfig = new Map();

        FileRepository.readCommandState().then(function (data) {
            try {
                var arr = JSON.parse(data);
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
                        self.setCommandConfig(chatCommandConfigItem[0], chatCommandConfigItem[1]);
                    });
                }
            }
        });
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

        //obj = {
        // target: String,
        // msg: String,
        // context: TwitchChatMessageContext,
        // "self": boolean,
        // chatBot: Object<ChatBot>
        // }

        var self = this;
        // Remove whitespace from chat message
        const commandName = obj.msg.trim();
        var match = commandName.match(Constants.commandRegex);

        if (match?.index === 0 && match[1]?.length > 0) {
            var chatCommand = this.commands.get(match[1]);
            var commandConfig = self.commandConfig.get(match[1]);

            if (!chatCommand) {
                return "";
            }
            var key = obj.target + match[1];
            var commandState = self.getCommandState(key);

            if (!commandState) {
                commandState = {};
            }

            if (self.hasRole(obj.context, commandConfig?.role)) {
                if ((commandState.lastExecution ?? -Infinity) + (commandConfig.cooldownSeconds * 1000) < Date.now()) {
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

        var userRoleValue = ChatRoles.get(Constants.chatRoles.viewer);

        if (context.subscriber) {
            userRoleValue = ChatRoles.get(Constants.chatRoles.subscriber);
        }

        if (context.mod) {
            userRoleValue = ChatRoles.get(Constants.chatRoles.moderator);
        }

        if (context.badges.broadcaster === " 1 ") {
            userRoleValue = ChatRoles.get(Constants.chatRoles.broadcaster);
        }

        if (context.badges.vip === " 1 ") {
            userRoleValue = ChatRoles.get(Constants.chatRoles.vip);
        }

        return userRoleValue >= role;
    }
}
