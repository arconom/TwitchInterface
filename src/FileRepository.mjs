import fs from 'fs';
import {
    open
}
from 'node:fs/promises';
import LineByLineReader from 'line-by-line';

export const FileRepository = {

    //one file per day
    suffix: Math.floor(Date.now() / (1000 * 60 * 60 * 24)),

    saveUsers: function (data) {
        this.log("FileRepository.saveUsers");

        return this.writeFileAsync("./data/Users.txt", data);
    },

    readUsers: function () {
        return this.readFileAsync("./data/Users.txt");
    },

    saveChatBotState: function (state) {
        return this.writeFileAsync("./data/chatBotState.txt", state);
    },

    readChatBotState: function () {
        return this.readFileAsync("./data/chatBotState.txt");
    },

    saveBookmarkedChannels: function (state) {
        return this.writeFileAsync("./data/savedChannels.txt", state);
    },

    readBookmarkedChannels: function () {
        return this.readFileAsync("./data/savedChannels.txt");
    },

    saveAuth: function (token) {
        return this.writeFileAsync("./data/OAuth.txt", token);
    },

    readAuth: function () {
        return this.readFileAsync("./data/OAuth.txt");
    },

    loadPlugins: function () {
        var path = "./data/plugins.txt";

        fs.readdir(path, (err, files) => {
            files.forEach(file => {
                console.log(file);
            });
        });

    },

    log: function (message) {
        return this.appendFileAsync("./data/log" + this.suffix + ".txt", new Date(Date.now()).toISOString() + ": " + message + "\r\n");
    },

    saveChatMessages: function (data) {
        // return this.writeFileAsync("./chatlog.txt", data);

        if (!data) {
            return;
        }
        return new Promise(function (resolve, reject) {
            fs.writeFile("./data/chatlog.txt", data, function (err, data) {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        });
    },

    saveChatMessage: function (data) {
        return this.appendFileAsync("./data/chatlog.txt", data + "\r\n");
    },

    loadChatMessages: async function (callback) {
        await this.readLargeFileAsync("./data/chatlog.txt", callback);
    },

    loadEventSubscriptions: function () {
        // FileRepository.log("loadEventSubscriptions");
        return this.readFileAsync("./data/EventSubscriptions.txt");
    },

    loadGorkblorfVocab: async function (callback) {
        await this.readLargeFileAsync("./data/gorkblorfVocab.txt", callback);
    },

    saveGorkblorfVocab: function (data) {
        // FileRepository.log("saveEventSubscriptions", data);
        return this.appendFileAsync("./data/gorkblorfVocab.txt", data + "\r\n");
    },

    saveApiResults: function (name, data) {
        // FileRepository.log("saveEventSubscriptions", data);
        var dir = "./api";
        return this.appendFileAsync(dir + "/" + name + ".txt", data);
    },

    readApiResults: function (name, data) {
        // FileRepository.log("saveEventSubscriptions", data);
        var dir = "./api";

        return this.readFileAsync(dir + "/" + "name.txt");
    },

    saveEventSubscriptions: function (data) {
        FileRepository.log("saveEventSubscriptions", data);
        return this.writeFileAsync("./data/EventSubscriptions.txt", data);
    },

    loadOscMappings: function () {
        // FileRepository.log("loadOscMappings");
        return this.readFileAsync("./data/OscMappings.txt");
    },

    saveOscMappings: function (data) {
        // FileRepository.log("saveOscMappings", data);
        return this.writeFileAsync("./data/OscMappings.txt", data)
    },

    loadSecrets: function () {
        // FileRepository.log("loadSecrets");
        return this.readFileAsync("./data/secrets.txt");
    },

    saveSecrets: function (data) {
        // FileRepository.log("saveSecrets", JSON.stringify(data));
        return this.writeFileAsync("./data/secrets.txt", data)
    },

    loadConfig: function () {
        // FileRepository.log("loadConfig");
        return this.readFileAsync("./data/config.txt");
    },

    saveConfig: function (data) {
        // FileRepository.log("saveConfig", JSON.stringify(data));
        return this.writeFileAsync("./data/config.txt", data)
    },

    loadApiScopes: function () {
        // FileRepository.log("loadApiScopes");
        return this.readFileAsync("./data/apiScopes.txt");
    },

    saveApiScopes: function (data) {
        // FileRepository.log("saveApiScopes", JSON.stringify(data));
        return this.writeFileAsync("./data/apiScopes.txt", data)
    },

    loadChatScopes: function () {
        // FileRepository.log("loadChatScopes");
        return this.readFileAsync("./data/chatScopes.txt");
    },

    saveChatScopes: function (data) {
        // FileRepository.log("saveChatScopes", JSON.stringify(data));
        return this.writeFileAsync("./data/chatScopes.txt", data)
    },

    readFileAsync: function (filename) {
        return new Promise(function (resolve, reject) {
            fs.readFile(filename, {
                "encoding": "utf8",
                "flag": "a+"
            }, function (err, data) {
                if (err) {
                    FileRepository.log("readFileAsync error " + err);
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        });
    },

    readLargeFileAsync: async function (filename, callback) {
        var self = this;
        const file = await open('./' + filename, "a+");
        var fileInterface = file.readLines();
        for await(const line of fileInterface) {
            callback(line);
        }
    },

    writeFileAsync: function (filename, data) {
        this.log("FileRepository.writeFileAsync " + filename + "\r\n" + data);
        if (!data) {
            return;
        }
        return new Promise(function (resolve, reject) {
            // this.log("FileRepository.writeFileAsync going to write");
            fs.writeFile(filename, JSON.stringify(data), function (err, data) {
                // this.log("FileRepository.writeFileAsync written");
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        });
    },

    appendFileAsync: function (filename, data) {
        // this.log("FileRepository.appendFileAsync");
        if (!data) {
            return;
        }

        return new Promise(function (resolve, reject) {

            var index = 0;

            for (let i = 0; i < filename.length; i++) {
                if (filename.charAt(i) === "/") {
                    index = i;
                }
            }

            var path = filename.substr(0, index);

            return fs.appendFile(filename, data, "utf8", function (err, data2) {
                if (err) {
                    return fs.mkdir(path, {
                        recursive: true
                    }, function () {
                        return fs.appendFile(filename, data, "utf8",
                            function (err2, data3) {
                            if (err2) {
                                FileRepository.log("can't write to path " + filename)
                                reject(err);
                            } else {
                                resolve(data3);
                            }
                        });
                    });
                } else {
                    resolve(data2);
                }
            });
        });
    },

    async readDir(dir) {
        var self = this;
        try {
            var promises = [];
            await fs.opendir(dir, async function (err, files) {

                for await(const dirent of files) {
                    promises.push(self.readFileAsync(dir + "\\" + dirent.name));
                }
                return Promise.all(promises);
            });
        } catch (err) {
            console.error(err);
        }
    }

}
