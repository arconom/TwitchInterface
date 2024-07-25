import WebSocketListener from "./WebSocketListener.mjs";
import {
    SubscriptionTypeNames,
    SubscriptionTypes
}
from "./SubscriptionTypes.mjs";
import {
    Constants
}
from "./Constants.mjs";
import {
    Secrets
}
from "./Secrets.mjs";
import {
    FileRepository
}
from "./FileRepository.mjs";

export default class EventSubListener extends WebSocketListener {

    constructor(uri, port, oAuthProvider) {
        // FileRepository.log("EventSubListener.ctor");
        super(uri, port);

        var self = this;
        this.oAuthProvider = oAuthProvider;
        this.sessionId = null;
        this.cost = 0;
        this.maxCost = 0;

        this.AddHandler("open", function (event) {
            FileRepository.log("EventSubListener open event " + event);
        }, true);

        this.AddHandler("close", function (event) {
            if (event.code >= 4000) {
                FileRepository.log("close event error " + event.code + " " + event.reason);
            }
            FileRepository.log("EventSubListener close event " + JSON.stringify(event));
            self.closeHandler(event.data);
        }, true);

        this.AddHandler("error", function (event) {
            FileRepository.log("EventSubListener error "+ event.type + " " + event.data);
        }, true);

        this.AddHandler("message", function (event) {
            FileRepository.log("EventSubListener message event " + event.type + " " + event.data);
            
            if (event && event.data) {
                var obj = JSON.parse(event.data);

                if (obj.metadata.message_type === "session_keepalive") {
                    return;
                }

                if (obj.metadata.message_type === "session_welcome") {
                    self.sessionId = obj.payload.session.id;
                }
            }
        }, true);
    }

    close() {
        this.socket.close();
        return Promise.resolve();
    }

    closeHandler(data) {

        if (data?.metadata.message_type === "session_reconnect") {
            this.socket.close();
            this.websocketUri = data.payload.session.reconnect_url;
            return this.connect();
        } else if (data?.metadata.message_type === "revocation") {
            FileRepository.log("EventSubListener.closeHandler connection revoked");
            return this.socket.close();
        }
        else{
            return this.socket.close();
            
        }

    }

    readJson(data) {
        // FileRepository.log("EventSubListener.readJson", data);

        return data.json();
    }

    getSubscriptionConfig(sub, condition) {
        var returnMe = {
            type: "",
            version: "",
            transport: {
                "method": "websocket",
                session_id: this.sessionId
            },
        };

        returnMe.condition = condition;
        returnMe.type = sub.name;
        returnMe.version = sub.version;
        return returnMe;
    }

    subscribe(eventName, condition) {
        FileRepository.log("EventSubListener.subscribe " + eventName + " " + JSON.stringify(condition));
        var self = this;

        return self.oAuthProvider.validateToken(function () {
            FileRepository.log("EventSubListener.subscribe after validate " + eventName + " " + condition);

            var data = self.getSubscriptionConfig(SubscriptionTypes.get(eventName), condition);
            var requestOptions = {
                method: 'POST', // *GET, POST, PUT, DELETE, etc.
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': self.oAuthProvider.getAuthorizationHeader(),
                    'Client-Id': self.oAuthProvider.clientId
                },
                body: JSON.stringify(data) // body data type must match "Content-Type" header
            };

            FileRepository.log("EventSubListener.subscribe subscribing " + Constants.eventSubUrl + " " + JSON.stringify(requestOptions));
            
            return fetch(Constants.eventSubUrl, requestOptions)
            .then(self.checkResponse)
            .then(self.readJson)
            .then(self.getCostInfo)
            .catch(function (e) {
                FileRepository.log("\r\n EventSubListener.subscribe Error: " + e + "\r\n" +
                    "eventName: " + eventName + "\r\n" +
                    "condition: " + JSON.stringify(condition) + "\r\n" +
                    "requestOptions: " + JSON.stringify(requestOptions) + "\r\n");
                return Promise.reject(e);
            });
        })
        .catch(function (e) {
            FileRepository.log("EventSubListener.subscribe " + e);
        });
    }

    getCostInfo(data) {
        FileRepository.log("EventSubListener.getCostInfo " + data.total_cost);
        this.cost = data?.total_cost;
        this.maxCost = data?.max_total_cost;

        return Promise.resolve(data);
    }

    unsubscribe(id) {
        FileRepository.log("EventSubListener.unsubscribe " + eventName + " " + condition);
        var self = this;

        return self.oAuthProvider.validateToken(function () {
            FileRepository.log("EventSubListener.unsubscribe after validate " + eventName + " " + condition);

            var requestOptions = {
                method: 'DELETE', // *GET, POST, PUT, DELETE, etc.
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': self.oAuthProvider.getAuthorizationHeader(),
                    'Client-Id': self.oAuthProvider.clientId
                }
            };

            FileRepository.log("EventSubListener.unsubscribe " + Constants.eventSubUrl + " " + requestOptions);
            return fetch(Constants.eventSubUrl + "?id=" + id, requestOptions)
            .then(self.checkResponse)
            .then(self.readJson)
            .catch(function (e) {
                FileRepository.log(e);
            });
        })
        .catch(function (e) {
            FileRepository.log(e);
        });
    }

    /*     getEventSub() {
    FileRepository.log("EventSubListener.getEventSub");
    var url = `http://localhost:${port}/eventsub`;

    var requestOptions = {
    method: 'POST', // *GET, POST, PUT, DELETE, etc.
    headers: {
    'Content-Type': 'application/json'
    // 'Content-Type': 'application/x-www-form-urlencoded',
    },
    };

    return fetch(url, requestOptions)
    .catch(function (e) {
    app.close();
    })
    .then(this.eventSubHandler);
    }

    eventSubHandler(req, res) {
    let secret = this.getSecret();
    let message = this.getHmacMessage(req);
    let hmac = Constants.hmac_prefix + this.getHmac(secret, message); // Signature to compare

    if (true === this.verifyMessage(hmac, req.headers[Constants.twitch_message_signature])) {
    FileRepository.log("signatures match");

    // Get JSON object from body, so you can process the message.
    let notification = JSON.parse(req.body);

    if (Constants.message_type_notification === req.headers[Constants.message_type]) {
    // TODO: Do something with the event's data.

    FileRepository.log(`Event type: ${notification.subscription.type}`);
    FileRepository.log(JSON.stringify(notification.event, null, 4));

    res.sendStatus(204);
    } else if (Constants.message_type_verification === req.headers[Constants.message_type]) {
    res.status(200).send(notification.challenge);
    } else if (Constants.message_type_revocation === req.headers[Constants.message_type]) {
    res.sendStatus(204);

    FileRepository.log(`${notification.subscription.type} notifications revoked!`);
    FileRepository.log(`reason: ${notification.subscription.status}`);
    FileRepository.log(`condition: ${JSON.stringify(notification.subscription.condition, null, 4)}`);
    } else {
    res.sendStatus(204);
    FileRepository.log(`Unknown message type: ${req.headers[Constants.message_type]}`);
    }
    } else {
    FileRepository.log('403'); // Signatures didn't match.
    res.sendStatus(403);
    }
    }
     */
    getSecret() {
        // TODO: Get secret from secure storage. This is the secret you pass
        // when you subscribed to the event.
        return Secrets.secret;
    }

    // Build the message used to get the HMAC.
    getHmacMessage(request) {
        return (request.headers[Constants.twitch_message_id] +
            request.headers[Constants.twitch_message_timestamp] +
            request.body);
    }

    // Get the HMAC.
    getHmac(secret, message) {
        return crypto.createHmac('sha256', secret)
        .update(message)
        .digest('hex');
    }

    // Verify whether our hash matches the hash that Twitch passed in the header.
    verifyMessage(hmac, verifySignature) {
        return crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(verifySignature));
    }

    checkResponse(res, req) {
        if (res.status >= 400) {
            FileRepository.log("checkResponse " + JSON.stringify(res) + " " + res.statusText);
            throw res.statusText;
        }
        return res;
    }

}
