import {
    WebSocketServer
}
from "ws";
import {
    FileRepository
}
from "./FileRepository.mjs";

import HandlerMap from "./HandlerMap.mjs";
// import WebSocketMessage from "./WebSocketMessage.mjs";
// import WebSocketMessageList from "./WebSocketMessageList.mjs";

export default class WebUIInterface extends HandlerMap {

    constructor(port=8080) {
        super();
		var self = this;
        self.port = port;
        self.server = new WebSocketServer({port: port});
        self.heartbeat = setInterval(function ping() {
            self.server.clients.forEach(function each(ws) {
                if (ws.isAlive === false)
                    return ws.terminate();

                ws.isAlive = false;
                ws.ping();
            });
        }, 30000);

        this.setupEvents();

    }

    setupEvents() {
        var self = this;

        //using websocket to transmit chat data to the web client

        self.server.on('connection', function connection(ws) {
            ws.isAlive = true;
            ws.on('pong', keepAlive);
            ws.on('message', function message(data) {

                FileRepository.log('message from ', ws, data);
                self.ExecuteHandlers("message", data);
            });

            ws.send('connected', ws);
        });

        self.server.on('close', function close() {
            clearInterval(self.heartbeat);
        });

    }

    send(message) {
		//message: string
		FileRepository.log("WebUIInterface.send " + message + " to " + this.port);
        this.server.clients.forEach(x => x.send(message));
    }

}

function keepAlive() {
    this.isAlive = true;
}
