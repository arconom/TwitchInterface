
class State {
    constructor() {
        this.transitions = {}; // key-value pairs where the key is the input symbol and the value is the next state
        this.final = false; // indicates if this state is a final state
    }

    addTransition(symbol, nextState) {
        this.transitions[symbol] = nextState;
    }

    getNextState(symbol) {
        return this.transitions[symbol];
    }

    setFinal() {
        this.final = true;
    }

    isFinal() {
        return this.final;
    }
}

export default class Dafsa {
    constructor() {
        this.states = [new State()]; // the initial state is always the first state
    }

    insert(word) {
        var currentState = this.states[0];
        for (var i = 0; i < word.length; i++) {
            var symbol = word.charAt(i);
            var nextState = currentState.getNextState(symbol);
            if (!nextState) {
                nextState = new State();
                currentState.addTransition(symbol, nextState);
                this.states.push(nextState);
            }
            currentState = nextState;
        }
        currentState.setFinal();
    }

    has(word) {
        var currentState = this.states[0];
        for (var i = 0; i < word.length; i++) {
            var symbol = word.charAt(i);
            var nextState = currentState.getNextState(symbol);
            if (!nextState) {
                return false;
            }
            currentState = nextState;
        }
        return currentState.isFinal();
    }
	
	getClosest(word){
		var maxCost = 2;
		return getLevenshteinDistance(word, maxCost);
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

        Object.keys(self.states[0].transitions).forEach(function (node) {
            self.getLevenshteinDistanceRecursively(node, 
				node, 
				query, 
				currentRow, 
				results, 
				maxCost);
        });

        // FileRepository.log("Helper.getLevenshteinDistanceTrie " + query + " returning " + JSON.stringify(results));
        return results;
    }

    getLevenshteinDistanceRecursively(node, letter, potentialMatch, word, previousRow, results, maxCost) {
        if (!node) {
            throw "getLevenshteinDistanceRecursively node is undefined";
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
            node.final &&
            currentRow[currentRow.length - 1] < results.cost) {
            // console.log("updating result ", node.symbol, currentRow[currentRow.length - 1]);
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
			Object.keys(node.transitions)
			.forEach(function (child) {
                this.getLevenshteinDistanceRecursively(node.transitions[child], 
				child, 
				potentialMatch + child, 
				word, 
				currentRow, 
				results, 
				maxCost);
            });
        }
    }

	
	
}
