import net from "net";
import { FileRepository } from "./FileRepository.mjs";
import HandlerMap from "./HandlerMap.mjs";

export default class TcpServer extends HandlerMap {

    constructor(port) {
		super();
        this.port = port;
        this.server = null;
        this.init();
    }

    init() {
        this.server = net.createServer(socket => {

            FileRepository.log('TcpServer.TTS connected');

            socket.setEncoding('utf8');

            let buffer = '';

            socket.on('data', data => {
                buffer += data;
                FileRepository.log('TcpServer.Received: ' + data);
            });

            socket.on('end', () => {
                try {
                    const message = JSON.parse(buffer);

                    FileRepository.log(
                        'TcpServer.Message ID: ' + message.messageID);

                    this.handleMessage(message);

                } catch (err) {
                    FileRepository.log(
                        'TcpServer.JSON parsing error: ' + err);
                }
            });

            socket.on('error', err => {
                FileRepository.log('TcpServer.Socket error: ' + err);
            });

            socket.on('close', () => {
                FileRepository.log('TcpServer.TTS disconnected');
            });
        });

        this.server.on('error', err => {
            FileRepository.log('TcpServer.Server error: ' + err);
        });

        this.server.listen(this.port, '127.0.0.1', () => {
            FileRepository.log(
                'TcpServer.Listening on port ' + this.port);
        });
    }

    handleMessage(message) {
        FileRepository.log('TcpServer.handleMessage \r\n' + JSON.stringify(message));
		this.ExecuteHandlers("message", message)
		
        // 'TcpServer.Lua return: ' + message.returnValue
        // 'TcpServer.Unhandled message: ' + message.messageID);
    }

    send(message) {
        return new Promise((resolve, reject) => {

            const socket = net.createConnection({
                host: '127.0.0.1',
                port: 39999
            });

            socket.once('connect', () => {
                socket.end(JSON.stringify(message));
                resolve();
            });

            socket.once('error', reject);
        });
    }

    close() {
        if (this.server) {
            this.server.close();
        }
    }
}
