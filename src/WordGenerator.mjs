import fs from 'fs';
import zl from "zip-lib";

var EnglishDefinitions;
import("./EnglishDefinitions.mjs").then(function (data) {
    // console.log("done", data);
    EnglishDefinitions = data.EnglishDefinitions;
})
.catch(function (err) {
    zl.extract('./src/EnglishDefinitions.zip', "./src").then(function (data) {
        // console.log("done", data);
        EnglishDefinitions = data.EnglishDefinitions;
    }, function (err) {
        console.log(err);
    });
});

import {
    CommonEnglishWords
}
from "./CommonEnglishWords.mjs";
import Helper from './Helper.mjs';
import {
    FileRepository
}
from "./FileRepository.mjs";

var bannedTags = ["slang",
    "offensive",
    "derogatory",
    "informal",
    "obsolete",
    "vulgar",
    "colloquial",
    "pejorative",
    "idiomatic"];
var bannedDefs = ["past of",
    "plural of",
    "singular of",
    "participle of",
    "alternative form of",
    "spelling of"];

var bannedWords = ["sexual", "fuck", "shit", "piss", "cunt", "cock", "dick", "penis", "vagina"];

export default class WordGenerator {

    constructor() {
        this.usedWords = [];
        this.definitions = new Map();
        this.lastWord = null;
        this.words = new Set();
        this.commonWords = this.initCommonWords();
        this.wordList = null;
        this.commonWordList = null;
        this.initializeWordList();
    }

    getWordList() {
        if (!this.wordList) {
            this.wordList = Array.from(this.words.values());
        }
        return this.wordList;
    }

    getCommonWordList() {
        if (!this.commonWordList) {
            this.commonWordList = Array.from(this.commonWords.values());
        }
        // FileRepository.log("WordGenerator.getCommonWordList " + this.commonWordList);
        return this.commonWordList;
    }

    initCommonWords() {
        var returnMe = new Set();

        for (let i = 0; i < CommonEnglishWords.length; i++) {
            returnMe.add(CommonEnglishWords[i]);
        }

        return returnMe;
    }

    initializeWordList() {
        var startTime = Date.now();

        for (var x of EnglishDefinitions) {
            //no spaces
            //no initialism
            //no abbreviation
            //no phrase
            //no ALL CAPS
            //no short words
            //only alpha
            var match = x.word.match(/[A-Z]?[a-z]*/);

            if (
                match &&
                match[0].length === x.word.length &&
                x.word.indexOf(" ") === -1 &&
                x.word.length > 2 &&
                bannedWords.every(b => x.word.indexOf(b) === -1) &&
                bannedDefs.every(b => x.definition.indexOf(b) === -1) &&
                bannedTags.every(b => x.tags.indexOf(b) === -1) &&
                x.partOfSpeech.indexOf("Prepositional phrase") === -1 &&
                this.getClosestDistance(x.word, x.definition.split(" ")) > 2) {
                this.words.add(x.word);
            }

            if (x.definition) {
                var activeDef = this.definitions.get(x.word);
                if (activeDef) {
                    //if there is already a definition for the word
                    //add the new one to the list
                    activeDef.push(x);
                    this.definitions.set(x.word, activeDef);
                } else {
                    //there isn't a definition yet
                    //create the array and push
                    var arr = [];
                    arr.push(x);
                    this.definitions.set(x.word, arr);
                }
            }
        }
        var endTime = Date.now();
        FileRepository.log("word list generated in " + (endTime - startTime) + "ms");
        FileRepository.log("word list size " + this.words.size);
    }

    getClosestDistance(word, list) {
        // FileRepository.log("getClosestDistance", word, list);
        var returnMe = Infinity;

        list.forEach(x => {
            var d = Helper.getLevenshteinDistance(word, x);

            if (d < returnMe) {
                returnMe = d;
            }
        });

        return returnMe;
    }

    getWordFromList(list) {
        var index = Math.floor(Math.random() * list.length);
        this.lastWord = list[index];
        return list[index];
    }

    getCommonWord() {
        return this.getWordFromList(this.getCommonWordList());
    }

    getRandomWord() {
        return this.getWordFromList(this.getWordList());
    }

    getDefinition(key) {
        FileRepository.log("WordGenerator.getDefinition " + key);

        var self = this;
        if (!key && this.lastWord) {
            key = this.lastWord;
        }
        key = key.toLowerCase();

        this.usedWords.push(key);
        var arr = this.definitions.get(key);

        if (arr) {

            var returnMe = null;
            //get one of the definitions for the given key
            var defIndex = Math.floor(Math.random() * arr.length);
            FileRepository.log("WordGenerator.getDefinition defIndex " + defIndex);
            FileRepository.log("WordGenerator.getDefinition def " + arr[defIndex].definition);

            bannedDefs.forEach(function (element, index, array) {
                var i = arr[defIndex].definition.indexOf(element);
                if (i > -1) {
                    var newDef = arr[defIndex].definition.substr(i + element.length).trim();
                    FileRepository.log("WordGenerator.getDefinition newDef " + newDef);
                    var newWord = newDef.split(" ")[0];
                    FileRepository.log("WordGenerator.getDefinition newWord " + newWord);
                    returnMe = self.getDefinition(newWord);
                }
            });

            FileRepository.log("WordGenerator.getDefinition returning " + arr[defIndex].definition);
            return returnMe ?? ": " + arr[defIndex].partOfSpeech + " - " + arr[defIndex].definition;
        } else {
            return null;
        }
    }

    getRandomDefinition() {
        var word = this.getRandomWord();
        var def = this.getDefinition(word);

        return word + def;
    }

    getPrefixedWordsFromList(list, prefix, size) {
        var indexes = new Set();
        while (indexes.size < size) {
            var i = Math.floor(Math.random() * list.length);
            indexes.add(i);
        }

        var returnMe = "";

        for (var i of indexes) {
            returnMe += list[i] + " ";
        }

        return returnMe.trim();
    }

    getCommonAlliteration(letter, size) {
        letter = letter.toLowerCase();
        var values = Array.from(this.commonWords.values())
            .filter(x => x.indexOf(letter) === 0);

        return this.getPrefixedWordsFromList(values, letter, size);
    }

    getAlliteration(letter, size) {
        letter = letter.toLowerCase();
        var keys = Array.from(this.definitions.keys())
            .filter(x => x.indexOf(letter) === 0);

        return this.getPrefixedWordsFromList(keys, letter, size);
    }

}
