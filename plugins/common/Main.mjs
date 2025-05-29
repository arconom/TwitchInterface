import fs from 'fs';
import zl from "zip-lib";
import {CommonEnglishWords} from "./src/CommonEnglishWords.mjs";

import {EnglishPrefixes} from "./src/EnglishPrefixes.mjs";
import {EnglishSuffixes} from "./src/EnglishSuffixes.mjs";
import {EnglishSyllables} from "./src/EnglishSyllables.mjs";
import {WordSyllabizer} from "./src/WordSyllabizer.mjs";


var EnglishDefinitions;
await import("./src/EnglishDefinitions.mjs").then(function (data) {
    EnglishDefinitions = data.EnglishDefinitions;
})
.catch(function (err) {
    zl.extract('./plugins/common/src/EnglishDefinitions.zip', "./plugins/common/src/")
    .then(async function (data) {
        await import("./src/EnglishDefinitions.mjs").then(function (data) {
            EnglishDefinitions = data.EnglishDefinitions;
        })
    }, function (err) {
        console.log("EnglishDefinitions.mjs error", err);
    })
    .catch(function (err) {
        console.log("EnglishDefinitions.mjs error", err);
    });
});



var plugin = {
    name: "common",

    //commands is a map of keys and functions that take an object as a parameter and return a string
    // {
    // target: target,
    // msg: msg,
    // context: new TwitchChatMessageContext(context),
    // "self": isSelf,
    // chatBot: self
    // }
    exports: {
        commonEnglishWords: CommonEnglishWords,
        englishDefinitions: EnglishDefinitions,
        englishPrefixes: EnglishPrefixes,
        englishSuffixes: EnglishSuffixes,
        englishSyllables: EnglishSyllables,
        wordSyllabizer: WordSyllabizer
    }
};
export default plugin;
