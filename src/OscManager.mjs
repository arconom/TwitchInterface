import {
    Client,
    Server
}
from 'node-osc';
import {
    Constants
}
from "./Constants.mjs";
import {
    SubscriptionTypeNames,
    SubscriptionTypes
}
from "./SubscriptionTypes.mjs";
import {
    FileRepository
}
from "./FileRepository.mjs";

export default class OscManager {
    constructor(clientAddress, clientPort, serverAddress, serverPort) {

        this.clientAddress = clientAddress;
        this.clientPort = clientPort;

        this.serverAddress = serverAddress;
        this.serverPort = serverPort;

        this.oscClient = new Client(this.clientAddress, this.clientPort);

        this.oscServer = new Server(this.serverPort, this.serverAddress, () => {
            FileRepository.log('OSC Server is listening');
        });

        this.oscServer.on('message', function (msg) {
            FileRepository.log(`OSC Message: ${msg}`);
            // oscServer.close();
        });

        this.events = new Map();
        this.events.set("/eventsub.message", false);
        this.events.set("/chat.message", false);

        for (var s of SubscriptionTypes) {

            //example
            /*            [
            'user.update', {
            name: 'user.update',
            version: '1',
            description: '\tA user has updated their account.'
            }
            ]
             */
            this.events.set("/" + s[1].name, false);
        }

    }

    send(message, args) {
        FileRepository.log("OSCManager.send " + message + " " + args);
        var self = this;
        if (!args.length) {
            args = [args];
        }

        if (self.events.get(message)) {
            FileRepository.log("OSCManager.sending");
            self.oscClient.send(message, [...args], () => {});
        }
    }

    setEvent(name, value) {
        this.events.set(name, value);
    }

    enableEvent(name) {
        this.events.set(name, true);
    }

    disableEvent(name) {
        this.events.set(name, false);
    }

}
