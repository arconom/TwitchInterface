import { Constants } from "./Constants.mjs";

import { ChatCommand } from "./ChatCommand.mjs";

import { FileRepository } from "./FileRepository.mjs";
import { ChatCommandConfigItem } from "./ChatCommandConfigItem.mjs";
import { TwitchChatMessageContext } from './TwitchChatMessageContext.mjs';
import { ChatRoles } from './ChatRoles.mjs';
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
        // self.chatBot;
        self.app = app;
        // self.config = app.config;
        // self.oscManager = app.oscManager;
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

    toggleCommands() {
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
        FileRepository.log("ChatCommandManager.setCommandState " + id + " state " + JSON.stringify(state));
        this.commandState.set(id, state);
        FileRepository.saveCommandState(Array.from(this.commandState.entries()));
    }

    deleteCommandState(id) {
        this.commandState.delete(id);
        FileRepository.saveCommandState(Array.from(this.commandState.entries()));
    }

    async getCommandResult(chatMessage) {
        //obj = {
        // target: String,
        // msg: String,
        // context: TwitchChatMessageContext,
        // "self": boolean,
        // chatBot: Object<ChatBot>
        // }

        const self = this;
        // Remove whitespace from chat message
        const commandName = chatMessage.msg.trim();
        var match = commandName.match(Constants.commandRegex);
        FileRepository.log("getCommandResult:  " + commandName);

        if (match?.index === 0 && match[1]?.length > 0) {
            FileRepository.log("getCommandResult match found");
            // we are removing this in favour of using the config to store the actions
            // const chatCommand = self.commands.get(match[1]);
            const commandConfig = self.commandConfig.get(match[1]);

            if (!commandConfig) {
                return;
            }

            FileRepository.log("getCommandResult   commandConfig:  " + JSON.stringify(commandConfig));
            FileRepository.log("getCommandResult   commandConfig:  " + JSON.stringify(Array.from(self.commandConfig.entries())));

            // ["prroll", {
            // "key": "prroll",
            // "cooldownSeconds": 0,
            // "role": 0,
            // "enabled": true
            // }
            // ],

            if (!commandConfig?.enabled) {
                FileRepository.log("ChatCommandManager.getCommandResult command disabled " + commandName +
                    "\r\n" + JSON.stringify(commandConfig));
                return "";
            }

            let isMod = self.hasRole(chatMessage.context, Constants.chatRoles.moderator);
            let canPay = self.payForCommand(chatMessage, commandConfig);
            
            FileRepository.log("isMod " + isMod);
            FileRepository.log("canPay " + canPay);
            
            if (!isMod && !canPay) {
                return "not enough currency of type:  " + commandConfig.currencyType;
            }

            const key = chatMessage.target + match[1];
            let commandState = self.getCommandState(key);

            if (!commandState) {
                commandState = {};
            }

            let roleToCheck = self.commandsEnabledForViewers ?
                commandConfig?.role :
                Constants.chatRoles.broadcaster;

            let message = "";

            if (self.hasRole(chatMessage.context, roleToCheck)) {
                FileRepository.log("getCommandResult permission granted");
                if ((commandState.lastExecution ?? -Infinity) + (commandConfig.cooldownSeconds * 1000) < Date.now()) {
                    try {
                        FileRepository.log("getCommandResult executing command name: " + commandName);
                        // await chatCommand.handler(chatMessage);
                        for (let action of commandConfig?.actions) {
                            let result = self.doAction(chatMessage, action);

                            if (!!result) {
                                message += result + "\r\n";
                            }
                        }

                        commandState.executionCount = (commandState.executionCount ?? 0) + 1;
                        commandState.lastExecution = Date.now();
                        self.setCommandState(key, commandState);

                        return message;
                    } catch (e) {
                        FileRepository.log("getCommandResult failed while executing command: " + commandName);
                        FileRepository.log(e);
                    }
                } else {
                    return "Wait for command to cool down in " +
                    (commandState.lastExecution + (commandConfig.cooldownSeconds * 1000) - Date.now()) +
                    " ms";
                }
            }
            else
            {
                FileRepository.log("getCommandResult permission denied", roleToCheck);
            }
        }
    }

    doAction(chatMessage, action) {
        if (!action) {
            return;
        }

        let message = "";
        const self = this;
        FileRepository.log("doAction " + JSON.stringify(action));
        FileRepository.log("doAction globalState:  " +
            JSON.stringify(Array.from(self.app.globalState.keys())));
        let pluginAction = action.key.split(".");
        let pluginName = pluginAction[0];
        let actionName = pluginAction[1];

        const plugin = self.app.globalState.get(pluginName);
        const actionObj = plugin.actions?.get(actionName);


        FileRepository.log("doAction actions available:  " +
            JSON.stringify(plugin.actions));


        if (!!actionObj) {
            FileRepository.log("doAction action found:  " + JSON.stringify(actionObj));
            if (!!actionObj.handler) {
                FileRepository.log("typeof action.json:  " + action.json + " " + typeof(action.json));
                let json;

                if (typeof(action.json) === "object") {
                    json = action.json;
                } else if (typeof(action.json) === "string") {
                    try {
                        json = JSON.parse(action.json ?? actionObj.defaultJSON);
                    } catch (e) {
                        json = {};
                        // FileRepository.log("doAction error while parsing json:  \r\n" + e);
                    }
                }
                FileRepository.log(actionObj.name +
                    // "-  globalstate: " + JSON.stringify(self.app.globalState) +
                    // " message: " + Object.keys(chatMessage).join(", ") +
                    // " target: " + chatMessage.target +
                    // " msg: " + chatMessage.msg +
                    // " context: " + JSON.stringify(chatMessage.context) +
                    // " self: " + chatMessage.self +
                    // " chatbot: " + chatMessage.chatBot +
                    "\r\n args: " + chatMessage.args +
                    "\r\n json:  " + JSON.stringify(json));

                message += actionObj.handler(self.app.globalState, chatMessage, json) ?? "";

                // if (!!json.followOnAction) {
                // FileRepository.log("json.followOnAction", json.followOnAction);
                // message += " \r\n" + self.doAction(chatMessage, json.followOnAction, message);
                // }
            }
        } else {
            FileRepository.log("doAction action not found:  " + actionName);
        }
    }

    payForCommand(chatMessage, commandConfig) {
        const self = this;

        if (commandConfig.currencyType === "" || commandConfig.cost === 0) {
            FileRepository.log("ChatCommandManager.payForCommand no cost found: " +
                commandConfig.currencyType + " " +
                commandConfig.cost);
            return true;
        }

        let wallet = self.app.getWallet(chatMessage.context.userId, chatMessage.target);

        let cur = new Currency({
            name: commandConfig.currencyType,
            value: commandConfig.cost
        });

        FileRepository.log("ChatCommandManager.payForCommand wallet " + JSON.stringify(wallet));
        FileRepository.log("ChatCommandManager.payForCommand cur " + JSON.stringify(cur));

        if (wallet.hasCurrency(cur)) {
            wallet.subtractCurrency(cur);
        } else {
            //not enough cash
            return false;
        }

        return true;
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

    hasRole(context,  roleName) {
        //context = Object<TwitchChatMessageContext>
        //role = String
        
        
        const roleValue = (typeof roleName === "number") ? roleName : ChatRoles.get(roleName);
        FileRepository.log("hasRole " + JSON.stringify(context) + " " 
            + " roleName " + roleName + " " + 
            + " roleValue " + roleValue
        );

        var userRoleValue = ChatRoles.get(Constants.chatRoles.viewer);

        if (context.subscriber) {
            FileRepository.log("hasRole subscriber");
            userRoleValue = ChatRoles.get(Constants.chatRoles.subscriber);
        }

        if (context.badges?.moderator?.trim() === "1") {
            FileRepository.log("hasRole moderator");
            userRoleValue = ChatRoles.get(Constants.chatRoles.moderator);
        }

        if (context.badges?.broadcaster?.trim() === "1") {
            FileRepository.log("hasRole broadcaster");
            userRoleValue = ChatRoles.get(Constants.chatRoles.broadcaster);
        }

        if (context.badges?.vip?.trim() === "1") {
            FileRepository.log("hasRole vip");
            userRoleValue = ChatRoles.get(Constants.chatRoles.vip);
        }

        if (userRoleValue < roleName) {
            FileRepository.log("command access denied to user " + context.username + ".  Current role " + userRoleValue);

        }

        FileRepository.log("userRoleValue " + userRoleValue);
        FileRepository.log("roleValue " + roleValue);
        return userRoleValue >= roleValue;
    }
}
