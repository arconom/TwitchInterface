
class TrieNode {
    constructor() {
        this.children = {};
        this.endOfWord = false;
    }
}

export default class Trie {
    constructor() {
        this.root = new TrieNode();
    }

    insert(word) {
        var node = this.root;
        for (var i = 0; i < word.length; i++) {
            var c = word.charAt(i);
            if (!node.children[c]) {
                node.children[c] = new TrieNode();
            }
            node = node.children[c];
        }
        node.endOfWord = true;
    }

    has(word) {
        var node = this.root;
        for (var i = 0; i < word.length; i++) {
            var c = word.charAt(i);
            if (!node.children[c]) {
                return false;
            }
            node = node.children[c];
        }
        return node.endOfWord;
    }

    isClose(query) {
        for (var i = 0; i < query.length; i++) {
            for (var j = 0; j < 26; j++) {
                // iterate over the 26 letters of the alphabet
                var c = String.fromCharCode('a'.charCodeAt(0) + j);
                var newWord = query.slice(0, i) + c + query.slice(i + 1);
                if (this.has(newWord)) {
                    return true;
                }
            }
        }
    }

    getLevenshteinDistance(query, maxCost) {
        // FileRepository.log("Helper.getLevenshteinDistanceTrie " + query);
        var self = this;
        var currentRow = [];
        for (let i = 0; i < query.length; i++) {
            currentRow.push(i);
        }
        var results = {
            word: "",
            cost: Infinity
        };

        Object.keys(self.root.children).forEach(function (key) {
            self.getLevenshteinDistanceRecursively(self.root.children[key], key, "", query, currentRow, results, maxCost);
        });

        // FileRepository.log("Helper.getLevenshteinDistanceTrie " + query + " returning " + JSON.stringify(results));
        return results;
    }

    getLevenshteinDistanceRecursively(node, letter, potentialMatch, word, previousRow, results, maxCost) {
        var self = this;
        if (!node) {
            throw "node is undefined";
        }

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
        if (currentRow[currentRow.length - 1] != null && currentRow[currentRow.length - 1] <= maxCost && node.value > -1 && currentRow[currentRow.length - 1] < results.cost) {
            results.word = potentialMatch;
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
            Object.keys(node.children).forEach(function (key) {
                self.getLevenshteinDistanceRecursively(node.children[key], potentialMatch + key, word, currentRow, results, maxCost);
            });
        }
    }

}

function test() {
    var t = new Trie();
    t.insert("ass");
    t.insert("face");
    t.insert("penis");

    FileRepository.log("t has ass", t.has("ass"));
    FileRepository.log("t has AS", t.has("AS"));
    FileRepository.log("t has as", t.has("as"));
    FileRepository.log("t has face", t.has("face"));
    FileRepository.log("t has steve", t.has("steve"));
}
