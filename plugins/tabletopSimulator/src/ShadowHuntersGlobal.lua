--[[ Lua code. See documentation: https://api.tabletopsimulator.com/ --]]
Turns.enable = true

currentGameMode = "standard"

config = {
    teams = {"hunter", "shadow", "neutral"}
}


objects = {}

--[[ The onLoad event is called after the game save finishes loading. --]]
function onLoad()
    --[[ log('onLoad!') --]]
    objects.gmArea = getObjectFromGUID("561ed1")
    objects.board = getObjectFromGUID("ed0d18")
    objects.turnSkipper = getObjectFromGUID("a0bfbc")
    -- objects.whiteDeck = getObjectFromGUID("f7578e")
    -- objects.greenDeck = getObjectFromGUID("5203c6")
    -- objects.blackDeck = getObjectFromGUID("db4de6")
    
	
    objects.whiteDrawArea = getObjectFromGUID("388d16")
    objects.greenDrawArea = getObjectFromGUID("a82ac9")
	objects.blackDrawArea = getObjectFromGUID("6b527a")
	
	objects.blackDiscardArea = getObjectFromGUID("86670f")
    objects.greenDiscardArea = getObjectFromGUID("4c8df2")
    objects.whiteDiscardArea = getObjectFromGUID("07dc13")
    
	objects.locationDeck = getObjectFromGUID("e56148")
	
	objects.locations = {}

    objects.players = {}
    objects.players["White"] = {
        hand = getObjectFromGUID("6b3686"),
        positionMarker = getObjectFromGUID("c358b3"),
        hpMarker = getObjectFromGUID("8e735e"),
        layout = getObjectFromGUID("91d29c")
    }

    objects.players["Brown"] = {
        hand = getObjectFromGUID("ffa239"),
        positionMarker = getObjectFromGUID("7d2cf8"),
        hpMarker = getObjectFromGUID("3af3d3"),
        layout = getObjectFromGUID("6fc231")
    }

    objects.players["Red"] = {
        hand = getObjectFromGUID("a0eb82"),
        positionMarker = getObjectFromGUID("43ac9f"),
        hpMarker = getObjectFromGUID("4ca308"),
        layout = getObjectFromGUID("546675")
    }

    objects.players["Yellow"] = {
        hand = getObjectFromGUID("cb7683"),
        positionMarker = getObjectFromGUID("d308e8"),
        hpMarker = getObjectFromGUID("837306"),
        layout = getObjectFromGUID("773316")
    }

    objects.players["Blue"] = {
        hand = getObjectFromGUID("9e08a7"),
        positionMarker = getObjectFromGUID("46679d"),
        hpMarker = getObjectFromGUID("5db687"),
        layout = getObjectFromGUID("10a165")
    }

    objects.players["Green"] = {
        hand = getObjectFromGUID("9ddd93"),
        positionMarker = getObjectFromGUID("bddb86"),
        hpMarker = getObjectFromGUID("86a9e3"),
        layout = getObjectFromGUID("8d8933")
    }

    objects.players["Purple"] = {
        hand = getObjectFromGUID("0d335b"),
        positionMarker = getObjectFromGUID("7dd142"),
        hpMarker = getObjectFromGUID("575099"),
        layout = getObjectFromGUID("78c3ad")
    }

    objects.players["Orange"] = {
        hand = getObjectFromGUID("ea1d07"),
        positionMarker = getObjectFromGUID("aa726d"),
        hpMarker = getObjectFromGUID("0b82e2"),
        layout = getObjectFromGUID("ef5355")
    }

    objects.players["Pink"] = {
        hand = getObjectFromGUID("2dd026"),
        positionMarker = getObjectFromGUID("45850c"),
        hpMarker = getObjectFromGUID("75f901"),
        layout = getObjectFromGUID("3ce8d3")
    }

    objects.players["Teal"] = {
        hand = getObjectFromGUID("e03b6b"),
        positionMarker = getObjectFromGUID("a6b4d6"),
        hpMarker = getObjectFromGUID("affbf2"),
        layout = getObjectFromGUID("ee70cd")
    }

    objects.d4 = getObjectFromGUID("7cb928")
    objects.d6 = getObjectFromGUID("2528f1")

    -- log(objects.gmArea)
end

--[[ The onUpdate event is called once per frame. --]]
function onUpdate()
    --[[ log('onUpdate loop!') --]]
end

function updateBoard()
    if config.cardsToUse["gamenight"] or config.cardsToUse["election2020"] then
        Global.objects.board.setCustomObject(
            {
                image = "https://steamusercontent-a.akamaihd.net/ugc/1675863097248861074/9DF8E3DC476DAFCAE7937F452E1466CEE3934122/"
            }
        )
    else
        Global.objects.board.setCustomObject(
            {
                image = "https://steamusercontent-a.akamaihd.net/ugc/1675863097248860756/0740B714DC7CB757406BB4F77905FF691707AC51/"
            }
        )
    end
    board.reload()
end

function getRandomFromList(list)
    index = math.random(#list)
    return list[index]
end

function findDeckInZone(zone)
	log("findDeckInZone")
	log(zone)

    local objectsInZone = zone.getObjects()
	
    for i, object in ipairs(objectsInZone) do
        log("object.tag " .. object.tag)
        log("object has tag Deck " .. tostring(object.hasTag("Deck")))
		
        if object.hasTag("Deck") or object.hasTag("Card") or object.tag == "Deck" or object.tag == "Card" then
			log("findDeckInZone returning object " .. object.tag);
            return object
        end
    end

    return nil
end

function findDecksInZone(zone)
    local objectsInZone = zone.getObjects()
    local decksFound = {}
    for i, object in ipairs(objectsInZone) do
        if object.tag == "Deck" then
            table.insert(decksFound, object)
        end
    end
    if #decksFound > 0 then
        return decksFound
    else
        return nil
    end
end

function getPlayerCount()
    count = 0
    for _ in ipairs(getSeatedPlayers()) do
        count = count + 1
    end
    --log("board.getPlayerCount returning " .. count)
    return count
end

function getPlayerByColor(color)
    returnMe = nil
    for _, object in ipairs(getSeatedPlayers()) do
        if(object.color == color) then
			returnMe = object
		end
    end
    --log("board.getPlayerCount returning " .. count)
    return returnMe
end

function deleteUnusedSeats()
    --log("board.deleteUnusedSeats")

    players = {}
    for _, player in ipairs(getSeatedPlayers()) do
        players[player] = true
    end

    --log("board.deleteUnusedSeats after setting seated players")

    --    for _,player in ipairs(Player.getAvailableColors()) do
    --if not players[player] then
    --destroyObject(getObjectFromGUID(config.pieces[player].area))
    --end
    --end
    --log("board.deleteUnusedSeats after deleting unused seats")
end

function startGame()
    --log("board.startGame")

    playerCount = getPlayerCount()
    gameMode = config.gameMode

    --log("board.startGame params set")

    -- deck = getObjectFromGUID('b5c2b7')

    deck = findDeckInZone(objects.gmArea)

    --if deck then
    --log("board.startGame deck found")
    --end

    -- log("deck.startGame.playerCount" .. playerCount)

    initModeModules()

    modeModule = modeModules[currentGameMode]

    -- log("deck.startGame.modeName" .. currentGameMode)

    cards = getCards(deck)

    -- log("deck.startGame.cards " .. #cards)

    picks = modeModule.getGuidsByLetter(playerCount, cards)

    -- log("deck.startGame.picks " .. #picks)

    teamCounts = modeModule.getTeamCounts(playerCount)

    -- log("deck.startGame.teamCounts")

    guids = modeModule.getGuidsToUse(teamCounts, picks)

    -- log("deck.startGame.guids " .. #guids)

    dealCards(deck, guids)

    -- log("deck.startGame cards dealt")

    shuffleDecks()
    -- log("deck.startGame shuffled")

    dealAreaCards()
    -- log("deck.startGame area")

    res = modeModule.validateCardCount(teamCounts, picks) and modeModule.validatePlayerCount(playerCount)

    if res then
        --log("board.startGame res got")
        self.clearButtons()
        --log("board.startGame buttons cleared")
        deleteUnusedSeats()
        --log("board.startGame deleted unused seats")

        showGameMode(currentGameMode)

        firstPlayer = getRandomFromList(getSeatedPlayers())
        --log("board.startGame firstplayer chosen")
        broadcastToAll(firstPlayer .. " goes first.", Color.fromString(firstPlayer))
        --log("board.startGame broadcast")
        Turns.turn_color = firstPlayer

        objects.turnSkipper.call("spawnForEachSeatedPlayer")

        hideGameSetup()
    end
end

function showGameMode(gameMode)
    UI.setXmlTable(
        {
            {
                tag = "HorizontalLayout",
                attributes = {
                    rectAlignment = "UpperRight",
                    offsetXY = "-250 0",
                    height = "10%",
                    width = "20%",
                    color = "rgba(0,0,0,0.7)"
                },
                children = {
                    {
                        tag = "Text",
                        attributes = {
                            fontSize = 24,
                            color = "white"
                        },
                        value = "Gamemode: "
                    },
                    {
                        tag = "Text",
                        attributes = {
                            text = gameMode,
                            fontSize = 24,
                            color = "blue"
                        }
                    }
                }
            }
        }
    )
end

function showGameSetup()
    UI.setXmlTable(
        {
            {
                tag = "VerticalLayout",
                attributes = {
                    rectAlignment = "UpperRight",
                    offsetXY = "-250 0",
                    id = "gameSetup",
                    height = "10%",
                    width = "25%",
                    color = "rgba(0,0,0,0.7)"
                },
                children = {
                    {
                        tag = "HorizontalLayout",
                        attributes = {
                            rectAlignment = "UpperCenter",
                            offsetXY = "0 0",
                            height = "50%",
                            width = "100%",
                            color = "rgba(0,0,0,0.7)"
                        },
                        children = {
                            {
                                tag = "Button",
                                attributes = {
                                    fontSize = 24,
                                    text = "Standard",
                                    textOutline = "rgba(1,1,1,1)",
                                    onClick = "setGameModeStandard",
                                    color = getGameModeButtonColor("standard")
                                }
                            },
                            {
                                tag = "Button",
                                attributes = {
                                    fontSize = 24,
                                    text = "Random",
                                    textOutline = "rgba(1,1,1,1)",
                                    onClick = "setGameModeRandom",
                                    color = getGameModeButtonColor("allrandom")
                                }
                            },
                            {
                                tag = "Button",
                                attributes = {
                                    fontSize = 24,
                                    text = "All Neutrals",
                                    textOutline = "rgba(1,1,1,1)",
                                    onClick = "setGameModeAllNeutrals",
                                    color = getGameModeButtonColor("allneutrals")
                                }
                            },
                            {
                                tag = "Button",
                                attributes = {
                                    fontSize = 24,
                                    text = "mo neutrals",
                                    textOutline = "rgba(1,1,1,1)",
                                    onClick = "setGameMode121",
                                    color = getGameModeButtonColor("onetwoone")
                                }
                            }
                        }
                    },
                    {
                        tag = "HorizontalLayout",
                        attributes = {
                            rectAlignment = "LowerCenter",
                            offsetXY = "0 0",
                            height = "50%",
                            width = "100%",
                            color = "rgba(0,0,0,0.7)"
                        },
                        children = {
                            {
                                tag = "Button",
                                attributes = {
                                    fontSize = 28,
                                    colors = "rgba(0.5,0.5,0.5,1)|rgba(0.7,0.7,0.7,1)|rgba(1,1,1,1)",
                                    textOutline = "rgba(1,1,1,1)",
                                    onClick = "startGame",
                                    text = "Start Game"
                                }
                            }
                        }
                    }
                }
            }
        }
    )
end

function hideGameSetup()
    UI.hide("gameSetup")
end

function getGameModeButtonColor(target)
    if (currentGameMode == target) then
        return "rgba(1,1,1,1)"
    else
        return "rgba(0.5,0.5,0.5,1)"
    end
end

function setGameModeStandard()
    currentGameMode = "standard"
    showGameSetup()
end
function setGameModeRandom()
    currentGameMode = "allrandom"
    showGameSetup()
end
function setGameModeAllNeutrals()
    currentGameMode = "allneutrals"
    showGameSetup()
end
function setGameMode121()
    currentGameMode = "onetwoone"
    showGameSetup()
end

function toggleCardsToUse(key, idx)
    config.cardsToUse[key] = not config.cardsToUse[key]
    if config.cardsToUse[key] then
        self.editButton(
            {
                index = idx,
                color = {1, 1, 1}
            }
        )
    else
        self.editButton(
            {
                index = idx,
                color = {0.7, 0.7, 0.7}
            }
        )
    end
end

function toggleGameMode(key, idx)
    config.gameMode[key] = not config.gameMode[key]
    if config.gameMode[key] then
        self.editButton(
            {
                index = idx,
                color = {1, 1, 1}
            }
        )
    else
        self.editButton(
            {
                index = idx,
                color = {0.7, 0.7, 0.7}
            }
        )
    end
end

function getButtonColor(enabled)
    if enabled then
        return {1, 1, 1}
    else
        return {0.7, 0.7, 0.7}
    end
end

function toggleAllNeutrals()
    toggleGameModeHelper("allneutrals")
end
function toggleOneTwoOne()
    toggleGameModeHelper("onetwoone")
end
function toggleAllRandom()
    toggleGameModeHelper("allrandom")
end
function toggleGameModeHelper(nextGameMode)
    if (currentGameMode ~= nil) then
        toggleGameMode(currentGameMode, gameModes[currentGameMode].idx + modeIdxOffset)
    end
    if (currentGameMode ~= nextGameMode) then
        toggleGameMode(nextGameMode, gameModes[nextGameMode].idx + modeIdxOffset)
        currentGameMode = nextGameMode
    else
        currentGameMode = nil
    end
end

function initModeModules()
    if modeModules == nil then
        modeModules = {}
    end

    setupRegularModule()
    setupNeutralsModule()
    setupRandomModule()
    setupOneTwoOneModule()
end

function setupRegularModule()
    modeModules.standard = {}

    modeModules.standard.validatePlayerCount = function(playerCount)
        --log("modeModules.regular.validatePlayerCount")
        if playerCount < 4 then
            broadcastToAll("Not enough players to start the game.\nRequires a minimum of 4 players.")
            return false
        end
        return true
    end

    modeModules.standard.validateCardCount = function(teamCounts, picks)
        for _, team in ipairs(config.teams) do
            numLetters = 0
            for _, _ in pairs(picks[team]) do
                numLetters = numLetters + 1
            end
            if numLetters < teamCounts[team] then
                broadcastToAll("Not enough cards for this many players.  Enable more expansions.")
                return false
            end
        end
        return true
    end

    modeModules.standard.getGuidsByLetter = (function(playerCount, cards)
        --log("deck.modeModules.regular.getGuidsByLetter cards " .. #cards)
        return getGuidsByLetter(
            cards,
            (function(card)
                if (not card) then
                    return false
                end

                -- log("getGuidsByLetter playercount " .. playerCount)
                -- log("getGuidsByLetter card " .. table.concat(card))
                -- log("getGuidsByLetter result " .. tostring((not (playerCount == 5 and card.tags.minsix))))

                return not (playerCount == 5 and card.tags.minsix)
            end),
            {}
        )
    end)

    modeModules.standard.getTeamCounts = function(playerCount)
        num_hunters = 2
        num_shadows = 2
        if playerCount > 7 then
            num_hunters = 3
            num_shadows = 3
        end

        num_neutrals = playerCount - num_hunters - num_shadows

        return {
            hunter = num_hunters,
            shadow = num_shadows,
            neutral = num_neutrals
        }
    end

    modeModules.standard.getGuidsToUse = function(teamCounts, picks)
        guids = {}

        for _, team in ipairs(config.teams) do
            _regularGetTeamGuidsToUse(teamCounts[team], picks[team], guids)
        end

        return guids
    end

    function _regularGetTeamGuidsToUse(teamCount, teamPicks, guids)
        lettersToPickFrom = {}
        for letter, _ in pairs(teamPicks) do
            lettersToPickFrom[#lettersToPickFrom + 1] = letter
        end

        while teamCount > 0 do
            letterIndex = math.random(#lettersToPickFrom)
            letter = lettersToPickFrom[letterIndex]
            guidIndex = math.random(#teamPicks[letter])
            guid = teamPicks[letter][guidIndex]
            guids[#guids + 1] = guid
            teamCount = teamCount - 1
            lettersToPickFrom[letterIndex] = lettersToPickFrom[#lettersToPickFrom]
            lettersToPickFrom[#lettersToPickFrom] = nil
        end
    end
end

function setupNeutralsModule()
    modeModules.allneutrals = {}

    modeModules.allneutrals.validatePlayerCount = function(playerCount)
        if playerCount < 3 then
            broadcastToAll("Not enough players to start the game.\nNeutrals Only requires a minimum of 3 players.")
            return false
        end
        return true
    end

    modeModules.allneutrals.validateCardCount = function(teamCounts, picks)
        numNeutrals = 0
        for _, neutralCards in pairs(picks.neutral) do
            numNeutrals = numNeutrals + #neutralCards
        end

        if teamCounts.neutral > numNeutrals then
            broadcastToAll("Not enough cards for this many players.  Enable more expansions.")
            return false
        end
        return true
    end

    modeModules.allneutrals.getGuidsByLetter = (function(playerCount, cards)
        return getGuidsByLetter(
            cards,
            (function()
                return true
            end),
            {"noallneutrals"}
        )
    end)

    modeModules.allneutrals.getTeamCounts = function(playerCount)
        return {
            hunter = 0,
            shadow = 0,
            neutral = playerCount
        }
    end

    modeModules.allneutrals.getGuidsToUse = function(teamCounts, picks)
        guids = {}

        for _, team in ipairs(config.teams) do
            _allNeutralGetTeamGuidsToUse(teamCounts[team], picks[team], guids)
        end

        return guids
    end

    function _allNeutralGetTeamGuidsToUse(teamCount, teamPicks, guids)
        lettersToPickFrom = {}
        for letter, _ in pairs(teamPicks) do
            lettersToPickFrom[#lettersToPickFrom + 1] = letter
        end

        while teamCount > 0 do
            letterIndex = math.random(#lettersToPickFrom)
            letter = lettersToPickFrom[letterIndex]
            guidIndex = math.random(#teamPicks[letter])
            guid = teamPicks[letter][guidIndex]

            alreadyPicked = false
            for _, pickedGuid in ipairs(guids) do
                if pickedGuid == guid then
                    alreadyPicked = true
                end
            end

            if not alreadyPicked then
                guids[#guids + 1] = guid
                teamCount = teamCount - 1
            end
        end
    end
end

function setupRandomModule()
    modeModules.allrandom = {}

    modeModules.allrandom.validatePlayerCount = function(playerCount)
        if playerCount < 3 then
            broadcastToAll("Not enough players to start the game.\nFree For All requires a minimum of 3 players.")
            return false
        end
        return true
    end

    modeModules.allrandom.validateCardCount = function(teamCounts, picks)
        totalCards = 0
        for _, team in ipairs(config.teams) do
            for _, _ in pairs(picks[team]) do
                totalCards = totalCards + 1
            end
        end
        if totalCards < teamCounts.neutral then
            broadcastToAll("Not enough cards for this many players.  Enable more expansions.")
            return false
        end
        return true
    end

    modeModules.allrandom.getGuidsByLetter = (function(playerCount, cards)
        return getGuidsByLetter(
            cards,
            (function()
                return true
            end),
            {}
        )
    end)

    modeModules.allrandom.getTeamCounts = function(playerCount)
        return {
            hunter = 0,
            shadow = 0,
            neutral = playerCount
        }
    end

    modeModules.allrandom.getGuidsToUse = function(teamCounts, picks)
        guids = {}

        count = teamCounts.neutral
        teams = config.teams

        while count > 0 do
            teamIndex = math.random(#teams)
            team = teams[teamIndex]

            letters = {}
            for k, v in pairs(picks[team]) do
                letters[#letters + 1] = k
            end

            letterIndex = math.random(#letters)
            letter = letters[letterIndex]
            guidIndex = math.random(#picks[team][letter])
            guid = picks[team][letter][guidIndex]

            alreadyPicked = false
            for _, pickedGuid in ipairs(guids) do
                if pickedGuid == guid then
                    alreadyPicked = true
                end
            end

            if not alreadyPicked then
                guids[#guids + 1] = guid
                count = count - 1
            end
        end

        return guids
    end
end

function setupOneTwoOneModule()
    modeModules.onetwoone = {}

    modeModules.onetwoone.validatePlayerCount = function(playerCount)
        if playerCount < 4 then
            broadcastToAll("Not enough players to start the game.\n1v2v1 requires a minimum of 4 players.")
            return false
        end
        return true
    end

    modeModules.onetwoone.validateCardCount = function(teamCounts, picks)
        totalCards = 0
        for _, team in ipairs(config.teams) do
            for _, _ in pairs(picks[team]) do
                totalCards = totalCards + 1
            end
        end
        if totalCards < 4 then
            broadcastToAll("Not enough cards for this many players.  Enable more expansions.")
            return false
        end
        return true
    end

    modeModules.onetwoone.getGuidsByLetter = (function(playerCount, cards)
        return getGuidsByLetter(
            cards,
            (function()
                return true
            end),
            {"no121"}
        )
    end)

    modeModules.onetwoone.getTeamCounts = function(playerCount)
        if playerCount == 4 then
			return {
				hunter = 1,
				shadow = 1,
				neutral = 2
			}
		elseif playerCount == 5 then
			return {
				hunter = 1,
				shadow = 1,
				neutral = 3
			}
		elseif playerCount == 6 then
			return {
				hunter = 1,
				shadow = 1,
				neutral = 4
			}
		elseif playerCount == 7 then
			return {s
				hunter = 2,
				shadow = 2,
				neutral = 3
			}
		elseif playerCount == 8 then
			return {
				hunter = 2,
				shadow = 2,
				neutral = 4
			}
		elseif playerCount == 9 then
			return {
				hunter = 3,
				shadow = 3,
				neutral = 3
			}
		elseif playerCount == 10 then
			return {
				hunter = 3,
				shadow = 3,
				neutral = 4
			}
        end
    end

    modeModules.onetwoone.getGuidsToUse = function(teamCounts, picks)
        guids = {}

        for _, team in ipairs(config.teams) do
            _regularGetTeamGuidsToUse(teamCounts[team], picks[team], guids)
        end

        return guids
    end

    function _regularGetTeamGuidsToUse(teamCount, teamPicks, guids)
        lettersToPickFrom = {}
        for letter, _ in pairs(teamPicks) do
            lettersToPickFrom[#lettersToPickFrom + 1] = letter
        end

        while teamCount > 0 do
            letterIndex = math.random(#lettersToPickFrom)
            letter = lettersToPickFrom[letterIndex]
            guidIndex = math.random(#teamPicks[letter])
            guid = teamPicks[letter][guidIndex]
            guids[#guids + 1] = guid
            teamCount = teamCount - 1
            lettersToPickFrom[letterIndex] = lettersToPickFrom[#lettersToPickFrom]
            lettersToPickFrom[#lettersToPickFrom] = nil
        end
    end
end

function getGuidsByLetter(cards, selector, excludedTags)
    -- log("getGuidsByLetter")
    picks = {}
    for _, team in ipairs(config.teams) do
        picks[team] = {}
    end
    for guid, card in pairs(cards) do
        canUse = false
        --log("guid " .. guid)
        --log("card " .. table.concat(card))

        if (card ~= nil) then
            -- do stuff

            -- log("cardsToUse " .. #cardsToUse)
            -- log("card tags")

            canUse = selector(card)

            if (canUse) then
                for index, value in ipairs(excludedTags) do
                    if (card.tags[value]) then
                        -- log("can't use")
                        canUse = false
                    end
                end
            end

            if canUse then
                if picks[card.team][card.letter] == nil then
                    picks[card.team][card.letter] = {}
                end
                cardsForLetter = picks[card.team][card.letter]
                cardsForLetter[#cardsForLetter + 1] = guid
            end
        end
    end
    return picks
end

function getCards(deck)
    -- log("deck.getCards")
    cards = {}

    -- log("deck.getCards loop")
    for _, card in ipairs(deck.getObjects()) do
        script = card.gm_notes
        -- log("deck.getCards loop script" .. script)

        if script ~= "" then
            data = JSON.decode(script)
            cards[card.guid] = data
        -- log("deck.getCards loop data set")
        end
    end

    -- log("deck.getCards returning " .. #cards)
    return cards
end

function incOffset(xoffset, yoffset)
    if xoffset > 14 then
        yoffset = yoffset + 5
        xoffset = 0
    else
        xoffset = xoffset + 4
    end
    return xoffset, yoffset
end

function dealCards(deck, guids)
    cardsToGroup = {}
    xoffset = 0
    yoffset = 0

    for _, guid in ipairs(guids) do
        cardsToGroup[#cardsToGroup + 1] =
            deck.takeObject(
            {
                guid = guid,
                position = {-39.2 + xoffset, 1.5, -0.35 - yoffset}
            }
        )
        xoffset, yoffset = incOffset(xoffset, yoffset)
    end

    function finalGroup()
        groupedCards = group(cardsToGroup)

        function finalDeal()
            deck = groupedCards[1]
            deck.shuffle()
            deck.shuffle()
            deck.shuffle()
            for _, player in ipairs(getSeatedPlayers()) do
                -- deck.deal(1, player)
				
				
				-- log(player)
				-- log(objects.players[player])
				-- log(objects.players[player].hand)
				
				deck.takeObject({
					index = 1,
					flip = false,
					position = Player[player].getHandTransform(1).position,
					smooth = true
				})
            end

            -- destroyObject(self)
        end

        Timer.create(
            {
                identifier = tostring({}),
                function_name = "finalDeal",
                function_owner = self,
                delay = 1,
                repetitions = 1
            }
        )
    end

    Timer.create(
        {
            identifier = tostring({}),
            function_name = "finalGroup",
            function_owner = self,
            delay = 1,
            repetitions = 1
        }
    )
end

function shuffleDecks()
    getWhiteDrawDeck().shuffle()
    getGreenDrawDeck().shuffle()
    getBlackDrawDeck().shuffle()
end

function dealAreaCards()
    objects.locationDeck.shuffle()
    objects.board = getObjectFromGUID("ed0d18")
    snapPoints = objects.board.getSnapPoints()

    -- log("snap points " .. #snapPoints)

    for _, snappoint in ipairs(snapPoints) do
		location = nil
        for tag in snappoint.tags do
			if (tag:find("slot",1,true)) then
				location = tag
			end
        end
        for tag in snappoint.tags do
            if tag == "location" then
                area_card =
                    objects.locationDeck.takeObject(
                    {
                        position = objects.board.positionToWorld(snappoint.position),
                        rotation = {snappoint.rotation.x, snappoint.rotation.y + 180, snappoint.rotation.z}
                    }
                )
                area_card.setLock(true)
				objects.locations[location] = area_card.getName()
				-- log("setting location " .. location .. " to " .. area_card.getName())
            end
        end
    end
end

function getWhiteDrawDeck()
    return findDeckInZone(objects.whiteDrawArea)
end

function getBlackDrawDeck()
    return findDeckInZone(objects.blackDrawArea)
end

function getGreenDrawDeck()
    return findDeckInZone(objects.greenDrawArea)
end

function getWhiteDiscardDeck()
    return findDeckInZone(objects.whiteDiscardArea)
end

function getBlackDiscardDeck()
    return findDeckInZone(objects.blackDiscardArea)
end

function getGreenDiscardDeck()
    return findDeckInZone(objects.greenDiscardArea)
end
-- entry points

function rollDice()
    objects.d4.randomize()
    objects.d6.randomize()
end

function flip(guid)
    obj = getObjectFromGUID(guid)
    obj.flip()
end

function moveHPMarker(strPlayerColour, damage)
	-- log("moveHPMarker  strPlayerColour: " .. strPlayerColour .. " damage " .. damage)

	position = getObjectsWithAllTags({"damage", "slot" .. damage})
    objects.players[firstToUpper(strPlayerColour)].hpMarker.SetPositionSmooth(position[1].getPosition(), false, false)
end

function movePositionMarker(strPlayerColour, position)
    objects.players[strPlayerColour].positionMarker.SetPositionSmooth(position, false, false)
end

function movePositionMarkerToLocationName(strPlayerColour, locationName)
	-- log("movePositionMarkerToLocationName " .. strPlayerColour .. " " .. locationName)
	locationTag = nil

	for key,value in pairs(objects.locations) do
	-- log("key,value" .. key .. " " .. value)
		if string.lower(value):find(string.lower(locationName), 1, false) then
	-- log("location found:  " .. value)
			locationTag = key
		end
	end

	if not locationTag then
		return
	end
	-- log("locationTag" .. locationTag)

    locationLayout = getObjectsWithAllTags({"location", locationTag})

    objects.players[firstToUpper(strPlayerColour)].positionMarker
		.SetPositionSmooth(locationLayout[1].getPosition(), false, false)
end

function getCardByName(cardName, color)

	returnMe = nil
	
	cards = Player[tostring(firstToUpper(color))].getHandObjects()
	for _,card in ipairs(cards) do
		if(string.lower(card.getName()):find(string.lower(cardName))) then
			returnMe = card
		end
	end

	if(not returnMe) then
		cards = objects.players[firstToUpper(color)].layout.getObjects()

		for _,card in ipairs(cards) do
			if(string.lower(card.getName()):find(string.lower(cardName))) then
				returnMe = card
			end
		end
	end
	
	return returnMe
end

function moveCardToHand(guid, strPlayerColour)
    card = getObjectFromGUID(guid)
    card.deal(1, firstToUpper(strPlayerColour))
    -- card.setPositionSmooth(objects.players[strPlayerColour].hand.getPosition(), false, true)
end

function moveCardNameToHand(strPlayerColour, cardName, targetColour)
    card = getCardByName(cardName, strPlayerColour)
    card.deal(1, firstToUpper(targetColour))
    -- card.setPositionSmooth(objects.players[firstToUpper(targetColour)].hand.getPosition(), false, true)
end

function moveCardToLayout(card, strPlayerColour)
log("moveCardToLayout")
	moveCardSafely(card, objects.players[firstToUpper(strPlayerColour)].layout.getPosition())
	Wait.time(function()
		objects.players[firstToUpper(strPlayerColour)].layout.LayoutZone.layout()
	end, 2)
end

function moveCardNameToLayout(strPlayerColour, cardName, targetColour)
    card = getCardByName(cardName, strPlayerColour)

	if not card then
	    return
	end
	
	card.use_hands = false
	moveCardSafely(card, objects.players[firstToUpper(targetColour)].layout.getPosition())

	Wait.time(function()
		objects.players[firstToUpper(targetColour)].layout.LayoutZone.layout()
	end, 2)
end

function discard(guid, color)
    card = getObjectFromGUID(guid)
	
	if(color == "white") then
		moveCardSafely(card, objects.whiteDiscardArea.getPosition())
	elseif(color == "green") then
		moveCardSafely(card, objects.greenDiscardArea.getPosition())
	elseif(color == "black") then
		moveCardSafely(card, objects.blackDiscardArea.getPosition())
	else
		log("invalid")
	end
end

function moveCardSafely(card, targetPosition)
log("moveCardSafely")
log(card)
log(targetPosition)
	card.use_hands = false
	Wait.frames(function()
		card.setPositionSmooth(targetPosition, false, false)
	end, 1)
	Wait.time(function()
		card.use_hands = true
	end, 2)
end

function discardByName(name, color)
	-- log("discardByName " .. name .. " " .. color)
	cards = Player[tostring(firstToUpper(color))].getHandObjects()
    discardMe = nil
	
	for _,card in ipairs(cards) do
		if(string.lower(card.getName()):find(string.lower(name))) then
			discardMe = card
		end
	end

	if(not discardMe) then
		cards = objects.players[firstToUpper(color)].layout.getObjects()

		for _,card in ipairs(cards) do
			if(string.lower(card.getName()):find(string.lower(name))) then
				discardMe = card
			end
		end
	end
	
	description = string.lower(discardMe.getDescription())
	
	if description:find("white") then
		moveCardSafely(discardMe, objects.whiteDiscardArea.getPosition())
	elseif description:find("green") then
		if not discardMe.is_face_down then
			discardMe.flip()
		end
		moveCardSafely(discardMe, objects.greenDiscardArea.getPosition())
	elseif description:find("black") then
		moveCardSafely(discardMe, objects.blackDiscardArea.getPosition())
	else
		log("invalid")
	end
end

function discardWhite(guid)
    card = getObjectFromGUID(guid)
    card.setPositionSmooth(objects.whiteDiscardArea.getPosition(), false, false)
end

function discardBlack(guid)
    card = getObjectFromGUID(guid)
    card.setPositionSmooth(objects.blackDiscardArea.getPosition(), false, false)
end

function discardGreen(guid)
    card = getObjectFromGUID(guid)
    card.setPositionSmooth(objects.greenDiscardArea.getPosition(), false, false)
end

function drawFrom(deckName, num, color)
	-- log("drawFrom")
	-- log(deckName .. " " .. num .. " " .. color)
	deck = nil
	
	zone = objects.players[firstToUpper(color)].layout
	
	if(deckName == "white") then
		deck = getWhiteDrawDeck()
		drawToLayout(deck, zone, num)
	elseif(deckName == "green") then	
		deck = getGreenDrawDeck()
		deck.deal(num,firstToUpper(color))
	elseif(deckName == "black") then	
		deck = getBlackDrawDeck()
		drawToLayout(deck, zone, num)
	else 
		deck = getWhiteDrawDeck()
		drawToLayout(deck, zone, num)
	end	
end

function drawToLayout(deck, zone, num)
	log("drawToLayout")
	log(deck)
	log(zone)
	log(num)
    local pos = zone.getPosition()

	for i=1,tonumber(num),1 do
		deck.takeObject({
			top = true,
			position = {pos.x, pos.y + 2, pos.z},
			smooth = true,
		})
		Wait.time(function()
				zone.LayoutZone.layout()
		end, 2)
	end
end

function drawFromWhiteDeck(num, color)
	drawFrom(getWhiteDrawDeck(), num, color)
end

function drawFromBlackDeck(num, color)
	drawFrom(getBlackDrawDeck(), num, color)
end

function drawFromGreenDeck(num, color)
	drawFrom(getGreenDrawDeck(), num, color)
end

function drawFromWhiteDiscard(num, color)
	drawFrom(getWhiteDiscardDeck(), num, color)
end

function drawFromBlackDiscard(num, color)
	drawFrom(getBlackDiscardDeck(), num, color)
end

function drawFromGreenDiscard(num, color)
	drawFrom(getGreenDiscardDeck(), num, color)
end

function searchDeckByName(deck, name)
	if deck.hasTag("Deck") then
		return searchForCardName(deck, name)
	else
	    returnMe = nil
		if string.lower(deck.name):find(string.lower(name),1,false) then
			return deck
		end
	end
end

function searchWhiteDiscardByName(name)
	deck = getWhiteDiscardDeck()
	return searchDeckByName(deck, name)
end

function searchBlackDiscardByName(name)
	deck = getBlackDiscardDeck()
	return searchDeckByName(deck, name)
end

function searchGreenDiscardByName(name)
	deck = getWhiteDiscardDeck()
	return searchDeckByName(deck, name)
end

function searchWhiteDiscardByType(cardType)
	return searchForCardType(getWhiteDiscardDeck(), cardType)
end

function searchBlackDiscardByType(cardType)
	return searchForCardType(getBlackDiscardDeck(), cardType)
end

function searchGreenDiscardByType(cardType)
	return searchForCardType(getWhiteDiscardDeck(), cardType)
end

function searchWhiteDeckByName(name)
	return searchForCardName(getWhiteDrawDeck(), name)
end

function searchBlackDeckByName(name)
	return searchForCardName(getBlackDrawDeck(), name)
end

function searchGreenDeckByName(name)
	return searchForCardName(getGreenDrawDeck(), name)
end

function searchWhiteDeckByType(cardType)
	return searchForCardType(getWhiteDrawDeck(), cardType)
end

function searchBlackDeckByType(cardType)
	return searchForCardType(getBlackDrawDeck(), cardType)
end

function searchGreenDeckByType(cardType)
	return searchForCardType(getGreenDrawDeck(), cardType)
end

function searchForCard(deckType, deckColour, searchJson, strPlayerColour)
	deck = nil

	if deckType == "discard" then
		if deckColour == "white" then
			deck = getWhiteDiscardDeck()
		elseif deckColour == "green" then
			deck = getGreenDiscardDeck()
		elseif deckColour == "black" then
			deck = getBlackDiscardDeck()
		end
	else
		if deckColour == "white" then
			deck = getWhiteDrawDeck()
		elseif deckColour == "green" then
			deck = getGreenDrawDeck()
		elseif deckColour == "black" then
			deck = getBlackDrawDeck()
		end
	end
	log("searchForCard deck")
	log(deck)

	card = searchForCardInDeck(deck, searchJson)
	
	if card then
		log("card found")
		log(card)
		log(card.guid)

		if deckColour == "green" then
			moveCardToHand(card.guid, strPlayerColour)
		else
			if deck.tag == "Deck" then
				cardObject = deck.takeObject(
				{
					guid = card.guid,
				})
				moveCardToLayout(cardObject, strPlayerColour)
			else
				moveCardToLayout(card, strPlayerColour)
			end		
		end
	else 
		log("card not found")
		log(searchJson)
	end
end

function searchForCardInDeck(deck, searchJson)
	log("searchForCardInDeck")
	log(searchJson.name .. " " .. searchJson.description)
	searchObject = searchJson

    returnMe = nil
	
	if deck.tag == "Card" then
		log("deck is card")
		
		card = {
			name=deck.getName(),
			description=deck.getDescription(),
			gmNotes=deck.getGMNotes()
		}
		
		isMatch = doesCardMatch(card, searchObject)
		
		if isMatch then
			log("card is match")
			returnMe = deck
		end
	else
		cards = deck.getObjects()
		dist = 100

		for _, card in ipairs(cards) do
			match = false
			tempdist = getCardDistance(card, searchObject)
			isMatch = doesCardMatch(card, searchObject)

			if tempdist < dist and isMatch then
				returnMe = card
				dist = tempdist
			end
		end
	end
    return returnMe
end

function getCardDistance(card, searchObject)
	for k, v in pairs(searchObject) do
		log("card[k] " .. card[k])
		log("v " .. v)
	
		a=string.lower(tostring(card[k]))
		b=string.lower(tostring(v))
	
		return levenshteinDistance(a, b)
	end
end

function doesCardMatch(card, searchObject)
	log("doesCardMatch")
	log("card")
	log(card)
	log("card.name")
	log(card.name)
	log("searchObject")
	log(searchObject)
	
	returnMe = false
	for k, v in pairs(searchObject) do
		a=string.lower(tostring(card[k]))
		b=string.lower(tostring(v))
		
		log("a: " .. a)
		log("b: " .. b)
		returnMe = returnMe or a:find(b,1,false)
	end
	
	return returnMe
end

function searchForCardName(deck, cardName)
    returnMe = nil
    cards = deck.getObjects()

    for _, object in ipairs(cards) do
        if object.name == cardName then
            -- deck.takeObject(object)
            returnMe = object
        end
    end

    return returnMe
end

function searchForCardType(deck, cardType)
    returnMe = nil
    cards = deck.getObjects()

    for _, object in ipairs(cards) do
        if object.gm_notes:find(cardType,1,false) then
            -- deck.takeObject(object)
            returnMe = object
        -- else do we want to discard the cards here
        end
    end

    return returnMe
end

function GetCardsInHand(strPlayerColour)
	-- log("GetCardsInHand " .. strPlayerColour) 
	
	if strPlayerColour == "gray" then
		return nil
	end
	
	cards = Player[tostring(firstToUpper(strPlayerColour))].getHandObjects()
	json = convertCardsToJSON(cards)
	-- log(json)
	return {json=json}
end

function GetCardsInLayout(strPlayerColour)
	-- log("GetCardsInLayout " .. strPlayerColour) 
	cards = objects.players[firstToUpper(strPlayerColour)].layout.getObjects()
	json = convertCardsToJSON(cards)
	-- log(json)
	return {json=json}
end

function firstToUpper(str)
	return str:gsub("^%l", string.upper)
end

function convertCardToJSON(card)
	return {
		guid = card.getGUID(),
		name = card.getName(),
		gmNotes = card.getGMNotes(),
		type = card.tag,
		description = card.getDescription(),
		position = card.getPosition()
	}
end

function convertCardsToJSON(cards)
	local result = {}

	for i, obj in ipairs(cards) do
		table.insert(result, convertCardToJSON(obj))
	end

	local json = JSON.encode_pretty(result)
	-- log(json)
	return json
end

function levenshteinDistance(str1, str2)
    local len1 = #str1
    local len2 = #str2

    -- Handle empty strings
    if len1 == 0 then return len2 end
    if len2 == 0 then return len1 end

    -- Keep the shorter string as the columns
    if len1 < len2 then
        str1, str2 = str2, str1
        len1, len2 = len2, len1
    end

    -- Initialize previous row
    local previous = {}
    local current = {}

    for j = 0, len2 do
        previous[j] = j
    end

    -- Calculate distances
    for i = 1, len1 do
        current[0] = i

        for j = 1, len2 do
            local cost = 1

            if str1:sub(i, i) == str2:sub(j, j) then
                cost = 0
            end

            current[j] = math.min(
                previous[j] + 1,       -- Deletion
                current[j - 1] + 1,    -- Insertion
                previous[j - 1] + cost -- Substitution
            )
        end

        previous, current = current, previous
    end

    return previous[len2]
end



log("kitten sitting " .. levenshteinDistance("kitten", "sitting")) -- 3
log("hello helo" .. levenshteinDistance("hello", "helo"))     -- 1
log("Shadow Hunter" .. levenshteinDistance("Shadow", "Hunter"))  -- 6
log("apple apple" .. levenshteinDistance("apple", "apple"))    -- 0

showGameSetup()
