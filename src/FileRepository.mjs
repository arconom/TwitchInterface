import fs from 'fs';
import {
    open,
    readdir
}
from 'node:fs/promises';

import {
    Constants
}
from "./Constants.mjs";
import LineByLineReader from 'line-by-line';

export const FileRepository = {

    //one file per day
    suffix: Math.floor(Date.now() / (1000 * 60 * 60 * 24)),

    saveOBSTextSource: function (data) {
        return this.writeTextFileAsync("./public/OBSTextSource.txt", data);
    },

    readOBSTextSource: function () {
        return this.readFileAsync("./public/OBSTextSource.txt");
    },

    saveUsers: function (data) {
        return this.writeJsonFileAsync("./data/Users.json", data);
    },

    saveCurrencies: function (data) {
        return this.writeJsonFileAsync("./data/Currencies.json", data);
    },

    readUsers: function () {
        return this.readFileAsync("./data/Users.json");
    },

    readCurrencies: function () {
        return this.readFileAsync("./data/Currencies.json");
    },

    saveWallets: function (data) {
        return this.writeJsonFileAsync("./data/Wallets.json", data);
    },

    readWallets: function () {
        return this.readFileAsync("./data/Wallets.json");
    },

    saveHotkeyList: function (data) {
        return this.writeJsonFileAsync("./data/HotkeyList.json", data);
    },

    readHotkeyList: function () {
        return this.readFileAsync("./data/HotkeyList.json");
    },

    saveRepeatingMessages: function (data) {
        return this.writeJsonFileAsync("./data/repeatingMessages.json", data);
    },

    readRepeatingMessages: function () {
        return this.readFileAsync("./data/repeatingMessages.json");
    },

    saveCommandState: function (state) {
        return this.writeJsonFileAsync("./data/commandState.json", state);
    },

    readCommandState: function () {
        return this.readFileAsync("./data/commandState.json");
    },

    saveChatCommandConfig: function (state) {
        return this.writeJsonFileAsync("./data/commandConfig.json", state);
    },

    readChatCommandConfig: function () {
        return this.readFileAsync("./data/commandConfig.json");
    },

    savePluginConfig: function (state) {
        return this.writeJsonFileAsync("./data/pluginConfig.json", state);
    },

    readPluginConfig: function () {
        return this.readFileAsync("./data/pluginConfig.json")
        .then((data) => {
            return JSON.parse(data);
        }).catch(function (err) {
            FileRepository.log("no plugin data");
        });
    },

    saveBookmarkedChannels: function (state) {
        return this.writeJsonFileAsync("./data/savedChannels.json", state);
    },

    readBookmarkedChannels: function () {
        return this.readFileAsync("./data/savedChannels.json");
    },

    saveAuth: function (token) {
        return this.writeFileAsync("./data/OAuth.txt", token);
    },

    readAuth: function () {
        return this.readFileAsync("./data/OAuth.txt");
    },

    loadPlugins: function (orderedMap) {
        var path = "./plugins/";
        return this.getPluginFolderList()
        .then((folders) => {
            var promises = [];

            for (const kvp of orderedMap) {
                const pluginName = kvp[1];

                if (folders.indexOf(pluginName) > -1) {
                    promises.push(new Promise(function(resolve, reject){
                        FileRepository.log("importing plugin " + pluginName);
                        return import("../" + path + pluginName + "/main.mjs")
                        .then((result) => {
                            FileRepository.log("finished importing plugin " + pluginName);
                            return resolve(result);
                        })
                        .catch((e) =>
                        {
                            FileRepository.log("error while importing plugin " + pluginName + "\r\n" + e);
                            return reject(e);
                        });
                    }));
                }
            }

            return Promise.allSettled(promises);
        });
    },

    getPluginFolderList: function () {
        var path = "./plugins/";
        return readdir(path);
    },

    getImages: function () {
        var path = "./images/";
        return readdir(path);
    },

    getSounds: function () {
        var path = "./sounds/";
        return readdir(path);
    },

    log: function (message) {
        return this.appendFileAsync("./logs/log" + this.suffix + ".txt", new Date(Date.now()).toISOString() + ": " + message + "\r\n");
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
        return this.appendFileAsync("./data/chatlog.json", data + "\r\n");
    },

    loadChatMessages: async function (callback) {
        await this.readLargeFileAsync("./data/chatlog.json", callback);
    },

    loadEventSubscriptions: function () {
        // FileRepository.log("loadEventSubscriptions");
        return this.readFileAsync("./data/EventSubscriptions.json");
    },

    saveApiResults: function (name, data) {
        // FileRepository.log("saveEventSubscriptions", data);
        var dir = "./api";
        return this.appendFileAsync(dir + "/" + name + ".json", data);
    },

    readApiResults: function (name) {
        // FileRepository.log("saveEventSubscriptions", data);
        var dir = "./api";

        return this.readFileAsync(dir + "/" + name + ".json");
    },

    saveEventSubscriptions: function (data) {
        FileRepository.log("saveEventSubscriptions", data);
        return this.writeJsonFileAsync("./data/EventSubscriptions.json", data);
    },

    loadOscMappings: function () {
        // FileRepository.log("loadOscMappings");
        return this.readFileAsync("./data/OscMappings.json");
    },

    saveOscMappings: function (data) {
        // FileRepository.log("saveOscMappings", data);
        return this.writeJsonFileAsync("./data/OscMappings.json", data)
    },

    loadSecrets: function () {
        // FileRepository.log("loadSecrets");
        return this.readFileAsync("./data/secrets.json");
    },

    saveSecrets: function (data) {
        // FileRepository.log("saveSecrets", JSON.stringify(data));
        return this.writeJsonFileAsync("./data/secrets.json", data)
    },

    loadConfig: function () {
        // FileRepository.log("loadConfig");
        return this.readFileAsync("./data/config.json");
    },

    saveConfig: function (data) {
        // FileRepository.log("saveConfig", JSON.stringify(data));
        return this.writeJsonFileAsync("./data/config.json", data)
    },

    loadApiScopes: function () {
        // FileRepository.log("loadApiScopes");
        return this.readFileAsync("./data/apiScopes.json");
    },

    saveApiScopes: function (data) {
        // FileRepository.log("saveApiScopes", JSON.stringify(data));
        return this.writeJsonFileAsync("./data/apiScopes.json", data)
    },

    loadVariables: function () {
        // FileRepository.log("loadApiScopes");
        return this.readFileAsync("./data/variables.json");
    },

    saveVariables: function (data) {
        // FileRepository.log("saveApiScopes", JSON.stringify(data));
        return this.writeJsonFileAsync("./data/variables.json", data)
    },

    loadChatScopes: function () {
        // FileRepository.log("loadChatScopes");
        return this.readFileAsync("./data/chatScopes.json");
    },

    saveChatScopes: function (data) {
        // FileRepository.log("saveChatScopes", JSON.stringify(data));
        return this.writeJsonFileAsync("./data/chatScopes.json", data)
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
        }).catch(function (err) {
            FileRepository.log("error while accessing file " + filename + " " + err);
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

    writeJsonFileAsync: function (filename, data) {
        return this.writeFileAsync(filename, data, true);
    },

    writeTextFileAsync: function (filename, data) {
        return this.writeFileAsync(filename, data, false);
    },

    writeFileAsync: function (filename, data, isJson) {
        this.log("FileRepository.writeFileAsync " + filename + "\r\n" + JSON.stringify(data));
        if (!data) {
            return;
        }
        return new Promise(function (resolve, reject) {
            // this.log("FileRepository.writeFileAsync going to write");
            try {
                let writeMe = data;

                if (isJson) {
                    writeMe = JSON.stringify(data, Constants.replacer);
                }

                fs.writeFile(filename, writeMe, function (err, data) {
                    // this.log("FileRepository.writeFileAsync written");
                    if (err) {
                        reject(err);
                    } else {
                        resolve(data);
                    }
                });
            } catch (e) {
                FileRepository.log("Error writing to fiile:  \r\n" + e)
            }
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
