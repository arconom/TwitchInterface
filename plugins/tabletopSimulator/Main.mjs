import TabletopSimulatorController from "./src/tabletopSimulatorController.mjs";

var plugin = {
    name: "tabletopSimulator",

    //commands is a map of keys and functions that take an object as a parameter and return a string
    // {
    // target: string,
    // msg: string,
    // context: Object<TwitchChatMessageContext>,
    // "self": bool,
    // chatBot: Object<ChatBot>
    // }
    exports: {
        actions: null
    },
    commands: new Map(),
    load: function (globalState) {
        // this function will be called by Main.js in the app
        //load whatever dependencies you need in here and do setup
        const FileRepository = globalState.get("filerepository");
        FileRepository.log("tabletopSimulator.load");
        const App = globalState.get("app");
        const OverlayWebSocket = App.overlayWebSocket;
        const Constants = globalState.get("constants");
        const stateKey = "tabletopSimulator";
        plugin.exports.actions = new Map();
        plugin.exports.tabletopSimulatorController = new TabletopSimulatorController();

        plugin.exports.actions.set("Roll Dice", {
            name: "Roll Dice",
            description: "",
            defaultJson: ``,
            handler: async function (globalState, obj, json) {
                FileRepository.log("tabletopSimulator.Roll Dice" + " \r\n " + JSON.stringify(json));
                const key = obj.target + ":" + stateKey;

                plugin.exports.tabletopSimulatorController.rollDice();
            }
        });

        plugin.exports.actions.set("Choose Seat Colour", {
            name: "Choose Seat Colour",
            description: "sit at the table",
            defaultJson: ``,
            handler: async function (globalState, obj, json) {
                FileRepository.log("tabletopSimulator.Choose Seat Colour json" + " \r\n " + JSON.stringify(json));
                const key = obj.target + ":" + stateKey;

                let seatColour = obj?.msg?.split(" ")[1] ?? "";

                let seatedPlayers = App.chatBot.chatCommandManager
                    .getCommandState(key + ":seated:players") ?? new Map();

                // FileRepository.log("tabletopSimulator.Choose Seat Colour selected seat colour" + seatColour);
                // FileRepository.log("tabletopSimulator.Choose Seat Colour seated players" + " \r\n " + JSON.stringify(Array.from(seatedPlayers.entries())));
                // FileRepository.log("tabletopSimulator.Choose Seat Colour currently seated player " + " \r\n " +
                // JSON.stringify(seatedPlayers.has(seatColour)));

                if (seatColour != "gray" && seatedPlayers.has(seatColour)) {
                    return "The " + seatColour + " seat is occupied";
                } else {
                    let keys = seatedPlayers.entries();

                    // FileRepository.log("tabletopSimulator.Choose Seat Colour removing current seat assignment");
                    // FileRepository.log("tabletopSimulator.Choose Seat Colour keys " + JSON.stringify(keys));

                    for (var k of keys) {

                        // FileRepository.log("tabletopSimulator.Choose Seat Colour checking key " + k);

                        if (k[1] === obj.context.username) {
                            // FileRepository.log("tabletopSimulator.Choose Seat Colour key " + k + " matches username ");
                            seatedPlayers.delete(k[0]);
                        }
                    }

                    seatedPlayers.set(seatColour, obj.context.username);
                }

                App.chatBot.chatCommandManager
                .setCommandState(key + ":seated:players", seatedPlayers);
            }
        });

        plugin.exports.actions.set("Clear Seats", {
            name: "Clear Seats",
            description: "",
            defaultJson: ``,
            handler: async function (globalState, obj, json) {
                FileRepository.log("tabletopSimulator.Clear Seats" + " \r\n " + JSON.stringify(json));
                const key = obj.target + ":" + stateKey;

                App.chatBot.chatCommandManager
                .setCommandState(key + ":seated:players", initSeatedPlayers());
            }
        });

        plugin.exports.actions.set("Move Character", {
            name: "Move Character",
            description: "Move to location card",
            defaultJson: ``,
            handler: async function (globalState, obj, json) {
                FileRepository.log("tabletopSimulator.Move Character To" + " \r\n ");
                const key = obj.target + ":" + stateKey;
                let location = obj?.msg?.split(" ")[1] ?? "";

                let characterLocations = App.chatBot.chatCommandManager
                    .getCommandState(key + ":character:locations");

                if (!characterLocations) {
                    characterLocations = initCharacterLocations();
                }

                let seatedPlayers = App.chatBot.chatCommandManager
                    .getCommandState(key + ":seated:players");

                let playerColour = getPlayerColour(obj.context.username, seatedPlayers);

                let keys = Object.keys(characterLocations);

                for (var k of keys) {
                    let arr = characterLocations.get(k);

                    characterLocations.set(k, characterLocations.get(k).filter((x) => x !== playerColour));
                }

                App.chatBot.chatCommandManager
                .setCommandState(key + ":character:locations", characterLocations);

                FileRepository.log("tabletopSimulator.Move Character To" + " \r\n " + playerColour + " " + location);
                plugin.exports.tabletopSimulatorController.moveLocationMarker(playerColour, location);
            }
        });

        plugin.exports.actions.set("Move Damage Marker", {
            name: "Move Damage Marker",
            description: "",
            defaultJson: ``,
            handler: async function (globalState, obj, json) {
                FileRepository.log("tabletopSimulator.Move Damage Marker" + " \r\n " + JSON.stringify(json));
                const key = obj.target + ":" + stateKey;
                let damage = obj?.msg?.split(" ")[1] ?? "";
                let seatedPlayers = App.chatBot.chatCommandManager
                    .getCommandState(key + ":seated:players");

                let playerColour = getPlayerColour(obj.context.username, seatedPlayers);

                plugin.exports.tabletopSimulatorController.moveDamageTracker(playerColour, damage);
            }
        });

        plugin.exports.actions.set("Deal To Player", {
            name: "Deal To Player",
            description: "Specify a card name in your Hand or Layout to deal to another player",
            defaultJson: ``,
            handler: async function (globalState, obj, json) {
                FileRepository.log("tabletopSimulator." + " \r\n " + JSON.stringify(json));
                const key = obj.target + ":" + stateKey;
                let seatColour = obj?.msg?.split(" ")[1] ?? "";
                let cardName = obj?.msg?.split(" ")[2] ?? "";
                const currentPlayerColour = getPlayerSeatColour(obj.context.username, key);

                plugin.exports.tabletopSimulatorController.getCardsInHand(currentPlayerColour)
                .then(function (handCards) {
                    plugin.exports.tabletopSimulatorController.getCardsInLayout(currentPlayerColour)
                    .then(function (layoutCards) {
                        // cards = handCards.concat(layoutCards));
                        // let card = getCard(cardName, cards);
                        plugin.exports.tabletopSimulatorController.dealToPlayer(currentPlayerColour, cardName, seatColour);
                    });
                });
            }
        });

        plugin.exports.actions.set("Place At Player", {
            name: "Place At Player",
            description: "Specify a card name in your hand or Layout to place in front of another player",
            defaultJson: ``,
            handler: async function (globalState, obj, json) {
                FileRepository.log("tabletopSimulator." + " \r\n " + JSON.stringify(json));
                const key = obj.target + ":" + stateKey;
                let seatColour = obj?.msg?.split(" ")[1] ?? "";
                let cardName = obj?.msg?.split(" ")[2] ?? "";
                const currentPlayerColour = getPlayerSeatColour(obj.context.username, key);

                plugin.exports.tabletopSimulatorController.getCardsInHand(currentPlayerColour)
                .then(function (handCards) {
                    plugin.exports.tabletopSimulatorController.getCardsInLayout(currentPlayerColour)
                    .then(function (layoutCards) {
                        // cards = handCards.concat(layoutCards));
                        // let card = getCard(cardName, cards);
                        plugin.exports.tabletopSimulatorController.placeAtPlayer(currentPlayerColour, cardName, seatColour);
                    });
                });
            }
        });

        plugin.exports.actions.set("Discard", {
            name: "Discard",
            description: "Send a card to the discard pile",
            defaultJson: ``,
            handler: async function (globalState, obj, json) {
                FileRepository.log("tabletopSimulator.Discard" + " \r\n " + JSON.stringify(json));
                const key = obj.target + ":" + stateKey;
                let cardName = obj?.msg?.split(" ")[1] ?? "";
                const currentPlayerColour = getPlayerSeatColour(obj.context.username, key);
                plugin.exports.tabletopSimulatorController.discardByName(cardName, currentPlayerColour);

                /*
                let cards = null;

                plugin.exports.tabletopSimulatorController.getCardsInHand(currentPlayerColour)
                .then(function(handCards){
                plugin.exports.tabletopSimulatorController.getCardsInLayout(currentPlayerColour)
                .then(function(layoutCards){
                cards = handCards.concat(layoutCards));
                FileRepository.log("tabletopSimulator.Discard cards in hand" + " \r\n " + cards);
                let card = getCard(cardName, cards);
                });
                });

                });
                 */
            }
        });

        plugin.exports.actions.set("Search", {
            name: "Search",
            description: "Specify Draw|Discard and White|Green|Black",
            defaultJson: ``,
            handler: async function (globalState, obj, json) {
                const key = obj.target + ":" + stateKey;
                let deckType = obj?.msg?.split(" ")[2] ?? "";
                let deckColour = obj?.msg?.split(" ")[1] ?? "";
                let term = obj?.msg?.split(" ")[3] ?? "";
                const currentPlayerColour = getPlayerSeatColour(obj.context.username, key);
                FileRepository.log("tabletopSimulator.Search" + deckColour + " " + deckType + " " + term);

                let searchString = "{name=\"" + term + 
					"\", description=\"" + term +
				"\", gm_notes=\"" + term + "\"}";

                plugin.exports.tabletopSimulatorController.searchForCard(deckType, deckColour, searchString, currentPlayerColour);
                // .then(function (card) {

                    // const currentPlayerColour = getPlayerSeatColour(obj.context.username, key);

                    // FileRepository.log("tabletopSimulator.Search card " + JSON.stringify(card));

                    // if (deckColour === "green") {
                        // plugin.exports.tabletopSimulatorController.draw(deckColour, card.name, currentPlayerColour);
                    // } else {
                        // plugin.exports.tabletopSimulatorController.placeAtPlayer(deckColour, card.name, currentPlayerColour);
                    // }
                // });
            }
        });

        plugin.exports.actions.set("Get Hand", {
            name: "Get Hand",
            description: "",
            defaultJson: ``,
            handler: async function (globalState, obj, json) {
                FileRepository.log("tabletopSimulator.Get Hand" + " \r\n " + JSON.stringify(json));
                const key = obj.target + ":" + stateKey;
                const currentPlayerColour = getPlayerSeatColour(obj.context.username, key);
                let userId = null;

                for (let kvp of App.users.entries()) {
                    // FileRepository.log("kvp " + kvp[0] + " " + JSON.stringify(kvp[1]));
                    if (kvp[1].login === obj.context.username) {
                        userId = kvp[0];
                    }
                }

                if (!userId) {
                    FileRepository.log("tabletopSimulator.Get Hand no userid for " + obj.context.username);
                    return;
                }

                plugin.exports.tabletopSimulatorController.getCardsInHand(currentPlayerColour)
                .then(function (handCards) {
                    FileRepository.log("handCards\r\n" + JSON.stringify(handCards));

                    let cards = null;
                    try {
                        cards = JSON.parse(handCards.customMessage.json);
                    } catch (e) {}

                    if (cards != null) {
                        return App.twitchAPIProvider.sendWhisper({
                            "from_user_id": App.botUserInfo.id,
                            "to_user_id": userId,
                            "message": cards.map(function (card) {
                                return card.name + " " + card.gmNotes + " " + card.description + " | "
                            }).join("\r\n")
                        }, function (result) {});
                    }
                });
            }

            /*
            TwitchEndpoints.set(
            "sendWhisper", {
            name: "Send Whisper",
            args: {"from_user_id": "",
            "to_user_id": "",
            "message": ""
            }
            });
             */
        });

        plugin.exports.actions.set("Draw Card", {
            name: "Draw Card",
            description: "",
            defaultJson: ``,
            handler: async function (globalState, obj, json) {
                FileRepository.log("tabletopSimulator." + " \r\n " + JSON.stringify(json));
                const key = obj.target + ":" + stateKey;
                let deckColour = obj?.msg?.split(" ")[1] ?? "";
                let numCards = obj?.msg?.split(" ")[2] ?? "1";
                const currentPlayerColour = getPlayerSeatColour(obj.context.username, key);

                FileRepository.log("tabletopSimulator.Draw Card currentPlayerColour " + currentPlayerColour);
                FileRepository.log("tabletopSimulator.Draw Card deckColour " + deckColour);

                plugin.exports.tabletopSimulatorController.draw(deckColour, numCards, currentPlayerColour);
            }
        });

        function getPlayerSeatColour(username, key) {
            FileRepository.log("tabletopSimulator.getPlayerSeatColour username: " + username + " key: " + key);
            const seatedPlayerMap = App.chatBot.chatCommandManager
                .getCommandState(key + ":seated:players");

            // FileRepository.log("tabletopSimulator.getPlayerSeatColour seatedPlayerMap: " + JSON.stringify(Array.from(seatedPlayerMap.entries())));
            return getPlayerColour(username, seatedPlayerMap);
        }

        return Promise.resolve();
    }
};

function getPlayerColour(username, seatedPlayersMap) {
    if (!seatedPlayersMap) {
        return "gray";
    }

    let keys = seatedPlayersMap.entries();

    for (var key of keys) {
        if (key[1] === username) {
            return key[0];
        }
    }

    return "gray";
}

function initSeatedPlayers() {
    let returnMe = new Map();

    returnMe.set("red", null);
    returnMe.set("orange", null);
    returnMe.set("yellow", null);
    returnMe.set("green", null);
    returnMe.set("teal", null);
    returnMe.set("blue", null);
    returnMe.set("purple", null);
    returnMe.set("pink", null);
    returnMe.set("white", null);
    returnMe.set("brown", null);

    return returnMe;
}

function initCharacterLocations() {
    let returnMe = new Map();

    returnMe.set("hermit", null);
    returnMe.set("gate", null);
    returnMe.set("church", null);
    returnMe.set("cemetery", null);
    returnMe.set("woods", null);
    returnMe.set("altar", null);

    return returnMe;
}

function getCard(cardName, cards) {
    let card = null;

    for (let card of cards) {
        if (card.name.indexOf(cardName) > -1) {
            return card;
        }
    }
}

export default plugin;
