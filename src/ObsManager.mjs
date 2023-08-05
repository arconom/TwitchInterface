import OBSWebSocket from 'obs-websocket-js';

import {
    Secrets
}
from "./Secrets.mjs";
import {
    FileRepository
}
from "./FileRepository.mjs";

export default class ObsManager {

    constructor(host, port, password) {
        this.webSocket = new OBSWebSocket();
        this.password = password;
        this.host = host ?? "127.0.0.1";
        this.port = port ?? "4455";

        this.webSocket.on("ConnectionOpened", this.connectionOpenedHandler);
        this.webSocket.on("ConnectionClosed", this.connectionClosedHandler);
        this.webSocket.on("ConnectionError", this.connectionErrorHandler);
        this.webSocket.on("Hello", this.helloHandler);
        this.webSocket.on("Identified", this.identifiedHandler);

        this.webSocket.once("ExitStarted", function () {
            this.webSocket.off("ConnectionOpened", this.connectionOpenedHandler);
            this.webSocket.off("ConnectionClosed", this.connectionClosedHandler);
            this.webSocket.off("ConnectionError", this.connectionErrorHandler);
            this.webSocket.off("Hello", this.helloHandler);
            this.webSocket.off("Identified", this.identifiedHandler);
        });

        // this.webSocket.off("", handler);
        // this.webSocket.addListener("", handler);
        // this.webSocket.removeListener("", handler);
    }

    connect() {
        return this.webSocket.connect("ws://" + this.host + ":" + this.port,
            this.password
			// ,{
            // "rpcVersion": number,
            // "authentication": string(optional),
            // "eventSubscriptions": number(optional) = (EventSubscription::All)
        // }
		);
    }

    disconnect() {
        return this.webSocket.disconnect();
    }

    send(requestType, requestData) {
        return this.webSocket.call(requestType /* : string */, requestData /* ?: object */);
    }

    batch(requests) {
        return this.webSocket.callBatch(requests /* [{requestType: "", requestData: {}}] */);
    }

    connectionOpenedHandler(r) {
        FileRepository.log("ObsManager.connectionOpenedHandler " + r);
    }
    connectionClosedHandler(r) {
        FileRepository.log("ObsManager.connectionClosedHandler " + r);
    }
    connectionErrorHandler(r) {
        FileRepository.log("ObsManager.connectionErrorHandler " + r);
    }
    helloHandler(r) {
        FileRepository.log("ObsManager.helloHandler " + r);
    }
    identifiedHandler(r) {
        FileRepository.log("ObsManager.identifiedHandler " + r);
    }
}
