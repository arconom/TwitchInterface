import WebSocket from "ws";
import {
    Constants
}
from "./Constants.mjs";
import OAuthProvider from "./OAuthProvider.mjs";
import {
    Secrets
}
from "./Secrets.mjs";
import {
    UInt8ToString,
	ObjectToQuerystring
}
from "./Utility.mjs";
import {FileRepository} from "./FileRepository.mjs";

export default class TwitchAPIProvider {

    constructor(OAuthProvider) {
        var self = this;
		this.baseUri = "https://api.twitch.tv/helix/";

        this.oAuthProvider = OAuthProvider;
        this.retries = 0;
        this.maxRetries = 3;
        this.user = {};
        this.forceVerify = "";
        this.state = null;
		
		
    }

    getHeaders() {
		var self = this;
        return {
            'Content-Type': 'application/json',
            // 'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': self.oAuthProvider.getAuthorizationHeader(),
            'Client-Id': self.oAuthProvider.clientId
        };
    }

    getReader(rb, callback) {
        FileRepository.log( "TwitchAPIProvider.getReader", rb);

        if (rb && rb.getReader) {
            const reader = rb.getReader();

            FileRepository.log( "TwitchAPIProvider.getReader returning reader", reader);
            return new ReadableStream({
                start(controller) {
                    // The following function handles each data chunk
                    function push() {
                        // "done" is a Boolean and value a "Uint8Array"
                        reader.read().then(({
                                done,
                                value
                            }) => {
                            // If there is no more data to read
                            if (done) {
                                controller.close();
                                return;
                            }
                            // Get the data and send it to the browser via the controller
                            controller.enqueue(value);

                            callback(value);
                            // Check chunks by logging to the console
                            // FileRepository.log(done, value);
                            push();
                        });
                    }

                    push();
                },
            });
        } else {
            FileRepository.log( "TwitchAPIProvider.getReader returning ", rb);
            return rb;
        }

    }


			
    getUserInfo(args, callback) {
        FileRepository.log( "getUserInfo", args);
        var self = this;
        var url = this.baseUri + "users" + ObjectToQuerystring(args);
        var requestOptions = {
            method: 'GET', // *GET, POST, PUT, DELETE, etc.
            headers: self.getHeaders()
        };
        return self.requestJson(url, requestOptions, callback);
    }

    getSubscriptions(args, callback) {
        FileRepository.log( "TwitchAPIProvider.getSubscriptions");
        var self = this;
        var url = this.baseUri + `eventsub/subscriptions`
            var requestOptions = {
            method: 'GET', // *GET, POST, PUT, DELETE, etc.
            headers: self.getHeaders()
        };

        return self.requestJson(url, requestOptions, callback);
    }

    createClip(args, callback) {
        FileRepository.log( "TwitchAPIProvider.createClip");
        var self = this;
        var url = this.baseUri + `clips` + ObjectToQuerystring(args);
		
        var requestOptions = {
            method: 'POST', // *GET, POST, PUT, DELETE, etc.
            headers: self.getHeaders()
        };

        return self.requestJson(url, requestOptions, callback);
    }

    getClips(args, callback) {
        FileRepository.log( "TwitchAPIProvider.createClip");
        var self = this;
        var url = this.baseUri + `clips` + ObjectToQuerystring(args);

        var requestOptions = {
            method: 'POST', // *GET, POST, PUT, DELETE, etc.
            headers: self.getHeaders()
        };

        return self.requestJson(url, requestOptions, callback);
    }

    shoutout(args, callback) {
        FileRepository.log( "TwitchAPIProvider.shoutout");
        var self = this;
        var url = this.baseUri + `chat/shoutouts` + ObjectToQuerystring(args);
		
        var requestOptions = {
            method: 'POST', // *GET, POST, PUT, DELETE, etc.
            headers: self.getHeaders()
        };

        return self.requestJson(url, requestOptions, callback);
    }

    getCurrentTrack(args, callback) {
        FileRepository.log( "TwitchAPIProvider.getCurrentTrack");
        var self = this;
        var url = this.baseUri + `soundtrack/current_track` + ObjectToQuerystring(args);
		
        var requestOptions = {
            method: 'GET', // *GET, POST, PUT, DELETE, etc.
            headers: self.getHeaders()
        };

        return self.requestJson(url, requestOptions, callback);
    }

    createStreamMarker(args, callback) {
        FileRepository.log( "TwitchAPIProvider.createStreamMarker");
        var self = this;
        var url = this.baseUri + `streams/markers` + ObjectToQuerystring(args);
		
        var requestOptions = {
            method: 'POST', // *GET, POST, PUT, DELETE, etc.
            headers: self.getHeaders()
        };

        return self.requestJson(url, requestOptions, callback);
    }

    getPlaylist(args, callback) {
        FileRepository.log( "TwitchAPIProvider.getPlaylist");
        var self = this;
        var url = this.baseUri + `soundtrack/current_track` + ObjectToQuerystring(args);

		if(first){
			url += "&first=" + first;
		}
		if(after){
			url += "&after=" + after;
		}
		
        var requestOptions = {
            method: 'GET', // *GET, POST, PUT, DELETE, etc.
            headers: self.getHeaders()
        };

        return self.requestJson(url, requestOptions, callback);
    }

	createPoll(args, callback) {
        FileRepository.log( "TwitchAPIProvider.createStreamMarker");
        var self = this;
        var url = this.baseUri + `polls`;
		
        var requestOptions = {
            method: 'POST', // *GET, POST, PUT, DELETE, etc.
            headers: self.getHeaders(),
			body: JSON.stringify(args)
        };

        return self.requestJson(url, requestOptions, callback);
    }


    getPolls(args, callback) {
        var self = this;
        var url = this.baseUri + `polls` + ObjectToQuerystring(args);

        var requestOptions = {
            method: 'GET', // *GET, POST, PUT, DELETE, etc.
            headers: self.getHeaders()
        };

        return self.requestJson(url, requestOptions, callback);
    }

    getChatters(args, callback) {
        FileRepository.log( "getChatters");
        var self = this;

        if (!broadcasterId) {
            broadcasterId = self.user.id;
        }

        if (!moderatorId) {
            moderatorId = self.user.id;
        }

        // self.state = self.oAuthProvider.getState();

        var url = this.baseUri + `chat/chatters` + ObjectToQuerystring(args);

        var requestOptions = {
            method: 'GET', // *GET, POST, PUT, DELETE, etc.
            headers: self.getHeaders()
        };

        return self.requestJson(url, requestOptions, callback);
    }

    login(args, callback) {
        FileRepository.log("login");
        var self = this;
        var url = `https://www.twitch.tv/login`;
        var requestOptions = {
            method: 'GET', // *GET, POST, PUT, DELETE, etc.
            headers: self.getHeaders()
        };

        FileRepository.log( "requesting login", url, requestOptions);
        return fetch(url, requestOptions)
        .catch(function (e) {
            self.server.close();
        })
        .then((res) => res.body)
        .then(function (r) {
            return self.getReader(r, UInt8ToString);
        });
    }

    requestJson(url, requestOptions, callback) {
        var self = this;

        return self.oAuthProvider.validateAccess(function () {
            FileRepository.log( "request json after validate");
            self.state = self.oAuthProvider.getState();

            requestOptions.headers.Authorization = self.oAuthProvider.getAuthorizationHeader();
            requestOptions.headers["Client-Id"] = self.oAuthProvider.clientId;

            if (requestOptions.headers.Authorization !== null && requestOptions.headers.Authorization !== undefined) {

                FileRepository.log( "request json" + url + " " + requestOptions);
                return fetch(url, requestOptions)
                .then((res) => {
                    return res.json();
                })
                .then((res) => {
					// FileRepository.log("requestJson res", res);
					if (res.data) {
						FileRepository.log("requestJson response" + res.data);
						self.user = res.data;
					}
					return Promise.resolve(res.data);
				})
                .then(function (data) {
					if (typeof callback === "function") {
						return callback(data);
					}
					return Promise.resolve(null);
                })
                .catch(function (e) {
					FileRepository.log("requestJson response error" + e);
                });
            } else {
                FileRepository.log("could not get OAuth token" + requestOptions);
            }
        })
        .catch(function (e) {
            FileRepository.log(e);
        });

    }

}
