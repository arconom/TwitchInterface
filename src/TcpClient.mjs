import net from "net";
import { FileRepository } from "./FileRepository.mjs";

export default class TcpClient {

    constructor(port) {
        this.port = port;
        // this.init();
    }

/*
     init() {

        const clients = net.connect({
            port: this.port
        }, () => {
            // 'connect' listener
            FileRepository.log('TcpClient connected to server!');
            clients.write('world!\r\n');
        });
        clients.on('data', (data) => {
            FileRepository.log("TcpClient\r\n" + data.toString());
            clients.end();
        });
        clients.on('error', (e, b) => {
            FileRepository.log('TcpClient error\r\n' + e);
            const self = this;
            setTimeout(function () {
                self.init();
            }, 1000);
        });
        clients.on('end', (e) => {
            FileRepository.log('TcpClient disconnected from server\r\n' + e);
            const self = this;
            setTimeout(function () {
                self.init();
            }, 1000);
        });

        this.clients = clients;
    }
 */
 
    sendToTTS(message) {
        return new Promise((resolve, reject) => {
            const socket = net.connect({
                port: this.port
            });

            socket.once('connect', () => {
				FileRepository.log("TcpClient.send " + message);
                socket.end(message);
                resolve();
            });

            socket.once('error', reject);
        });
    }

    send(message) {
        let msg;

        if (typeof message === "object") {
            msg = JSON.stringify(message);
        } else {
            msg = message;
        }

        return this.sendToTTS(msg).catch(function(e){
	        FileRepository.log("TcpClient.send error " + e);
		});
    }

}
