import {EnglishSyllables} from "./EnglishSyllables.mjs";

export class WordSyllabizer {

    constructor() {}

    Syllabize(word) {
        let startIndex = 0;
        let endIndex = word.length - 1;
        let syllables = [];

        if (EnglishSyllables.has(word)) {
            syllables = EnglishSyllables.get(word).split("-");
        } else {
            let indexA = Math.floor(Math.random() * word.length);
            let indexB = Math.floor(Math.random() * word.length);

            if (indexA > indexB) {
                let temp = indexA;
                indexA = indexB;
                indexB = temp;
            }

            syllables.push(word.substr(0, indexA));
            syllables.push(word.substr(indexA, indexB));
            syllables.push(word.substr(indexB));
        }

        return syllables;

        // EnglishPrefixes.forEach(function (prefix) {
        // if (word.indexOf(prefix) === 0) {
        // startIndex = prefix.length - 1;
        // break;
        // }
        // });

        // EnglishSuffixes.forEach(function (suffix) {
        // if (word.indexOf(suffix) === word.length - suffix.length - 1) {
        // endIndex = word.length - suffix.length - 1;
        // break;
        // }
        // });

        // let trimmedWord = word.substr(startIndex, endIndex);
        // let hyphenIndexes = [];
        // findPatternIndexes(trimmedWord, 0, hyphenIndexes);
        // console.log(
        // word.substr(0, startIndex) + "-" +
        // hyphenate(trimmedWord, hyphenIndexes) + "-" +
        // word.substr(endIndex)
        // );
    }
}

// function findPatternIndexes(word, offset, indexes) {
    // patterns.forEach(function (pattern) {
        // const match = word.match(pattern);

        // if (match != null) {
            // const endOfMatchIndex = match.index + pattern.length - 1;
            // indexes.push(match.index + offset);

            // if (match.index > 0) {
                // findPatternIndexes(word.substr(0, match.index), offset, indexes);
            // }

            // if (endOfMatchIndex < word.length) {
                // findPatternIndexes(word.substr(endOfMatchIndex), offset + endOfMatchIndex, indexes);
            // }
        // }
    // });
// }

// function hyphenate(word, indexes) {
    // let splitWord = [];

    // splitWord.push(word.substr(0, indexes[0]));

    // for (let i = 0; i < indexes.length - 2; i++) {
        // splitWord.push(indexes[i], indexes[i + 1]);
    // }

    // splitWord.push(word.substr(indexes[indexes.length - 1]));
    // splitWord.join("-");
    // return splitWord;
// }

// const patterns =
    // [
    // /[aeiou][^aeiou]{2}[aeiou]/,
    // /[^aeiou][aeiou][^aeiou]/,
    // /[aeiou]{2}/
// ];
