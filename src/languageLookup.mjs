import fs from 'fs';
import path from "path";
import Trie from './trie.mjs';
import Dafsa from './dafsa.mjs';
import {
    FileRepository
}
from "./FileRepository.mjs";

export default class LanguageLookup {

    constructor() {
        this.languageTries = {};
        this.languageArrays = {};

        this.readFiles();
    }

    readFiles() {
        var self = this;
        var returnMe = {};
        let p = path.resolve("./languages");

        fs.readdirSync(p).forEach(file => {
            let f = path.resolve(p, file);

            if (fs.existsSync(f)) {
                var languageSet = new Set();
                // let languageTrie = new Trie();
                let languageTrie = new Dafsa();
                let languageArray = [];

                let language_name = path.basename(f, path.extname(f));
                // FileRepository.log("Language file:", language_name);

                try {
                    let data = fs.readFileSync(f, 'utf8');
                    let lines = data.split(/\r?\n/);
                    lines.forEach(line => {
                        languageSet.add(line);
                        languageTrie.insert(line);
                        languageArray.push(line);
                    });
                } catch (err) {
                    FileRepository.log(err);
                }

				// todo figure out how to do this without running out of RAM
                // for (const word of languageSet.values()) {
                    // for (const word2 of languageSet.values()) {
                        // var w = word + word2;
                        // languageTrie.insert(w);
                        // languageArray.push(w);
                    // }
                // }

                self.languageTries[language_name] = languageTrie;
                self.languageArrays[language_name] = languageArray;
            }
        });

        // FileRepository.log("Loaded languages", returnMe);
        return returnMe;
    }

    find(word) {
        // return an array of strings indicating the languages that contain the word
        let violations = []
        Object.keys(this.languageTries).forEach(lang => {
            if (this.languageTries[lang].has(word)) {
                violations.push(lang);
            }
        });
        return violations;
    }

    // getClosestMatch(query) {
        // let matchDistance = Infinity;
        // let match = "";
        // let language = "";

        // Object.keys(this.languageArrays).forEach(lang => {
            // this.languageArrays[lang].forEach(word => {
                // if (Math.abs(word.length - query.length) < 2) {
                    // var d = Helper.getLevenshteinDistance(query, word);
                    // if (d < matchDistance) {
                        // matchDistance = d;
                        // match = word;
                        // language = lang;
                    // }
                    // if (matchDistance == 0) {
                        // return {
                            // word: match,
                            // language: language,
                            // distance: matchDistance
                        // };
                    // }
                // }
            // });
        // });
        // return {
            // word: match,
            // language: language,
            // distance: matchDistance
        // };
    // }

    getClosestMatchTrie(query) {
        let matchDistance = Infinity;
        let match = "";
        let language = "";

        Object.keys(this.languageTries).forEach(lang => {
            var ld = this.languageTries[lang].getLevenshteinDistance(query, 2);
            if (ld.cost < matchDistance) {
                match = ld.word;
                matchDistance = ld.cost;
            }
        });

        return {
            word: match,
            language: language,
            distance: matchDistance
        };
    }
}

// (function () {
// FileRepository.log("testing LanguageLookup");

// var languageLookup = new LanguageLookup();
// var result = languageLookup.find("add");

// if (result.length < 1) {
// throw "didn't find 'add' in the dictionary";
// }

// FileRepository.log("LanguageLookup passed", result);

// })();
