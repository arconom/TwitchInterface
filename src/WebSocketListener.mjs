import WebSocket from "ws";
import HandlerMap from "./HandlerMap.mjs";
import WebSocketMessage from "./WebSocketMessage.mjs";
import WebSocketMessageList from "./WebSocketMessageList.mjs";
import {FileRepository} from "./FileRepository.mjs";

export default class WebSocketListener extends HandlerMap {

    constructor(uri, port) {
     	// FileRepository.log("WebSocketListener.ctor");
		super();
        this.uri = uri;
        this.port = port;
        this.webSocketMessageList = new WebSocketMessageList([]);
        this.socket = null;
        this.connect();
    }

    connect() {
     	FileRepository.log("WebSocketListener.connect", this.uri + ":" + this.port);
        var self = this;

        //using websocket to transmit chat data to the web client
        self.socket = new WebSocket(this.uri);// + ":" + this.port);

        self.socket.on('connection', function connection(ws) {
            ws.on('message', function message(data) {
                FileRepository.log('message from ', ws, data);
            });

            ws.send('connected', ws);
        });

        // Create WebSocket connection.

        // Connection opened
        self.socket.addEventListener('open', (event) => {
            self.ExecuteHandlers("open", event);
        });

        // Listen for messages
        self.socket.addEventListener('message', (event) => {
            //we only want to add messages to the list if they aren't already there
            if (!self.webSocketMessageList.exists(event.data?.metadata?.message_id)) {
                self.webSocketMessageList.add(event.data);
                self.ExecuteHandlers("message", event);
            }
        });

        self.socket.addEventListener('close', (event) => {
            self.ExecuteHandlers("close", event);
        });

        self.socket.addEventListener('error', (event) => {
            self.ExecuteHandlers("error", event);
        });

        return Promise.resolve();
    }

    // waitForSocket(callback) {
        // var self = this;
        // var interval = setInterval(checkStatus, 500);

        // function checkStatus() {
            // if (self.socket.readyState === 1) {
                // clearInterval(interval);
                // callback();
            // } else {
                // FileRepository.log( "waiting for a socket", self.socket.readyState);
            // }
        // }
    // }

}
