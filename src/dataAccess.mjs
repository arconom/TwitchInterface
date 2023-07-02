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

    getPluginConfig() {
        var self = this;
        return fetch(this.hostname + "/plugin/config").then(function (res) {
            return res.json();
			//should be Array.from(Map.entries())
        })
        .catch(function (e) {
            console.log(e);
        });

    }
    getPluginList() {
        var self = this;
        return fetch(this.hostname + "/plugin").then(function (res) {
            return res.json();
			//should be Array.from(Map.entries())
        })
        .catch(function (e) {
            console.log(e);
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

    getStartChat() {
        var self = this;
        return fetch(this.hostname + "/chat/start").then(function (res) {
            return res.json();
        })
        .catch(function (e) {
            console.log(e);
        });

    }
    getActiveChannels() {
        var self = this;
        return fetch(this.hostname + "/chat/channels").then(function (res) {
            return res.json();
        })
        .catch(function (e) {
            console.log(e);
        });

    }
    getBookmarkedChannels() {
        var self = this;
        return fetch(this.hostname + "/chat/channels/saved").then(function (res) {
            return res.json();
        })
        .catch(function (e) {
            console.log(e);
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

    leaveChannel(channel) {
        var self = this;
        return fetch(this.hostname + "/chat/leave?channel=" + channel).then(function (res) {
            return res.json();
        })
        .catch(function (e) {
            console.log(e);
        });

    }
    joinChannel(channel) {
        var self = this;
        return fetch(this.hostname + "/chat/join?channel=" + channel).then(function (res) {
            return res.json();
        })
        .catch(function (e) {
            console.log(e);
        });

    }
    getUserInfoById(id) {
        var self = this;
        return fetch(this.hostname + "/user?id=" + id).then(function (res) {
            return res.json();
        })
        .catch(function (e) {
            console.log(e);
        });
    }
    getUserInfoByLogin(login) {
        var self = this;
        return fetch(this.hostname + "/user?login=" + login).then(function (res) {
            return res.json();
        })
        .catch(function (e) {
            console.log(e);
        });
    }
    getBotUserInfo() {
        var self = this;
        return fetch(this.hostname + "/user/bot")
		.then(function (res) {
            return res.json();
        })
        .catch(function (e) {
            console.log(e);
        });
    }
    getChatters(broadcasterId, moderatorId) {
        var self = this;
        return fetch(this.hostname + "/chatters?broadcasterid=" + broadcasterId + "&moderatorid=" + moderatorId).then(function (res) {
            return res.json();
        })
        .catch(function (e) {
            console.log(e);
        });

    }
    getSubscriptionTypes() {
        var self = this;
        return fetch(this.hostname + "/subscription/types").then(function (res) {
            return res.json();
        })
        .catch(function (e) {
            console.log(e);
        });

    }
    getSubscriptions() {
        var self = this;
        return fetch(this.hostname + "/subscriptions/configuration").then(function (res) {
            return res.json();
        })
        .catch(function (e) {
            console.log(e);
        });

    }
    getStartEventSub() {
        var self = this;
        return fetch(this.hostname + "/eventsub/start").then(function (res) {
            return res.json();
        })
        .catch(function (e) {
            console.log(e);
        });

    }
    getEventSubCost() {
        var self = this;
        return fetch(this.hostname + "/eventsub/cost").then(function (res) {
            return res.json();
        })
        .catch(function (e) {
            console.log(e);
        });

    }
    getEndEventSub() {
        var self = this;
        return fetch(this.hostname + "/eventsub/end").then(function (res) {
            return res.json();
        })
        .catch(function (e) {
            console.log(e);
        });

    }
    getActiveSubscriptions() {
        var self = this;
        return fetch(this.hostname + "/subscriptions/active").then(function (res) {
            return res.json();
        })
        .catch(function (e) {
            console.log(e);
        });

    }
    getOscMappings() {
        var self = this;
        return fetch(this.hostname + "/oscmappings").then(function (res) {
            return res.json();
        })
        .catch(function (e) {
            console.log(e);
        });

    }
    getSecrets() {
        var self = this;
        return fetch(this.hostname + "/secrets").then(function (res) {
            return res.json();
        })
        .catch(function (e) {
            console.log(e);
        });
    }
    getApiScopes() {
        var self = this;
        return fetch(this.hostname + "/api/scopes").then(function (res) {
            return res.json();
        })
        .catch(function (e) {
            console.log(e);
        });
    }
    getActiveApiScopes() {
        var self = this;
        return fetch(this.hostname + "/api/scopes/active").then(function (res) {
            return res.json();
        })
        .catch(function (e) {
            console.log(e);
        });
    }
    getChatScopes() {
        var self = this;
        return fetch(this.hostname + "/chat/scopes").then(function (res) {
            return res.json();
        })
        .catch(function (e) {
            console.log(e);
        });
    }
    getChatCommands() {
        var self = this;
        return fetch(this.hostname + "/chat/commands").then(function (res) {
            return res.json();
        })
        .catch(function (e) {
            console.log(e);
        });
    }
    getChatCommandState() {
        var self = this;
        return fetch(this.hostname + "/chat/commandstate").then(function (res) {
            return res.json();
        })
        .catch(function (e) {
            console.log(e);
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

        return fetch(this.hostname + "/users/saved/" + id, {
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
