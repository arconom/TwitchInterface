import {
    FileRepository
}
from "./FileRepository.mjs";

export default class Helper {

    static getLevenshteinDistance(a, b) {
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

/*     static getLevenshteinDistanceTrie(query, trie, maxCost) {
        // FileRepository.log("Helper.getLevenshteinDistanceTrie " + query);
        var currentRow = [];
        for (let i = 0; i < query.length; i++) {
            currentRow.push(i);
        }
        var results = {
            word: "",
            cost: Infinity
        };

        trie.root.children.forEach(function (node) {
            Helper.getLevenshteinDistanceRecursively(node, node.symbol.substr(node.symbol.length - 1), query, currentRow, results, maxCost, trie);
        });

        // FileRepository.log("Helper.getLevenshteinDistanceTrie " + query + " returning " + JSON.stringify(results));
        return results;
    }

    static getLevenshteinDistanceRecursively(node, letter, word, previousRow, results, maxCost, trie) {
        if (!node) {
            throw "node is undefined";
        }

        // console.log("getLevenshteinDistanceRecursively", "word", (word ?? ""),  "node", (node.symbol ?? ""), "previousRow", previousRow, "results", results);
        var currentRow = [previousRow[0] + 1];

        for (let i = 1; i < word.length + 1; i++) {
            var insertCost = currentRow[i - 1] + 1;
            var deleteCost = previousRow[i] + 1;
            var replaceCost;

            if (word[i - 1] != letter) {
                replaceCost = previousRow[i - 1] + 1;
            } else {
                replaceCost = previousRow[i - 1];
            }

            var appendMe = replaceCost;

            if (deleteCost < appendMe) {
                appendMe = deleteCost;
            }
            if (insertCost < appendMe) {
                appendMe = insertCost;
            }

            currentRow.push(appendMe);
        }

        // if the last entry in the row indicates the optimal cost is less than the maximum cost,
        // and there is a word in this trie node, then add it.
        if (currentRow[currentRow.length - 1] != null &&
            currentRow[currentRow.length - 1] <= maxCost &&
            node.value > -1 &&
            currentRow[currentRow.length - 1] < results.cost) {
            // console.log("updating result ", node.symbol, currentRow[currentRow.length - 1]);
            results.word = node.symbol;
            results.cost = currentRow[currentRow.length - 1] ?? Infinity;
        }

        // if any entries in the row are less than the maximum cost,
        // then recursively search each branch of the trie

        var min = Infinity;

        for (let i = 0; i < currentRow.length; i++) {
            if (currentRow[i] < min) {
                min = currentRow[i];
            }
        }


        if (min <= maxCost) {
            node.children.forEach(function (child) {
                Helper.getLevenshteinDistanceRecursively(child, 
				child.symbol.substr(child.symbol.length - 1), 
				word, 
				currentRow, 
				results, 
				maxCost, 
				trie);
            });
        }
    }
 */
    static removeRepeatedLetters(word) {
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

}
