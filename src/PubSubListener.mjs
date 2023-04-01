import {PubSubListenables, PubSubEventNames} from "./PubSubListenables.mjs";
import WebSocketListener from "./WebSocketListener.mjs";
import {Nonce} from "./Utility.mjs";
import WebSocket from "ws";
import {FileRepository} from "./FileRepository.mjs";

export default class PubSubListener extends WebSocketListener {

    constructor(uri, oAuthProvider) {
        super(uri, oAuthProvider);
        var self = this;

        this.heartbeatInterval = Math.floor((Math.random() + 0.3) * (1000 * 60 * 2)); //ms between PING's
        this.reconnectInterval = 1000 * 3; //ms to wait before reconnect
        this.reconnectAttempts = 0;
        this.heartbeatHandler = null;

        this.AddHandler("open", function (event) {
            self.heartbeatHandler = setInterval(function(){
				self.ping.call(self);
				}, self.heartbeatInterval);
            self.reconnectAttempts = 0;
        });

        this.AddHandler("error", function (event) {
            self.reconnectAttempts++;
        });

        this.AddHandler("close", function (event) {
            clearInterval(self.heartbeatHandler);
            setTimeout(self.setupWebSocket, self.reconnectInterval);
        });

        this.AddHandler("message", function (event) {
            if (event.type === "RECONNECT") {
                self.socket.close();
                clearInterval(self.heartbeatHandler);
                setTimeout(self.setupWebSocket, self.reconnectInterval);
            }
        });

    }

    listenToBits(channelId, userId) {
        this.listen(PubSubListenables.get(PubSubEventNames.bits));
    }
    listenToBitBadges(channelId, userId) {
        this.listen(PubSubListenables.get(PubSubEventNames.bitsBadgeNotification));
	}
    listenToChannelPoints(channelId, userId) {
        this.listen(PubSubListenables.get(PubSubEventNames.channelPoints));
	}
    listenToChannelSubs(channelId, userId) {
        this.listen(PubSubListenables.get(PubSubEventNames.channelSubscriptions));
	}
    listenToModActions(channelId, userId) {
        this.listen(PubSubListenables.get(PubSubEventNames.chatModeratorActions));
	}
    listenToAutoMod(channelId, userId) {
        this.listen(PubSubListenables.get(PubSubEventNames.chatAutomodQueue));
	}
    listenToModNotification(channelId, userId) {
        this.listen(PubSubListenables.get(PubSubEventNames.chatModerationNotifications));
	}
    listenToWhispers(channelId, userId) {
        this.listen(PubSubListenables.get(PubSubEventNames.whispers));
	}

    ping() {
		var self = this;
        var message = {
            type: 'PING'
        };
		// FileRepository.log("self should be pubsub", self);
		self.waitForSocket(function(){
			self.socket.send(JSON.stringify(message));
		});
    }

    pong() {
		var self = this;
        var message = {
            type: 'PONG'
        };
		self.waitForSocket(function(){
			self.socket.send(JSON.stringify(message));
		});
    }

    listen(topic) {
		var self = this;
        var message = {
            type: 'LISTEN',
            nonce: Nonce(15),
            data: {
                topics: [topic],
                auth_token: self.oAuthProvider.oAuthToken
            }
        };
		// FileRepository.log("listen", this, this.socket);
		self.waitForSocket(function(){
			self.socket.send(JSON.stringify(message));
		});
    }
}
