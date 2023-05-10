//Require

import Trie from './trie.mjs';

import LanguageLookup from './languageLookup.mjs';
import LanguageDetect from "languagedetect";
import WordEvolver from './wordEvolver.mjs';
import Statistics from './statistics.mjs';
import {
    performance,
    PerformanceObserver
}
from 'node:perf_hooks';
import markov from 'markov';

// Constants

const specialchars = "ÀÁÂÃÄÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÜÝßÞßàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿĀāĂăĄąĆĆćĈĉĊċČčĎďĐđĒēĔĕĖėęĚěĜĝĞğĠĢģĤĐĥĦħĨĨĩĪīĬĭĮįİıĲĲĳĴĵĶķĸĸĹĺĻļľĿŀŁłŃńŅņŇňŉŊŋŌōŎŏŐőŒœœŔŕŖŗŘřŚśŜŝŞşŠšŢţŤŦŧũŪūŬŭŮůŰűŲųŴŵŶŸŹźŻżŽžſƀƁƂƃƄƅƆƇƈƉƊƋƌƍƎƏƐƑƒƓƔƕƖƗƘƙƚƛƜƝƞƟƠơƢƣƤƥƦƧƨƩƪƫƬƭƮƯưƱƲƳƴƵƶƷƸƹƺƾƿǂ";
const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-" + specialchars;
const language_match_threshold = ('LANGUAGE_MATCH_THRESHOLD' in process.env) ? process.env.LANGUAGE_MATCH_THRESHOLD : 0.4;
const max_violations = ('MAX_GORKBLORF_VIOLATIONS' in process.env) ? process.env.MAX_GORKBLORF_VIOLATIONS : 1;
const puncutation_chance = 5;
const url_re = /(^|\s)((https?:\/\/)?[\w-]+(\.[\w-]+)+\.?(:\d+)?(\/\S*)?)/gi;
const mention_re = /\@\w+/gim;
const training_word_re = /[^\w.!?'"-]/gi;
const hypnogram_query_re = /[^A-Za-z]/gi;
const dictionary_match_re = /[^\w \-_]/g;
const digit_emojii = ["0️⃣", "1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟"];
const mutationChance = .05;

const wordEvolver = new WordEvolver(charset, mutationChance);
const languageLookup = new LanguageLookup();
const languageDetect = new LanguageDetect();
const statistics = new Statistics();
const markov_bot = markov();

export default class Gorkblorf {

    constructor(data, FileRepository) {
		//this is also called in a Worker, so FileRepository won't have any functions in that case
        this.FileRepository = FileRepository;
        this.nonWordsTrie = new Trie(data?.nonWordsTrie?.root);
        this.distanceCache = new Map(data?.distanceCache);
        this.checkedWordCounter = data?.checkedWordCounter ?? 0;
    }


    generateRandomMessage(words) {
        // words = []

        let length = Math.floor(Math.random() * words.length);
        let indexes = [];

        for (let i = 0; i < length; i++) {
            indexes.push(Math.floor(Math.random() * words.length));
        }

        let phrase = indexes.map(function (i) {
            return words[i];
        }).join(" ");

        return phrase;
    }

    mutateVocab(words) {
        // FileRepository.log("mutateVocab", words);
        // words = "all words to mutate"
        for (let j = 0; j < 2; j++) {
            //let's run twice, just to get some variance
            let newWords = "";
            for (let i = 0; i < words.length / 5; i++) {
                let validWords = this.validateGorkblorfMessage(wordEvolver.getNewWords(words).join(" "))["valid"];
                if (validWords.length > 0) {
                    // FileRepository.log("mutateVocab seeding", validWords);

                    var list = words.concat(validWords);

                    for (let j = 0; j < list.length / 5; j++) {

                        var arr = [];
                        var count = Math.floor(
                                (Math.random() + Math.random() + Math.random()) * 10);

                        for (let k = 0; k < count; k++) {
                            arr.push(list[Math.floor(Math.random() * list.length)]);
                        }

                        markov_bot.seed(arr.join(" "));
                    }

                    markov_bot.seed(validWords.join(" "));
                    statistics.addToWordList("me", validWords);
                    newWords += " " + validWords;
                }
            }
            words += newWords;
        }

        // FileRepository.log("mutateVocab fin");
    }

    read(message, authorId) {
        // console.log("gorkblorf.read ", authorId, message);
        // FileRepository.log("gorkblorf.read " + authorId + " " + message);
        // Make sure message is a valid gorkblorf and get violating words
        var self = this;

        if (!message) {
            return;
        }

        let parsedWords = self.validateGorkblorfMessage(message);
        let validString = parsedWords["valid"].join(' ');

        self.seedMarkovChain(message, parsedWords, validString);
        // add to user word list, so we can keep track of who taught which words to the bot
        statistics.addToWordList(authorId, parsedWords["valid"]);

        parsedWords["valid"].forEach(function (word) {
            if (!self.nonWordsTrie.has(word)) {
                if(self.FileRepository?.saveGorkblorfVocab){
					self.FileRepository.saveGorkblorfVocab(word);
				}
                self.nonWordsTrie.insert(word);
            }
        });
        // keep track of violations
        statistics.addToViolations(authorId, parsedWords["invalid"]);
    }

    /*     reply(message) {
    var self = this;
    // Let user know we are generating a response
    message
    .react('💭')
    .then(function (result) {
    message.reply({
    content: getText(),
    ephemeral: false
    });
    });
    }
     */
    getText(message, length) {
		var self = this;
        // self.FileRepository.log("getText", message);
        var key;

        if (!length) {
            length = 4;
        }

        if (message) {
            key = markov_bot.search(message);
        }
        if (!key) {
            key = markov_bot.pick();
        }

        if (key) {
            //lets generate two randoms and add them so we get a ^ graph of lengths, tending toward the middle.
            var limit = Math.floor(Math.random() * length) + Math.floor(Math.random() * length) + 1;
            var returnMe = markov_bot.respond(markov_bot.pick(), limit);

            // todo: punctuation should be in the markov chain
            // var suffix = (Math.round(Math.random() * puncutation_chance) > puncutation_chance - 1) ?
            // ((Math.random() > 0.5) ?
            // "?" :
            // "!") :
            // "";

            // var returnMe = returnMe + suffix;
            // returnMe = returnMe.replace(',', ' ');

            // FileRepository.log("getText return ", returnMe.join(" "));
            return returnMe.join(" ");
        } else {
            return "No key returned from markov chain. Has it been seeded yet?";
        }
    }

    getCurrentUserStatisticsMessage(interaction) {
        return {
            content: getStatisticsMessage(interaction.user.id),
            ephemeral: true
        };
    }

    getStatisticsMessage(userId) {
        return `**${this.getText(null, 3)}:  **\n${this.getWordCount(userId)}.\n `
         + `**${this.getText(null, 3)}:  **\n${this.getViolations(userId)}.`;

    }

    getWords(userId) {

        let words = statistics.userStatistics.get(userId)?.words ?? null;

        if (words) {
            return Array.from(words).join('\n');
        } else {
            return "";
        }
    }

    getWordCount(userId) {

        let words = statistics.userStatistics.get(userId)?.words ?? null;

        if (words) {
            return Array.from(words).length;
        } else {
            return 0;
        }
    }

    getViolations(userId) {
        let violations = statistics.userStatistics.get(userId)?.violations ?? null;

        if (violations) {
            return violations.length;
            // return violations.map(violation => `${violation.timestamp.toString()}: ${violation.word}`).join('\n');
        } else {
            return "";
        }
    }

    seedMarkovChain(message, parsedWords, validString) {
		
        // console.log("seedMarkovChain", parsedWords, validString);
        // Train the markov chain with the new data
        if (parsedWords["invalid"].length < max_violations &&
            // parsedWords["valid"].length >= max_violations &&
            validString.length > 0) {
            // console.log("Adding new message to markov database:", validString);
            markov_bot.seed(validString);
        }
    }

    validateGorkblorfMessage(message) {
        var self = this;
        // FileRepository.log("validateGorkblorfMessage message" + message);
        var violations = [];
        var valid_words = [];
        var clean_message = this.sanitizeMessage(message);
        var confidenceThreshold = 0.7;

        // Split the sentence into discrete words so we can accumuklate individual gorkblorf violations
        var split_phrase = clean_message.split(' ');

        var word_idx = 0;
        split_phrase.forEach(word => {
            var lowerCaseWord = word.toLowerCase();
            // FileRepository.log("word", word);
            var valid_word = false;

            if (word.length < 3) {
                return;
            }

            // Get language match confidences
            let detected_languages = languageLookup.find(lowerCaseWord.replace(dictionary_match_re, ''));
            let detectedLanguages = languageDetect.detect(lowerCaseWord);
            // let levenshtein = languageLookup.getClosestMatch(lowerCaseWord);

            detectedLanguages = detectedLanguages
                .filter(x => x[1] > confidenceThreshold);

            // We might not match any existing language (gorkblorf!)
            if (detected_languages.length > 0) {
                let languages = detected_languages.join(", ");

                violations.push({
                    "word": word,
                    "language": languages,
                    "index": word_idx
                });
                // FileRepository.log("Violation:", word + ",", "Language:", languages + ",", "Confidence:", detected_languages.length);
            } else if (detectedLanguages.length > 0) {
                violations.push({
                    "word": word,
                    "language": detectedLanguages.join(", "),
                    "index": word_idx
                });
                // } else if (!self.nonWordsTrie.has(lowerCaseWord) && languageLookup.getClosestMatchTrie(lowerCaseWord).distance < Math.floor(word.length / 5) + 1) {
            } else if (!self.nonWordsTrie.has(lowerCaseWord)) {
                var match;

                if (self.distanceCache.has(word)) {
                    match = self.distanceCache.get(word);
                } else {
                    // console.log("checking distance for word", lowerCaseWord);
                    var trimmedWord = this.removeRepeatedLetters(lowerCaseWord);
                    match = languageLookup.getClosestMatchTrie(lowerCaseWord).distance;
                    var otherMatch = languageLookup.getClosestMatchTrie(trimmedWord).distance;

                    self.checkedWordCounter++;

                    if (match > otherMatch) {
                        match = otherMatch;
                    }

                    self.distanceCache.set(word, match);
                }

                if (match.distance < Math.floor(word.length / 5) + 1) {
                    violations.push({
                        "word": match.word,
                        "language": match.language,
                        "index": word_idx
                    });
                }
				else{
					valid_word = true;
				}
            } else {
                valid_word = true;
            }

            if (valid_word) {
                valid_words.push(word.replace(training_word_re, ''));
            }

            word_idx += 1;
        });

        // Reset existing reaction
        // FileRepository.log(message.reactions);
        // if(message.reactions){
        //   message.reactions.forEach(reaction => reaction.remove(client.user.id));
        // }


        return {
            "valid": valid_words,
            "invalid": violations
        };
    }

    sanitizeMessage(message_str) {
        // FileRepository.log("sanitizeMessage", message_str);
        if (message_str) {
            return message_str.replace(url_re, '')
            .replace(mention_re, '');
        } else {
            return "";
        }
    }

    removeRepeatedLetters(word) {
        var deleteIndexes = [];

        var returnMe = [];
        for (let i = 1; i < word.length; i++) {
            if (word[i - 1] === word[i]) {
                deleteIndexes.push(i);
            } else {
                returnMe.push(word[i - 1]);
            }
        }
        returnMe.push(word[word.length - 1]);

        return returnMe.join("");
    }

    /*     // todo delete if unused
    numberToEmojii(num) {
    if (num < digit_emojii.length && num >= 0) {
    return digit_emojii[num];
    }
    return "💬";
    }
     */
}