import DataAccess from "./dataAccess.mjs";
const dataAccess = new DataAccess();

import {
    ChatRoles
}
from './ChatRoles.mjs';
import {
    Constants
}
from "./Constants.mjs";

export const vueInstance = {
    data() {
        return {
            activeChannels: [],
            apiScopes: new Map(),
            botUserInfo: {},
            channel: "",
            channelMessages: new Map(),
            chatConnected: false,
            chatScopes: new Map(),
            chatCommandConfig: new Map(),
            chatCommandState: new Map(),
            chatCommands: new Map(),
            config: [],
            cost: 0,
            maxCost: 0,
            currentChannel: 0,
            currentTab: "chat",
            eventSubscriptionTypes: new Map(),
            eventSubscriptions: new Map(),
            eventSubStarted: false,
            message: "",
            oscMappings: new Map(),
            pluginConfig: new Map(),
            pubsubSubscriptions: [],
            savedChannels: new Set(),
            searchChatCommandConfig: "",
            searchApiScopes: "",
            searchConfig: "",
            searchEvents: "",
            searchOscMappings: "",
            searchUsers: "",
            searchPlugins: "",
            secrets: [],
            selectedEndpointKey: "",
            selectedEventSubscriptionKey: "channel.follow",
            selectedOscMappingKey: "/eventsub.message",
            snackbar: false,
            snackbarText: "",
            snackbarTimeout: 2000,
            twitchEndpoints: new Map(),
            users: new Map(),
            webSocket: null
        }
    },
    methods: {
        authenticate: function () {
            dataAccess.putOauth();
        },
        getRowColor: function (index) {
            if (index % 2 === 0) {
                // return "grey-darken-3";
                return "row-even";
            }
            // return "grey-darken-4";
            return "row-odd";
        },
        searchClickHandler: function (event) {
            event.stopPropagation();
            event.preventDefault();
        },
        saveApiScopesClickHandler: function (event) {
            event.stopPropagation();
            event.preventDefault();
            this.saveApiScopes();
        },
        refreshChatCommandStateClickHandler: function (event) {
            event.stopPropagation();
            event.preventDefault();
            this.getChatCommandState();
        },
        saveChatCommandStateClickHandler: function (event) {
            event.stopPropagation();
            event.preventDefault();
            this.saveChatCommandState();
        },
        savePluginConfigClickHandler: function (event) {
            event.stopPropagation();
            event.preventDefault();
            this.savePluginConfig();
        },
        saveEventSubscriptionsClickHandler: function (event) {
            event.stopPropagation();
            event.preventDefault();
            this.saveEventSubscriptions();
        },
        saveOscMappingsClickHandler: function (event) {
            event.stopPropagation();
            event.preventDefault();
            this.saveOscMappings();
        },
        saveChatCommandConfigClickHandler: function (event) {
            event.stopPropagation();
            event.preventDefault();
            this.saveChatCommandConfig();
        },
        updateChatCommandConfig: function (key, value) {
            console.log("updateChatCommandConfig", key, value);
            this.chatCommandConfig.set(key, value);
        },
        getChatCommandState: function () {
            var self = this;
            return dataAccess.getChatCommandState()
            .then(function (data) {
                var temp = self.chatCommandState;
                if (data?.length > 0) {
                    data.forEach(function (x) {
                        temp.set(x[0], x[1]);
                    });
                }
            })
            .catch(function (err) {
                console.log(err);
            });

        },
        saveChatCommandState: function () {
            var self = this;

            dataAccess.putChatCommandState(
                Array.from(self.chatCommandState.entries()))
            .then(function (data) {
                self.snackbar = true;
                self.snackbarText = "Chat command state saved";
            });
        },
        getChatCommandConfig: function () {
            var self = this;
            return dataAccess.getChatCommandConfig()
            .then(function (data) {
                var temp = self.chatCommandConfig;
                if (data?.length > 0) {
                    data.forEach(function (x) {
                        // this needs to be a number, so the v-select displays the string
                        x[1].role = parseInt(x[1].role);
                        temp.set(x[0], x[1]);
                    });
                }
                self.chatCommandConfig = temp;
            })
            .catch(function (err) {
                console.log(err);
            });

        },
        saveChatCommandConfig: function () {
            var self = this;

            return dataAccess.putChatCommandConfig(
                Array.from(self.chatCommandConfig.entries()))
            .then(function (data) {
                self.snackbar = true;
                self.snackbarText = "Chat command config saved";
            });
        },
        getEventSubCost: function () {
            var self = this;
            dataAccess.getEventSubCost().then(function (data) {
                self.cost = data.cost;
                self.maxCost = data.maxCost;
            });
        },
        deleteUser: function (key) {
            this.users.delete(key);
            this.snackbar = true;
            this.snackbarText = "User removed";
        },
        copyUser: function (key) {
            navigator.clipboard.writeText(key);
            this.snackbar = true;
            this.snackbarText = "Id copied";
        },
        saveApiScopes: function () {
            var self = this;
            var arr = [];

            for (const [key, value] of self.apiScopes.entries()) {

                if (value.value) {
                    arr.push(key);
                }
            }

            dataAccess.putActiveApiScopes(arr)
            .then(function (data) {
                self.snackbar = true;
                self.snackbarText = "Api scopes saved";
            });
        },
        saveChatScopes: function () {
            var self = this;
            var arr = [];

            for (const [key, value] of self.chatScopes.entries()) {

                if (value.value) {
                    arr.push(key);
                }
            }

            dataAccess.putActiveChatScopes(arr)
            .then(function (data) {
                self.snackbar = true;
                self.snackbarText = "Chat scopes saved";
            });
        },
        submitApiRequest: function () {
            var self = this;

            self.selectedEndpoint.key = this.selectedEndpointKey;

            dataAccess.useEndpoint(self.selectedEndpoint)
            .then(function (data) {
                if (self.selectedEndpoint.key === "getUserInfo") {
                    self.users.set(data[0].id, data[0]);
                }
            });
        },
        deleteConfig: function (index) {
            this.config.splice(index, 1);
        },
        updateConfig: function (index, item) {
            this.config[index] = {
                title: item.title,
                value: item.value
            };
        },
        saveConfig: function () {
            dataAccess.putConfig(this.config);
        },
        addChannel: function (channel) {
            this.savedChannels.add(channel);
            dataAccess.putBookmarkedChannels(Array.from(this.savedChannels.values()));
        },
        removeChannel: function (channel) {
            this.savedChannels.delete(channel);
            dataAccess.putBookmarkedChannels(Array.from(this.savedChannels.values()));
        },
        addConfig: function (item) {
            this.config.push(item);
        },
        deleteSecret: function (index) {
            this.secrets.splice(index, 1);
        },
        updateSecret: function (index, item) {
            this.secrets[index] = {
                title: item.title,
                value: item.value
            };
        },
        saveSecrets: function () {
            dataAccess.putSecrets(this.secrets);
        },
        addSecret: function (item) {
            this.secrets.push(item);
        },
        startEventSub: function () {
            var self = this;
            dataAccess.getStartEventSub()
            .then(function (data) {
                setTimeout(function () {
                    self.getEventSubCost();
                }, 1000);
                self.eventSubStarted = true;
                self.snackbar = true;
                self.snackbarText = "Event Sub started";
            });
        },
        endEventSub: function () {
            var self = this;
            dataAccess.getEndEventSub()
            .then(function (data) {
                self.eventSubStarted = false;
                self.snackbar = true;
                self.snackbarText = "Event Sub ended";
            });
        },
        startChat: function () {
            var self = this;

            if (!self.chatConnected) {
                return dataAccess.getStartChat()
                .then(function () {
                    self.chatConnected = true;
                })
                .then(function () {
                    setTimeout(function () {
                        self.savedChannels.forEach(function (x) {
                            self.joinChannel(x);
                        });
                    }, 1000);
                })
            }
        },
        leaveChannel: function () {
            var self = this;
            dataAccess.leaveChannel(self.activeChannels[self.currentChannel]).then(x => {
                self.snackbarText = "Left channel " + self.activeChannels[self.currentChannel];
                self.snackbar = true;
                self.activeChannels.splice(self.currentChannel, 1);
                self.currentChannel = 0;
            });
        },
        joinCurrentChannel: function () {
            this.joinChannel(this.channel);
        },
        joinChannel: function (channel) {
            var self = this;
            if (self.activeChannels.indexOf(channel) === -1) {
                dataAccess.joinChannel(channel).then(function (result) {
                    self.activeChannels.push(channel);
                    self.snackbarText = "Joined channel " + channel;
                    self.snackbar = true;
                }).catch(function (err) {
                    console.log('joinChannel err', err);
                });
            }
        },
        createWebSocket: function () {
            var self = this;

            self.webSocket = new WebSocket("ws://localhost:8080");
            self.webSocket.addEventListener('message', (event) => {

                var message;

                try {
                    message = JSON.parse(event.data);
                } catch (e) {}

                if (message && message.target) {

                    var temp = new Map(self.channelMessages);
                    var msgs = temp.get(message.target.substr(1));
                    if (!msgs) {
                        msgs = [];
                    }
                    msgs.unshift(message);
                    temp.set(message.target.substr(1), msgs);

                    self.channelMessages = temp;
                }
            });
        },
        saveOscMappings: function () {
            var arr = Array.from(this.oscMappings);

            return dataAccess.putOscEvents(arr)
            .then(function () {
                self.snackbarText = "OSC settings saved";
                self.snackbar = true;
            });
        },
        saveEventSubscriptions: function () {
            return dataAccess.updateSubscriptions(Array.from(this.eventSubscriptions.entries()))
            .then(function () {
                self.snackbarText = "Event subscriptions saved";
                self.snackbar = true;
            });
        },
        savePluginConfig: function () {
            return dataAccess.putPluginConfig(Array.from(this.pluginConfig.entries()))
            .then(function () {
                self.snackbarText = "Plugin Config saved.  Restart the bot to see the changes.";
                self.snackbar = true;
            });
        },
        setApiScopes: function (name, value) {
            var temp = this.apiScopes;
            var val = temp.get(name);
            val.value = value;
            this.apiScopes = temp;
        },
        setChatScopes: function (name, value) {
            var temp = this.chatScopes;
            var val = temp.get(name);
            val.value = value;
            this.chatScopes = temp;
        },
        setOscEvent: function (name, value) {
            var temp = this.oscMappings;
            temp.set(name, value);
            this.oscMappings = temp;
        },
        setPluginConfig: function (name, value) {
            var temp = this.pluginConfig;
            temp.set(name, value);
            this.pluginConfig = temp;
        },
        addEventSubscription: function () {
            this.selectedEventSubscriptionType.enabled = true;

            if (this.eventSubscriptions.has(this.selectedEventSubscriptionType.name)) {
                var list = this.eventSubscriptions.get(this.selectedEventSubscriptionType.name);
                list.push(this.selectedEventSubscriptionType);
                this.eventSubscriptions.set(this.selectedEventSubscriptionType.name, list);
            } else {
                this.eventSubscriptions.set(this.selectedEventSubscriptionType.name, [this.selectedEventSubscriptionType]);
            }

            this.saveEventSubscriptions();
        },
        setEventSubscription: function (key, index, value) {
            //because of the way we are rendering the list and storing the data,
            //the index doesn't point to the array index within the key,
            //so we have to count from the beginning until we reach the index.
            var counter = 0;

            for (var key of this.eventSubscriptions.keys()) {
                var list = this.eventSubscriptions.get(key);
                if (counter + list.length > index) {
                    list[index - counter].enabled = value;
                    return;
                } else {
                    counter += list.length;
                }
            }
        },
        removeEventSubscription: function (index) {
            //because of the way we are rendering the list and storing the data,
            //the index doesn't point to the array index within the key,
            //so we have to count from the beginning until we reach the index.
            var counter = 0;

            for (var key of this.eventSubscriptions.keys()) {
                var list = this.eventSubscriptions.get(key);
                if (counter + list.length > index) {
                    list.splice(index - counter, 1);
                    if (list.length === 0) {
                        this.eventSubscriptions.delete(key);
                    }
                    return;
                } else {
                    counter += list.length;
                }
            }
        },
        say: function () {
            dataAccess.say(this.activeChannels[this.currentChannel], this.message);
        },
        getChannelTabClass: function (i) {
            return "background-color: " +
            this.currentChannel === i ? "primary" : "secondary";
        },
        getMessageDisplay: function (item) {
            return item.context.username + ' : ' + item.msg;
        },
        getRoleDisplay: function (role) {
            var roleMap = new Map();

            roleMap.set(0, "viewer");
            roleMap.set(1, "vip");
            roleMap.set(2, "subscriber");
            roleMap.set(3, "moderator");
            roleMap.set(4, "broadcaster");

            return roleMap.get(role.toLowerCase());
        }

    },
    computed: {
        isAuthenticateButtonDisabled: function () {
            for (let i = 0; i < this.secrets.length; i++) {
                let item = this.secrets[i];

                if (item.title === "clientId" && item.value.length > 0) {
                    return false;
                }
            }
            return true;
        },
        configDisplay: function () {
            var self = this;
            return self.config.filter(function (x) {
                return x.title.indexOf(self.searchConfig) > -1 ||
                x.value.indexOf(self.searchConfig) > -1;
            });
        },

        pluginConfigDisplay: function () {
            return Array.from(this.pluginConfig.entries())
            .filter((x) =>
                Object.values(x).some((v) => typeof v === "string" ?
                    v.indexOf(this.searchPlugins) > -1
                     : false));
        },
        roles: function () {
            return Array.from(ChatRoles.entries()).map(x => {
                return {
                    title: x[0],
                    value: x[1]
                };
            });
        },
        userTableHeaders: function () {
            return [{
                    title: "Id",
                    align: "end",
                    key: "id"
                }, {
                    title: "Name",
                    align: "end",
                    key: "login"
                }, {
                    title: "Broadcaster Type",
                    align: "end",
                    key: "broadcaster_type"
                }, {
                    title: "Created On",
                    align: "end",
                    key: "created_on"
                }
            ];

        },

        twitchEndpointsDisplay: function () {
            var self = this;
            var arr = [];

            for (const [key, value] of self.twitchEndpoints) {
                arr.push({
                    title: value.name,
                    value: key
                });
            }

            return arr;
        },

        selectedEndpoint: function () {
            return this.twitchEndpoints.get(this.selectedEndpointKey) ?? {
                args: []
            };
        },

        selectedEventSubscriptionType: function () {
            return this.eventSubscriptionTypes.get(this.selectedEventSubscriptionKey) ?? {
                args: []
            };
        },

        navList: function () {
            return [{
                    title: "Chat",
                    value: "chat"
                }, {
                    title: "Config",
                    value: "config"
                },
            ];
        },
        currentChannelMessages: function () {
            var arr = Array.from(this.channelMessages.get(this.activeChannels[this.currentChannel]) ?? []);
            return arr.map(function (x) {
                return x.context.username + ": " + x.msg;
            });
        },
        chatScopesDisplay: function () {
            return Array.from(this.chatScopes)
            .map(function (x) {
                return {
                    name: x[0],
                    description: x[1].description,
                    value: x[1].value
                };
            });
        },
        chatCommandStateDisplay: function () {
            return Array.from(this.chatCommandState);
        },
        chatCommandConfigDisplay: function () {
            var self = this;

            var ret = Array.from(self.chatCommands.entries())
                .map(function (command, index, array) {
                    return Object.assign(command[1],
                        self.chatCommandConfig.get(command[0]));
                }).filter((x) =>
                    Object.values(x).some((v) => typeof v === "string" &&
                        v.indexOf(this.searchChatCommandConfig) > -1));

            return ret;
        },
        apiScopesDisplay: function () {
            return Array.from(this.apiScopes)
            .map(function (x) {
                return {
                    name: x[0],
                    description: x[1].description,
                    value: x[1].value
                };
            })
            .filter((x) =>
                Object.values(x).some((v) => typeof v === "string" &&
                    v.indexOf(this.searchApiScopes) > -1));
        },
        oscMappingsDisplay: function () {
            return Array.from(this.oscMappings)
            .map(function (x) {
                return {
                    name: x[0],
                    value: x[1]
                };
            }).filter((x) =>
                Object.values(x).some((v) => typeof v === "string" &&
                    v.indexOf(this.searchOscMappings) > -1));
        },
        eventSubscriptionTypesDisplay: function () {
            return Array.from(this.eventSubscriptionTypes.entries())
            .map(function (x, i) {
                return {
                    name: x[0],
                    value: x[1].name
                };
            });
        },
        usersDisplay: function () {
            return Array.from(this.users.entries())
            .map(function (x, i) {
                return x[1];
            })
            .filter((x) =>
                Object.values(x).some((v) => typeof v === "string" &&
                    v.indexOf(this.searchUsers) > -1));
        },

        eventSubscriptionsDisplay: function () {
            var self = this;
            var returnMe = [];
            var entries = Array.from(this.eventSubscriptions.entries());

            for (let i = 0; i < entries.length; i++) {
                var eventName = entries[i][0];
                var subData = entries[i][1];

                for (let j = 0; j < subData.length; j++) {

                    var pushMe = {
                        name: eventName,
                        value: subData[j].enabled
                    };

                    var keys = Object.keys(subData[j].condition);

                    //put the condition keys into the name
                    for (let k = 0; k < keys.length; k++) {
                        var name = self.users.get(subData[j].condition[keys[k]])?.display_name;
                        pushMe.name += " " + subData[j].condition[keys[k]];
                        if (name) {
                            pushMe.name += " (" + name + ")";
                        }
                    }

                    returnMe.push(pushMe);
                }
            }

            return returnMe.filter((x) =>
                Object.values(x).some((v) => typeof v === "string" ?
                    v.indexOf(this.searchEvents) > -1
                     : false));
        }
    },
    mounted: function () {
        var self = this;

        var initialDelay = 1000;

        setTimeout(function () {
            getBotInfo(null, initialDelay);
        }, initialDelay);

        function getBotInfo(data, delay) {
            //retry getting bot info with an increasing delay so we don't clog up the network
            dataAccess.getBotUserInfo()
            .then(function (data) {
                if (data) {
                    self.botUserInfo = data;

                    dataAccess.getSubscriptionTypes()
                    .then(function (data) {
                        var temp = self.eventSubscriptionTypes;
                        if (data?.length > 0) {
                            data.forEach(function (x) {

                                if (x[1].condition.hasOwnProperty("moderator_user_id")) {
                                    x[1].condition["moderator_user_id"] = self.botUserInfo["id"];
                                }

                                temp.set(x[0], x[1]);
                            });
                        }
                        self.eventSubscriptionTypes = temp;
                    })
                    .catch(function (err) {
                        console.log(err);
                    });
                } else {
                    delay *= 2;
                    setTimeout(function () {
                        getBotInfo(null, delay);
                    }, delay);
                }
            });
        }

        dataAccess.getSubscriptions()
        .then(function (data) {
            self.eventSubscriptions = new Map(data);
        })
        .catch(function (err) {
            console.log(err);
        });

        dataAccess.getOscMappings()
        .then(function (data) {
            var temp = self.oscMappings;
            if (data?.length > 0) {
                data.forEach(function (x) {

                    temp.set(x[0], x[1]);
                });
            }
            self.oscMappings = temp;
        })
        .catch(function (err) {
            console.log(err);
        });

        dataAccess.getActiveChannels()
        .then(function (data) {
            if (data?.length > 0) {
                data.forEach(function (x) {
                    self.activeChannels.push(x);
                });
                self.startChat();
            }
        });

        dataAccess.getConfig()
        .then(function (data) {
            if (data) {
                Object.keys(data).forEach(function (key) {
                    self.config.push({
                        title: key,
                        value: data[key]
                    });
                });
            }
        })
        .catch(function (err) {
            console.log(err);
        });

        dataAccess.getSecrets()
        .then(function (data) {
            if (data) {
                Object.keys(data).forEach(function (key) {
                    self.secrets.push({
                        title: key,
                        value: data[key]
                    });
                    if (!data.tmi || data.tmi?.length === 0) {
                        self.currentTab = "secrets";
                    }
                });
            }
        });

        dataAccess.getTwitchEndpoints()
        .then(function (data) {
            if (data) {
                self.twitchEndpoints = new Map(data);
            }
        });

        dataAccess.getApiScopes()
        .then(function (data) {
            var temp = self.apiScopes;
            if (data?.length > 0) {
                data.forEach(function (x) {
                    temp.set(x[0], {
                        description: x[1],
                        value: false
                    });
                });
            }
            self.apiScopes = temp;
        })
        .catch(function (err) {
            console.log(err);
        });

        dataAccess.getActiveApiScopes()
        .then(function (data) {
            var temp = self.apiScopes;

            if (data?.length > 0) {
                data.forEach(function (x) {
                    temp.set(x[0], x[1]);
                });
            }
            self.apiScopes = temp;
        })
        .catch(function (err) {
            console.log(err);
        });

        dataAccess.getChatScopes()
        .then(function (data) {
            var temp = self.chatScopes;
            if (data?.length > 0) {
                data.forEach(function (x) {
                    temp.set(x[0], {
                        description: x[1],
                        value: false
                    });
                });
            }
            self.chatScopes = temp;
        })
        .catch(function (err) {
            console.log(err);
        });

        dataAccess.getActiveChatScopes()
        .then(function (data) {
            var temp = self.chatScopes;
            if (data?.length > 0) {
                data.forEach(function (x) {
                    var val = temp.get(x);
                    val.value = true;
                    temp.set(x, val);
                });
            }
            self.chatScopes = temp;
        })
        .catch(function (err) {
            console.log(err);
        });

        dataAccess.getSavedUsers()
        .then(function (data) {
            if (data?.length > 0) {
                self.users = new Map(data);
            }
        });

        dataAccess.getBookmarkedChannels().then(function (data) {
            if (data?.length > 0) {
                self.savedChannels = new Set(JSON.parse(data));
            }
        });

        dataAccess.getPluginConfig()
        .then(function (data) {
            var temp = self.pluginConfig;
            if (data?.length > 0) {
                data.forEach(function (x) {
                    temp.set(x[0], x[1]);
                });
            }
            self.pluginConfig = temp;
        })
        .catch(function (err) {
            console.log(err);
        });

        dataAccess.getChatCommands()
        .then(function (data) {
            var temp = self.chatCommands;
            if (data?.length > 0) {
                data.forEach(function (x) {
                    temp.set(x[0], x[1]);
                });
            }
            self.chatCommands = temp;
        })
        .then(function () {
            self.getChatCommandState();
        })
        .then(function () {
            self.getChatCommandConfig();
        })
        .catch(function (err) {
            console.log(err);
        });

        self.createWebSocket();
    }
};
