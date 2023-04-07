import WordGenerator from "./WordGenerator.mjs";
import {
    FileRepository
}
from "./FileRepository.mjs";

export default class Wordle {

    constructor(word, maxAttempts) {
        this.selectedWord = word?.toLowerCase();

        if (!maxAttempts) {
            maxAttempts = word.length + 2;
        }

        this.maxAttempts = maxAttempts;

        this.attempts = 0;
        this.previousAttempts = new Set();
        this.missingLetters = new Set();
        this.hasLetters = new Set();
        this.matchingLetters = new Map();
        this.lastGuess = "";

        this.wordGenerator = new WordGenerator();
    }

    submit(word) {
        FileRepository.log("submit", word);
        //check the word against the instance word
        word = word.toLowerCase();
        this.lastGuess = word;
        if (word.length === this.selectedWord.length) {
            if (this.wordGenerator.getDefinition(word)) {
                this.attempts++;
                if (this.attempts <= this.maxAttempts) {

                    var selectedLetters = this.selectedWord.split("");
                    var letters = word.split("");
                    var max = letters.length;
                    var ml = Array.from(this.matchingLetters.keys());

                    ml.forEach(function (x, i, a) {
                        if (!letters[i] === x) {
                            this.statusMessage = "Your submission doesn't conform to the matched letters.";
                            return;
                        }
                    });

                    this.statusMessage = null;

                    if (selectedLetters.length < max) {
                        max = selectedLetters.length;
                    }

                    for (let i = 0; i < max; i++) {
                        if (selectedLetters[i] === letters[i]) {
                            //matching letter, matching position
                            this.matchingLetters.set(i, true);
                        } else if (selectedLetters.indexOf(letters[i]) > -1
                             && !this.matchingLetters.get(i)) {
                            //has the letter
                            this.hasLetters.add(letters[i]);
                        } else {
                            //does not have the letter
                            this.missingLetters.add(letters[i]);
                        }
                    }
                } else {
                    this.statusMessage = "You have run out of guesses.  The answer is " + this.selectedWord;
                }
            } else {
                this.statusMessage = word + " was not found in the dictionary.  Plurals are removed.";
            }
        } else {
            this.statusMessage = "Length doesn't match.  You must guess an actual word with matching length.";
        }
    }

    status(clearPreviousMessage) {
        if (clearPreviousMessage) {
            this.statusMessage = "";
        }

        if (this.statusMessage && this.statusMessage.length > 0) {
            return this.statusMessage;
        }

        if (this.matchingLetters.size === this.selectedWord.length) {
            return "You have completed the wordle.  It took " + this.attempts + " guesses.";
        }

        var returnMe = "";
        var sw = this.selectedWord.split("");

        for (let i = 0; i < sw.length; i++) {
            if (this.matchingLetters.get(i)) {
                returnMe += sw[i] + " ";
            } else {
                returnMe += "_ ";
            }
        }

        return returnMe.trim() +
        "  " + this.selectedWord.length + " letters" +
        "  " + (this.maxAttempts - this.attempts) + " attempts left" +
        " + " + Array.from(this.hasLetters).sort().join("") +
        " - " + Array.from(this.missingLetters).sort().join("");
    }
}
