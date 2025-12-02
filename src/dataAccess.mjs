export default class dataAccess {

    constructor() {
        this.hostname = "http://127.0.0.1:6969";
    }

	putOauth(){
        var self = this;
        return fetch(this.hostname + "/app/oauth", {method: "PUT"})
        .catch(function (e) {
            console.log(e);
        });
	}

    putActiveApiScopes(apiScopes) {

        if (!apiScopes) {
            return;
        }

        return fetch(this.hostname + "/api/scopes/active", {
            method: 'PUT', // *GET, POST, PUT, DELETE, etc.
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(apiScopes) // body data type must match "Content-Type" header
        });
    }

    putPluginConfig(config) {

		//config = Array.from(Map.entries())

        if (!config) {
            return;
        }

        return fetch(this.hostname + "/plugin/config", {
            method: 'PUT', // *GET, POST, PUT, DELETE, etc.
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(config) // body data type must match "Content-Type" header
        });
    }

    putActiveChatScopes(chatScopes) {

        if (!chatScopes) {
            return;
        }

        return fetch(this.hostname + "/chat/scopes/active", {
            method: 'PUT', // *GET, POST, PUT, DELETE, etc.
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(chatScopes) // body data type must match "Content-Type" header
        });
    }

    putSecrets(secrets) {

        if (!secrets) {
            return;
        }

        return fetch(this.hostname + "/secrets", {
            method: 'PUT', // *GET, POST, PUT, DELETE, etc.
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(secrets) // body data type must match "Content-Type" header
        });
    }

    putConfig(config) {
        if (!config) {
            return;
        }

        return fetch(this.hostname + "/config", {
            method: 'PUT', // *GET, POST, PUT, DELETE, etc.
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(config) // body data type must match "Content-Type" header
        });
    }
    putOscEvents(events) {

        if (!events) {
            return;
        }

        return fetch(this.hostname + "/oscmappings", {
            method: 'PUT', // *GET, POST, PUT, DELETE, etc.
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(events) // body data type must match "Content-Type" header
        });
    }

    updateSubscriptions(events) {
        if (!events) {
            return;
        }

        return fetch(this.hostname + "/subscriptions/configuration", {
            method: 'PUT', // *GET, POST, PUT, DELETE, etc.
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(events) // body data type must match "Content-Type" header
        });
    }
    putBookmarkedChannels(channels) {
        if (!channels) {
            return;
        }

        return fetch(this.hostname + "/chat/channels/saved", {
            method: 'PUT', // *GET, POST, PUT, DELETE, etc.
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(channels) // body data type must match "Content-Type" header
        });
    }

    getPluginConfig() {
        return this.getFile("/plugin/config");
    }
    getPluginList() {
        return this.getFile("/plugin");
    }
    getStartChat() {
        return this.getFile("/chat/start");
    }
    getActiveChannels() {
        return this.getFile("/chat/channels");
    }
    getAvailableActions() {
        return this.getFile("/actions");
    }
    getBookmarkedChannels() {
        return this.getFile("/chat/channels/saved");
    }
    leaveChannel(channel) {
        return this.getFile("/chat/leave?channel=" + channel);
    }
    joinChannel(channel) {
        return this.getFile("/chat/join?channel=" + channel);
    }
    getUserInfoById(id) {
        return this.getFile("/user?id=" + id);
    }
    getUserInfoByLogin(login) {
        return this.getFile("/user?login=" + login);
    }
    getBotUserInfo() {
        return this.getFile("/user/bot");
    }
    getChatters(broadcasterId, moderatorId) {
        return this.getFile("/chatters?broadcasterid=" + broadcasterId + "&moderatorid=" + moderatorId);
    }
    getSubscriptionTypes() {
        return this.getFile("/subscription/types");
    }
    getSubscriptions() {
        return this.getFile("/subscriptions/configuration");
    }
    getStartEventSub() {
        return this.getFile("/eventsub/start");
    }
    getEventSubCost() {
        return this.getFile("/eventsub/cost");
    }
    getEndEventSub() {
        return this.getFile("/eventsub/end");
    }
    getActiveSubscriptions() {
        return this.getFile("/subscriptions/active");
    }
    getOscMappings() {
        return this.getFile("/oscmappings");
    }
    getSecrets() {
        return this.getFile("/secrets");
    }
    getApiScopes() {
        return this.getFile("/api/scopes");
    }
    getActiveApiScopes() {
        return this.getFile("/api/scopes/active");
    }
    getChatScopes() {
        return this.getFile("/chat/scopes");
    }
    //todo remove this if not needed later
/*  
    getChatCommands() {
        const self = this;
        return fetch(this.hostname + "/chat/commands").then(function (res) {
            return res.json();
        })
        .catch(function (e) {
            console.log(e);
        });
    }
*/    
    toggleChatCommands() {
        const self = this;

        return fetch(this.hostname + "/chat/commands/toggle", {
            method: 'POST', // *GET, POST, PUT, DELETE, etc.
            headers: {
                'Content-Type': 'application/json'
            }
        }).catch(function (e) {
            //console.log(e);
        });
    }
    getChatCommandState() {
        return this.getFile("/chat/commandstate");
    }
    getCurrencies() {
        return this.getFile("/currencies");
    }
    putCurrencies(data) {
        return this.putFile("/currencies", data);
    }
    getVariables() {
        return this.getFile("/variables");
    }
    putVariables(data) {
        return this.putFile("/variables", data);
    }
    getRepeatingMessages() {
        return this.getFile("/chat/repeatingmessages");
    }
    getFile(path)
    {
        var self = this;
        return fetch(this.hostname + path).then(function (res) {
            return res.json();
        })
        .catch(function (e) {
            console.log(e);
        });
    }

    putFile(path, data)
    {
        console.log("putFile", path, JSON.stringify(data));
        
        var self = this;
        if (!data) {
            return;
        }

        return fetch(self.hostname + path, {
            method: 'PUT', // *GET, POST, PUT, DELETE, etc.
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data) // body data type must match "Content-Type" header
        });
    }

    putRepeatingMessages(list) {
        if (!list) {
            return;
        }

        return fetch(this.hostname + "/chat/repeatingmessages", {
            method: 'PUT', // *GET, POST, PUT, DELETE, etc.
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(list) // body data type must match "Content-Type" header
        });
    }

    toggleRepeatingMessage(id) {
        return fetch(this.hostname + "/chat/repeatingmessages/toggle", {
            method: 'POST', // *GET, POST, PUT, DELETE, etc.
            headers: {
                'Content-Type': 'application/json'
            },
			body: JSON.stringify({id: id})
        });
    }

    deleteRepeatingMessage(id) {
        return fetch(this.hostname + "/chat/repeatingmessages?id=" + id, {
            method: 'DELETE', // *GET, POST, PUT, DELETE, etc.
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }

    getChatCommandConfig() {
        var self = this;
        return fetch(this.hostname + "/chat/command/config").then(function (res) {
            return res.json();
        })
        .catch(function (e) {
            console.log(e);
        });
    }
    putChatCommandConfig(config) {
        var self = this;
        return fetch(this.hostname + "/chat/command/config", {
            method: 'PUT', // *GET, POST, PUT, DELETE, etc.
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(config) // body data type must match "Content-Type" header
        });



    }
    getActiveChatScopes() {
        var self = this;
        return fetch(this.hostname + "/chat/scopes/active").then(function (res) {
            return res.json();
        })
        .catch(function (e) {
            console.log(e);
        });
    }
    getConfig() {
        var self = this;
        return fetch(this.hostname + "/config")
        .then(function (res) {
            return res.json();
        })
        .catch(function (e) {
            console.log(e);
        });
    }

    getTwitchEndpoints() {
        var self = this;
        return fetch(this.hostname + "/twitchendpoints")
        .then(function (res) {
            return res.json();
        })
        .catch(function (e) {
            console.log(e);
        });
    }

    getSavedUsers() {
        var self = this;
        return fetch(this.hostname + "/user")
        .then(function (res) {
            return res.json();
        })
        .catch(function (e) {
            console.log(e);
        });
    }
    
	deleteSavedUser(id) {
        var self = this;

        return fetch(this.hostname + "/users/saved?id=" + id, {
            method: 'DELETE', // *GET, POST, PUT, DELETE, etc.
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(function (res) {
            return res.json();
        })
        .catch(function (e) {
            console.log(e);
        });
    }


    useEndpoint(args) {
        var self = this;

        return fetch(this.hostname + "/api", {
            method: 'POST', // *GET, POST, PUT, DELETE, etc.
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(args) // body data type must match "Content-Type" header
        })
        .then(function (res) {
			return res.json();
        })
        .catch(function (e) {
            console.log(e);
        });
    }

    say(channel, message) {

        var data = {
            "channel": channel,
            "message": message
        };

        fetch(this.hostname + "/chat/say", {
            method: 'POST', // *GET, POST, PUT, DELETE, etc.
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data) // body data type must match "Content-Type" header
        });
    }

    readResponse(response) {
        var self = this;
        const reader = response.body.getReader();
        return new ReadableStream({
            start(controller) {
                return pump();
                function pump() {
                    return reader.read().then(({
                            done,
                            value
                        }) => {
                        // When no more data needs to be consumed, close the stream
                        if (done) {
                            controller.close();
                            return;
                        }
                        // Enqueue the next data chunk into our target stream
                        controller.enqueue(value);
                        return pump();
                    });
                }
            }
        })
        .then(function (res) {
            return res.json();
        })
        .catch(function (e) {
            console.log(e);
        });
    }
}
