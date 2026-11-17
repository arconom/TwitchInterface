import TcpServer from "../../../src/tcpServer.mjs";
import TcpClient from "../../../src/tcpClient.mjs";
import { FileRepository } from "../../../src/FileRepository.mjs";

const listenerPort = 39998;
const externalPort = 39999;

export default class TabletopSimulatorController {
    constructor() {
        const self = this;
        this.server = new TcpServer(listenerPort);
        this.client = new TcpClient(externalPort);
        setTimeout(function () {
            self.getScripts()
        }, 3000);
    }

    movePieceSmooth(guid, coords, collide = false, fast = false) {
        return this.client.send({
            "messageID": 3,
            "guid": -1,
            "script": `
                piece = getObjectFromGUID(" {guid}")
                piece.setPositionSmooth({{{coords[0]}, {coords[1]}, {coords[2]}}}, {str(collide).lower()}, {str(fast).lower()})
            `
        });
    }

    generatePerimeterPoints(x0, y0, R, N) {
        // Generates N points evenly spaced on the circle perimeter
        points = [];
        for (let i = 0; i < N; i++) {
            //Calculate the angle for the i - th point
            angle = (2 * math.pi * i) / N;

            //Calculate the coordinates
            x = x0 + R * math.cos(angle);
            y = y0 + R * math.sin(angle);

            points.append((x, y));
        }
        return points;
    }

    getScripts() {
        return this.client.send({
            "messageID": 0
        });
    }

    rollDice() {
        return this.client.send({
            "messageID": 3,
            "guid": -1,
            "script": `rollDice();print(" ");`
        });
    }

    moveDamageTracker(color, damage) {
        return this.client.send({
            "messageID": 3,
            "guid": -1,
            "script": `
				moveHPMarker("${color}", "${damage}")
                print(" ")
            `
        });
    }

    moveLocationMarker(color, locationName) {
        return this.client.send({
            "messageID": 3,
            "guid": -1,
            "script": `movePositionMarkerToLocationName("${color}", "${locationName}")`
        });
    }

    showCard(guid, color) {
        return this.client.send({
            "messageID": 3,
            "guid": -1,
            "script": `
				moveCardToLayout("${guid}", "${color}")
                print()
            `
        });
    }

    dealToPlayer(currentPlayerColour, cardName, seatColour) {
        return this.client.send({
            "messageID": 3,
            "guid": -1,
            "script": `
                moveCardNameToHand("${currentPlayerColour}", "${cardName}", "${seatColour}")
                print()
            `
        });
    }

    placeAtPlayer(currentPlayerColour, cardName, seatColour) {
        return this.client.send({
            "messageID": 3,
            "guid": -1,
            "script": `
                moveCardNameToLayout("${currentPlayerColour}", "${cardName}", "${seatColour}")
                print()
            `
        });
    }

    discard(guid, color) {
        return this.client.send({
            "messageID": 3,
            "guid": -1,
            "script": `
                discard("${guid},${color}")
                print()
            `
        });
    }

    discardByName(name, color) {
        return this.client.send({
            "messageID": 3,
            "guid": -1,
            "script": `
                discardByName("${name}", "${color}")
                print()
            `
        });
    }

    draw(deckColour, num, playerColour) {
        return this.client.send({
            "messageID": 3,
            "guid": -1,
            "script": `
                drawFrom("${deckColour}", ${num}, "${playerColour}")
                print()
            `
        });
    }

    searchForCard(deckType, deckColour, searchString, playerColour) {
        const self = this;

        return new Promise(function (resolve, reject) {
            self.server.AddHandler("message", function (result) {
                FileRepository.log("searchForCard message result \r\n" + JSON.stringify(result));
                resolve(result);
            }, false);

            self.client.send({
                "messageID": 3,
                "guid": -1,
                "script": `
                searchForCard("${deckType}", "${deckColour}", ${searchString}, "${playerColour}")
            `
            });
        });
    }

    getCardsInHand(color) {
        FileRepository.log("TabletopSimulatorController.getCardsInHand " + color);
        const self = this;

        return new Promise(function (resolve, reject) {
            self.server.AddHandler("message", function (result) {
                FileRepository.log("getCardsInHand message result \r\n" + JSON.stringify(result));
                resolve(result);
            }, false);

            self.client.send({
                "messageID": 3,
                "guid": -1,
                "script": `
                sendExternalMessage(GetCardsInHand("${color}"))
            `
            });
        });
    }

    getCardsInLayout(color) {
        const self = this;

        return new Promise(function (resolve, reject) {
            self.server.AddHandler("message", function (result) {
                FileRepository.log("getCardsInLayout message result \r\n" + result);
                resolve(result);
            }, false);
        });

        self.client.send({
            "messageID": 3,
            "guid": -1,
            "script": `
				sendExternalMessage(GetCardsInLayout("${color}"))
            `
        });
    }

    // sendExternalMessage(hand)
    // print(GetCardsInHand("{color}"))

    getGameMode() {
        return this.client.send({
            "messageID": 3,
            "guid": -1,
            "script": `
                    print(currentGameMode)
                `
        });
    }

}
