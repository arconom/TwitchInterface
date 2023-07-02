import fs from 'fs';
import zl from "zip-lib";

import {
    CommonEnglishWords
}
from "./CommonEnglishWords.mjs";

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
    "spelling of",
	"misspelling of"
	];

var bannedWords = [
    "bullshit",
    "glans",
    "labia",
    "phallus",
    "sex",
    "vulva",
    "cock",
    "cunt",
    "dick",
    "fuck",
    "penis",
    "piss",
    "sexual",
    "shit",
    "vagina",
];

var EnglishDefinitions;
await import("./EnglishDefinitions.mjs").then(function (data) {
    EnglishDefinitions = data.EnglishDefinitions;
    console.log("EnglishDefinitions.mjs " + EnglishDefinitions.length + " definitions loaded");
})
.catch(function (err) {
    zl.extract('./plugins/wordgenerator/src/EnglishDefinitions.zip', "./plugins/wordgenerator/src/")
    .then(function (data) {
        EnglishDefinitions = data.EnglishDefinitions;
    }, function (err) {
        console.log("EnglishDefinitions.mjs error", err);
    })
    .catch(function (err) {
        console.log("EnglishDefinitions.mjs error", err);
    });
});
export default class WordGenerator {

    constructor() {
        this.usedWords = [];
        this.definitions = new Map();
        this.lastWord = null;
        this.words = new Set();
        this.commonWords = this.initCommonWords();
        this.wordList = null;
        this.commonWordList = null;
        this.initializeWordList()
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

        if (EnglishDefinitions?.length < 1) {
            throw "EnglishDefinitions did not load";

        }

        for (var x of EnglishDefinitions) {
            //no spaces
            //no initialism
            //no abbreviation
            //no phrase
            //no ALL CAPS
            //no short words
            //only alpha

            var key = x.word.toLowerCase();
            var match = key.match(/[a-z]*/);

            if (
                match &&
                match[0].length === key.length &&
                key.indexOf(" ") === -1 &&
                key.length > 2 &&
                bannedWords.every(b => key.indexOf(b) === -1) &&
                bannedDefs.every(b => x.definition.indexOf(b) === -1) &&
                bannedTags.every(b => x.tags.indexOf(b) === -1) &&
                x.partOfSpeech.indexOf("Prepositional phrase") === -1 &&
                this.getClosestDistance(key, x.definition.split(" ")) > 2) {
                this.words.add(key);
            }

            if (x.definition) {
                var activeDef = this.definitions.get(key);

                if (activeDef) {
                    //if there is already a definition for the word
                    //add the new one to the list
                    activeDef.push(x);
                    this.definitions.set(key, activeDef);
                } else {
                    //there isn't a definition yet
                    //create the array and push
                    var arr = [];
                    arr.push(x);
                    this.definitions.set(key, arr);
                }
            }
        }

        var endTime = Date.now();
    }

    getClosestDistance(word, list) {
        var returnMe = Infinity;

        list.forEach(x => {
            var d = this.getLevenshteinDistance(word, x);

            if (d < returnMe) {
                returnMe = d;
            }
        });

        return returnMe;
    }

    getWordFromList(list, length) {
        if (length && length > 0) {
            list = list.filter(x => x.length === length);
        }

        var index = Math.floor(Math.random() * list.length);
        this.lastWord = list[index];
        this.usedWords.push(list[index]);
        return list[index];
    }

    getCommonWord(length) {
        return this.getWordFromList(this.getCommonWordList(), length);
    }

    getRandomWord(length) {
        return this.getWordFromList(this.getWordList(), length);
    }

    getDefinition(key) {
        var self = this;
        if (!key && this.lastWord) {
            key = this.lastWord;
        }
        if (!key) {
            return null;
        }

        key = key.toLowerCase();

        var arr = this.definitions.get(key);

        if (arr) {
            var returnMe = null;
            //get one of the definitions for the given key
            var defIndex = Math.floor(Math.random() * arr.length);

            //we don't want self-referencing definitions
            bannedDefs.forEach(function (element, index, array) {
                var i = arr[defIndex].definition.indexOf(element);
                if (i > -1) {
                    var newDef = arr[defIndex].definition.substr(i + element.length).trim();
                    var newWord = newDef.split(" ")[0];
                    returnMe = self.getDefinition(newWord);
                }
            });

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
        var keys = Array.from(this.words.keys())
            .filter(x => x.indexOf(letter) === 0);

        return this.getPrefixedWordsFromList(keys, letter, size);
    }

    getLevenshteinDistance(a, b) {
        var prev = [];
        var current = [];
        for (let i = 0; i < b.length + 1; i++) {
            prev.push(i);
        }

        for (let i = 0; i < a.length; i++) {
            current[0] = i + 1;

            for (let j = 0; j < b.length; j++) {
                let substituteCost = null;
                let deleteCost = prev[j + 1] + 1;
                let insertCost = current[j] + 1;

                if (a[i] === b[j]) {
                    substituteCost = prev[j];
                } else {
                    substituteCost = prev[j] + 1;
                }

                current[j + 1] = substituteCost;

                if (deleteCost < current[j + 1]) {
                    current[j + 1] = deleteCost;
                }
                if (insertCost < current[j + 1]) {
                    current[j + 1] = insertCost;
                }

            }
            let temp = current;
            current = prev;
            prev = temp;
        }
        return prev[b.length];
    }

    getAcronym(word) {
        return this.getAcro(this.getWordList(), word);
    }

    getCommonAcronym(word) {
        return this.getAcro(this.getCommonWordList(), word);
    }

    getAcro(list, word) {
        var self = this;
        var returnMe = "";

        word.split("").forEach(function (letter) {
			var wordList = Array.from(list)
                .filter(x => x.indexOf(letter) === 0);

            returnMe += " " + self.getPrefixedWordsFromList(wordList, letter, 1);
        });
		
        return returnMe.trim();
    }

}
