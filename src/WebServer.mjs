import fs from "fs";
import http from "http";
import open from "open";
import {
    createHttpTerminator
}
from "http-terminator";
import {
    Constants
}
from "./Constants.mjs";

import {
    querystringToMap,
    querystringToObject
}
from "./Utility.mjs";
import {
    FileRepository
}
from "./FileRepository.mjs";

export default class WebServer {

    constructor(hostname = "127.0.0.1", port = 6969, preferredBrowser = "chrome", routes) {
        var self = this;
        this.hostname = hostname;
        this.port = port;
        this.server;
        this.routes = routes;
        this.sockets = new Set();
        this.preferredBrowser = preferredBrowser;
    }

    start() {
        FileRepository.log("WebServer.start" + " hostname " + this.hostname + " port " + this.port);
        var self = this;

        self.server = http.createServer(function (req, res) {

            FileRepository.log("WebServer.start req " + req.method + " " + req.url);
            // console.log("WebServer.start req " + req.method + " " + req.url);

            if (req.method === "GET" || req.method === "DELETE") {
                if (req.url === "/") {
                    FileRepository.log("WebServer.start index.html");
                    //root, serve index
                    fs.readFile("./public/Index.html", function (error, data) {
                        res.statusCode = 200;
                        res.setHeader("Content-Type", "text/html");
                        res.write(data);
                        // FileRepository.log("WebServer.start end request " + req.url);
                        res.end();
                    });
                } else if (req.url.indexOf("overlay") > -1 ){
                    FileRepository.log("WebServer.start overlay.html");
                    //root, serve index
                    fs.readFile("./public/overlay.html", function (error, data) {
                        res.statusCode = 200;
                        res.setHeader("Content-Type", "text/html");
                        res.write(data);
                        // FileRepository.log("WebServer.start end request " + req.url);
                        res.end();
                    });
                } else if (req.url.indexOf("public") > -1 ||
                    req.url.indexOf("src") > -1) {
                    // FileRepository.log("WebServer.start static file");
                    //we're getting a static file?
                    self.serveFile(req, res);
                } else {
                    //we're hitting a route
                    // FileRepository.log("WebServer.start route");

                    var url = "";
                    var queryString = null;

                    if (req.url.indexOf("?") > -1) {
                        var urlParts = req.url.split("?");

                        if (urlParts.length > 0) {
                            url = urlParts[0];
                            queryString = urlParts[1];
                        }
                    } else {

                        url = req.url;
                    }

                    // FileRepository.log("WebServer.start route url" + url);
                    var route = self.routes.get(url);
                    FileRepository.log("WebServer.start route " + JSON.stringify(route));
                    if (route) {

                        var handler = route[req.method];
                        // FileRepository.log("WebServer.start handler", handler);
                        if (handler) {
                            var handlerResult;
                            if (queryString?.length > 0) {
                                handlerResult = handler(querystringToObject(urlParts[1]));
                            } else {
                                handlerResult = handler();
                            }

                            handlerResult
                            ?.then(function (data) {

                                if (typeof data === "error") {
                                    res.statusCode = data.statusCode;
                                    res.write(data.message);
                                } else {
                                    // FileRepository.log("WebServer.start GET request returning", data);
                                    res.statusCode = 200;
                                    res.setHeader("Content-Type", "application/json");
                                    if (data) {
                                        res.write(JSON.stringify(data))
                                    }
                                }
                                // FileRepository.log("WebServer.start end request " + req.url);
                                res.end();
                            })
                            .catch(function (err) {
                                FileRepository.log("WebServer error during request " + req.url);
                                FileRepository.log(err);
                            });
                        } else {
                            // FileRepository.log("WebServer.start end request " + req.url);
                            res.end();
                        }
                    } else {
                        // FileRepository.log("WebServer.start end request " + req.url);
                        res.end();
                    }
                }
            } else if (req.method === "POST" || req.method === "PUT") {
                // FileRepository.log("WebServer.start POST or PUT");

                var body = "";

                req.on("readable", function () {
                    body += req.read();
                });

                req.on("end", function () {
                    // FileRepository.log("WebServer.start request.end " + body);

                    var b;

                    //todo figure out why null shows up at the end of the object
                    try {
                        b = JSON.parse(body.substr(0, body.length - 4));
                    } catch (e) {
                        FileRepository.log("error parsing response:  " + e);
                    }

                    //routes passed from main look like this
                    /*
                    Controller.set("say", {
                    "GET": function (data) {
                    throw "method not allowed";
                    },
                    "POST": function (data) {},
                    "PUT": function (data) {
                    throw "method not allowed";
                    },
                    "DELETE": function (data) {
                    throw "method not allowed";
                    },
                    });
                     */
					 
					 try{
                    self.routes.get(req.url)[req.method](b).then(function (data) {

                        res.statusCode = 200;
                        res.setHeader("Content-Type", "application/json");
                        if (data) {
                            // FileRepository.log("WebServer.start writing data to the request" + data);
                            res.write(JSON.stringify(data))
                        }
                        // FileRepository.log("WebServer.start end request " + req.url);
                        res.end();

                    });
					 }
					 catch(e){
						 FileRepository.log("Route " + req.url + ":" + req.method + " created an error: " + e);
					 }
					
                });
            }

        });

        self.server.listen(self.port, self.hostname, function (req, res) {
            // FileRepository.log("WebServer.start Server running at " + self.hostname + ":" + self.port);
            // FileRepository.log("WebServer.start WebServer listener " + "req " + req + " res " + res);

            return open(self.hostname + ":" + self.port, {
                app: {
                    name: self.preferredBrowser
                }
            });
        });

        self.server.on("connection", (socket) => {
            self.sockets.add(socket);
        });

        self.server.on("close", function () {
            self.sockets.clear();
        });

        this.httpTerminator = createHttpTerminator({
            server: self.server
        });
    }

    stop(callback) {
        for (var socket of this.sockets) {
            socket.destroy();
            this.sockets.delete(socket);
        }
        this.server.close(callback);
    }

    serveFile(request, response) {
        var filePath = '.' + request.url;

        var match = filePath.match(/\.(\w+)$/);
        var extension = "";
        if (match) {
            extension = match[1];
        }
        var contentType = 'text/html';
        switch (extension) {
        case 'js':
        case 'mjs':
        case 'cjs':
            contentType = 'text/javascript';
            break;
        case 'css':
            contentType = 'text/css';
            break;
        }

        // FileRepository.log("serveFile", filePath, extension, contentType);

        fs.stat(filePath, function (err, stat) {
            if (err == null) {
                // FileRepository.log('File exists');
                try {
                    const readStream = fs.createReadStream(filePath);
                    response.writeHead(200, {
                        'Content-type': contentType
                    });
                    readStream.pipe(response);
                    readStream.on("end", function () {
                        FileRepository.log("end request " + request.url);
                        response.end();
                    });
                } catch (e) {
                    response.writeHead(500, {
                        'Content-type': contentType
                    });
                    response.write(e);
                    FileRepository.log("end request " + request.url);
                    response.end();
                }
            } else if (err.code === 'ENOENT') {
                // file does not exist
                FileRepository.log(err.code, filePath);
                response.write(err.code);
                FileRepository.log("end request " + request.url);
                response.end();
            } else {
                FileRepository.log('Some other error: ' + err.code);
                FileRepository.log("end request " + request.url);
                response.end();
            }
        });
    }

    async terminate() {
        await this.httpTerminator.terminate();
    }

}
