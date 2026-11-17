--[[ Lua code. See documentation: https://api.tabletopsimulator.com/ --]]

Turns.enable = true

currentGameMode = "standard"

config = {
    teams = { 'hunter', 'shadow', 'neutral' }
}

objects = {}

highlightColor = {r=1,g=1,b=1,a=1}

firstTurn = true

function onPlayerTurn(player, previous_player)
	meeples = getObjectsWithTag("meeple");
	
    for i, object in ipairs(meeples) do
		if previous_player ~= nil and not firstTurn then
			if string.lower(object.getName()) == string.lower(previous_player.color) then
				object.scale({x=0.5,y=0.5,z=0.5})
			end
		end

        if string.lower(object.getName()) == string.lower(player.color) then
			object.highlightOn(highlightColor, 60)
			object.scale({x=2,y=2,z=2})
		else
			object.highlightOff(highlightColor);
        end
    end
	
	firstTurn = false
end

--[[ The onLoad event is called after the game save finishes loading. --]]
function onLoad()
    --[[ print('onLoad!') --]]
    objects.gmArea = getObjectFromGUID('561ed1')
    objects.board = getObjectFromGUID('ed0d18')
    objects.turnSkipper = getObjectFromGUID('a0bfbc')
    objects.locationArea = getObjectFromGUID('fa42b3')
    objects.whiteDeckArea = getObjectFromGUID('16aa58')
    objects.greenDeckArea = getObjectFromGUID('cd7977')
    objects.blackDeckArea = getObjectFromGUID('cc5380')
    -- print(objects.gmArea)
end

--[[ The onUpdate event is called once per frame. --]]
function onUpdate()
    --[[ print('onUpdate loop!') --]]
end

function updateBoard()
    if config.cardsToUse['gamenight'] or config.cardsToUse['election2020'] then
        Global.objects.board.setCustomObject({ image = 'https://steamusercontent-a.akamaihd.net/ugc/1675863097248861074/9DF8E3DC476DAFCAE7937F452E1466CEE3934122/' })
    else
        Global.objects.board.setCustomObject({ image = 'https://steamusercontent-a.akamaihd.net/ugc/1675863097248860756/0740B714DC7CB757406BB4F77905FF691707AC51/' })
    end
    board.reload()
end

function getRandomFromList(list)
    index = math.random(#list)
    return list[index]
end

function findDeckInZone(zone)
    local objectsInZone = zone.getObjects()
    for i, object in ipairs(objectsInZone) do
        if object.tag == "Deck" then
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
    --print("board.getPlayerCount returning " .. count)
    return count
end

function deleteUnusedSeats()
    --print("board.deleteUnusedSeats")

    players = {}
    for _,player in ipairs(getSeatedPlayers()) do
        players[player] = true
    end

    --print("board.deleteUnusedSeats after setting seated players")

--    for _,player in ipairs(Player.getAvailableColors()) do
        --if not players[player] then
            --destroyObject(getObjectFromGUID(config.pieces[player].area))
        --end
    --end
    --print("board.deleteUnusedSeats after deleting unused seats")
end

function startGame()
    --print("board.startGame")
    
    playerCount = getPlayerCount()
    gameMode = config.gameMode

    --print("board.startGame params set")

    -- deck = getObjectFromGUID('b5c2b7')
    
    deck = findDeckInZone(objects.gmArea)
    
    --if deck then
        --print("board.startGame deck found")
    --end


    -- print("deck.startGame.playerCount" .. playerCount)
    
    initModeModules()
    
    modeModule = modeModules[currentGameMode]

    -- print("deck.startGame.modeName" .. currentGameMode)

	cards = getCards(deck)

    -- print("deck.startGame.cards " .. #cards)

    picks = modeModule.getGuidsByLetter(playerCount, cards)

    -- print("deck.startGame.picks " .. #picks)

    teamCounts = modeModule.getTeamCounts(playerCount)

    -- print("deck.startGame.teamCounts")


    guids = modeModule.getGuidsToUse(teamCounts, picks)

    -- print("deck.startGame.guids " .. #guids)

    dealCards(deck, guids)

    -- print("deck.startGame cards dealt")

    shuffleDecks()
    -- print("deck.startGame shuffled")

    dealAreaCards()
    -- print("deck.startGame area")

    res = modeModule.validateCardCount(teamCounts, picks) and 
        modeModule.validatePlayerCount(playerCount) 

    if res then
        --print("board.startGame res got")
        self.clearButtons()
        --print("board.startGame buttons cleared")
        deleteUnusedSeats()
        --print("board.startGame deleted unused seats")


        showGameMode(currentGameMode)

        firstPlayer = getRandomFromList(getSeatedPlayers())
        --print("board.startGame firstplayer chosen")
        broadcastToAll(firstPlayer .. " goes first.", Color.fromString(firstPlayer))
        --print("board.startGame broadcast")
        Turns.turn_color = firstPlayer
		
		objects.turnSkipper.call('spawnForEachSeatedPlayer')
		
        hideGameSetup()
    end
end

function showGameMode(gameMode)
    UI.setXmlTable({
        {
            tag="HorizontalLayout",
            attributes={
                rectAlignment="UpperRight",
                offsetXY="-450 0",
                height="7%",
                width="15%",
                color="rgba(0,0,0,0.7)",
            },
            children={
                {
                    tag="Text",
                    attributes={
                        fontSize=16,
                        color="white",
                    },
                    value="Gamemode: ",
                },
                {
                    tag="Text",
                    attributes={
                        text=gameMode,
                        fontSize=16,
                        color="blue",
                    },
                },
            }
        }
    })
end


function showGameSetup()
    UI.setXmlTable({
        {
            tag="VerticalLayout",
            attributes={
                rectAlignment="LowerRight",
                offsetXY="-400 0",
                id="gameSetup",
                height="7%",
                width="15%",
                color="rgba(0,0,0,0.7)",
            },
            children={
                {
                    tag="HorizontalLayout",
                    attributes={
                        rectAlignment="UpperCenter",
                        offsetXY="0 0",
                        height="50%",
                        width="100%",
                        color="rgba(0,0,0,0.7)",
                    },
                    children={
                        {
                            tag="Button",
                            attributes={
                                fontSize=16,
                                text="Standard",
                                textOutline="rgba(1,1,1,1)",
                                onClick="setGameModeStandard",
                                color=getGameModeButtonColor("standard")
                            },
                        },
                        {
                            tag="Button",
                            attributes={
                                fontSize=16,
                                text="Random",
                                textOutline="rgba(1,1,1,1)",
                                onClick="setGameModeRandom",
                                color=getGameModeButtonColor("allrandom")
                            },
                        },
                        {
                            tag="Button",
                            attributes={
                                fontSize=16,
                                text="All Neutrals",
                                textOutline="rgba(1,1,1,1)",
                                onClick="setGameModeAllNeutrals",
                                color=getGameModeButtonColor("allneutrals")
                            },
                        },
                        {
                            tag="Button",
                            attributes={
                                fontSize=16,
                                text="mo neutrals",
                                textOutline="rgba(1,1,1,1)",
                                onClick="setGameMode121",
                                color=getGameModeButtonColor("onetwoone")
                            },
                        }
                    }
                },
                {
                    tag="HorizontalLayout",
                    attributes={
                        rectAlignment="LowerCenter",
                        offsetXY="0 0",
                        height="50%",
                        width="100%",
                        color="rgba(0,0,0,0.7)",
                    },
                    children={
                        {
                            tag="Button",
                            attributes={
                                fontSize=28,
                                colors="rgba(0.5,0.5,0.5,1)|rgba(0.7,0.7,0.7,1)|rgba(1,1,1,1)",
                                textOutline="rgba(1,1,1,1)",
                                onClick="startGame",
                                text="Start Game"
                            },
                        }
                    }
                }
            },
        }
    })
end

function hideGameSetup()
    UI.hide("gameSetup")
end

function getGameModeButtonColor(target)
    if(currentGameMode == target) then
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
        self.editButton({
            index = idx,
            color = { 1, 1, 1}
        })
    else
        self.editButton({
            index = idx,
            color = { 0.7, 0.7, 0.7 }
        })
    end
end

function toggleGameMode(key, idx)
    config.gameMode[key] = not config.gameMode[key]
    if config.gameMode[key] then
        self.editButton({
            index = idx,
            color = { 1, 1, 1}
        })
    else
        self.editButton({
            index = idx,
            color = { 0.7, 0.7, 0.7 }
        })
    end
end

function getButtonColor(enabled)
    if enabled then
        return { 1,1,1 }
    else
        return {0.7,0.7,0.7}
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
    if currentGameMode != nil then
        toggleGameMode(currentGameMode, gameModes[currentGameMode].idx + modeIdxOffset)
    end
    if (currentGameMode != nextGameMode) then
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
    modeModules.standard = { }

    modeModules.standard.validatePlayerCount = function(playerCount)
        --print("modeModules.regular.validatePlayerCount")
        if playerCount < 4 then
            broadcastToAll("Not enough players to start the game.\nRequires a minimum of 4 players.")
            return false
        end
        return true
    end

    modeModules.standard.validateCardCount = function(teamCounts, picks)
        for _,team in ipairs(config.teams) do
            numLetters = 0
            for _,_ in pairs(picks[team]) do numLetters = numLetters+1 end
            if numLetters < teamCounts[team] then
                broadcastToAll("Not enough cards for this many players.  Enable more expansions.")
                return false
            end
        end
        return true
    end

    modeModules.standard.getGuidsByLetter = (function(playerCount, cards) 
        --print("deck.modeModules.regular.getGuidsByLetter cards " .. #cards)
        return getGuidsByLetter(cards, 
            (function(card) 
                if(not card) then
                    return false
                end
            
                -- print("getGuidsByLetter playercount " .. playerCount)
                -- print("getGuidsByLetter card " .. table.concat(card))
                -- print("getGuidsByLetter result " .. tostring((not (playerCount == 5 and card.tags.minsix))))
                
                return not (playerCount == 5 and card.tags.minsix) 
            end), {}) 
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

        for _,team in ipairs(config.teams) do
            _regularGetTeamGuidsToUse(teamCounts[team], picks[team], guids)
        end

        return guids
    end

    function _regularGetTeamGuidsToUse(teamCount, teamPicks, guids)
        lettersToPickFrom = {}
        for letter,_ in pairs(teamPicks) do
            lettersToPickFrom[#lettersToPickFrom+1] = letter
        end

        while teamCount > 0 do
            letterIndex = math.random(#lettersToPickFrom)
            letter = lettersToPickFrom[letterIndex]
            guidIndex = math.random(#teamPicks[letter])
            guid = teamPicks[letter][guidIndex]
            guids[#guids+1] = guid
            teamCount = teamCount-1
            lettersToPickFrom[letterIndex] = lettersToPickFrom[#lettersToPickFrom]
            lettersToPickFrom[#lettersToPickFrom] = nil
        end
    end
end

function setupNeutralsModule()
    modeModules.allneutrals = { }

    modeModules.allneutrals.validatePlayerCount = function(playerCount)
        if playerCount < 3 then
            broadcastToAll("Not enough players to start the game.\nNeutrals Only requires a minimum of 3 players.")
            return false
        end
        return true
    end

    modeModules.allneutrals.validateCardCount = function(teamCounts, picks)
        numNeutrals = 0
        for _,neutralCards in pairs(picks.neutral) do
            numNeutrals = numNeutrals + #neutralCards
        end

        if teamCounts.neutral > numNeutrals then
            broadcastToAll("Not enough cards for this many players.  Enable more expansions.")
            return false
        end
        return true
    end

    modeModules.allneutrals.getGuidsByLetter = (function(playerCount, cards) 
        return getGuidsByLetter(cards, 
        (function() return true end), 
            {"noallneutrals"}) 
        end )

    modeModules.allneutrals.getTeamCounts = function(playerCount)
        return {
            hunter = 0,
            shadow = 0,
            neutral = playerCount
        }
    end

    modeModules.allneutrals.getGuidsToUse = function(teamCounts, picks)
        guids = {}

        for _,team in ipairs(config.teams) do
            _allNeutralGetTeamGuidsToUse(teamCounts[team], picks[team], guids)
        end

        return guids
    end

    function _allNeutralGetTeamGuidsToUse(teamCount, teamPicks, guids)
        lettersToPickFrom = {}
        for letter,_ in pairs(teamPicks) do
            lettersToPickFrom[#lettersToPickFrom+1] = letter
        end

        while teamCount > 0 do
            letterIndex = math.random(#lettersToPickFrom)
            letter = lettersToPickFrom[letterIndex]
            guidIndex = math.random(#teamPicks[letter])
            guid = teamPicks[letter][guidIndex]

            alreadyPicked = false
            for _,pickedGuid in ipairs(guids) do
                if pickedGuid == guid then alreadyPicked = true end
            end

            if not alreadyPicked then
                guids[#guids+1] = guid
                teamCount = teamCount-1
            end
        end
    end
end

function setupRandomModule()
    modeModules.allrandom = { }

    modeModules.allrandom.validatePlayerCount = function(playerCount)
        if playerCount < 3 then
            broadcastToAll("Not enough players to start the game.\nFree For All requires a minimum of 3 players.")
            return false
        end
        return true
    end

    modeModules.allrandom.validateCardCount = function(teamCounts, picks)
        totalCards = 0
        for _,team in ipairs(config.teams) do
            for _,_ in pairs(picks[team]) do totalCards = totalCards+1 end
        end
        if totalCards < teamCounts.neutral then
            broadcastToAll("Not enough cards for this many players.  Enable more expansions.")
            return false
        end
        return true
    end

    modeModules.allrandom.getGuidsByLetter = (function(playerCount, cards) 
        return getGuidsByLetter(cards, 
            (function() return true end), 
            {}) 
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
            for k,v in pairs(picks[team]) do
                letters[#letters+1] = k
            end

            letterIndex = math.random(#letters)
            letter = letters[letterIndex]
            guidIndex = math.random(#picks[team][letter])
            guid = picks[team][letter][guidIndex]

            alreadyPicked = false
            for _,pickedGuid in ipairs(guids) do
                if pickedGuid == guid then alreadyPicked = true end
            end

            if not alreadyPicked then
                guids[#guids+1] = guid
                count = count-1
            end
        end

        return guids
    end
end

function setupOneTwoOneModule()
    modeModules.onetwoone = { }

    modeModules.onetwoone.validatePlayerCount = function(playerCount)
        if playerCount < 4 then
            broadcastToAll("Not enough players to start the game.\n1v2v1 requires a minimum of 4 players.")
            return false
        end
        return true
    end

    modeModules.onetwoone.validateCardCount = function(teamCounts, picks)
        totalCards = 0
        for _,team in ipairs(config.teams) do
            for _,_ in pairs(picks[team]) do totalCards = totalCards+1 end
        end
        if totalCards < 4 then
            broadcastToAll("Not enough cards for this many players.  Enable more expansions.")
            return false
        end
        return true
    end

    modeModules.onetwoone.getGuidsByLetter = (function(playerCount, cards) 
        return getGuidsByLetter(cards,
            (function() return true end), 
            {"no121"}) 
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
			return {
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

        for _,team in ipairs(config.teams) do
            _regularGetTeamGuidsToUse(teamCounts[team], picks[team], guids)
        end

        return guids
    end

    function _regularGetTeamGuidsToUse(teamCount, teamPicks, guids)
        lettersToPickFrom = {}
        for letter,_ in pairs(teamPicks) do
            lettersToPickFrom[#lettersToPickFrom+1] = letter
        end

        while teamCount > 0 do
            letterIndex = math.random(#lettersToPickFrom)
            letter = lettersToPickFrom[letterIndex]
            guidIndex = math.random(#teamPicks[letter])
            guid = teamPicks[letter][guidIndex]
            guids[#guids+1] = guid
            teamCount = teamCount-1
            lettersToPickFrom[letterIndex] = lettersToPickFrom[#lettersToPickFrom]
            lettersToPickFrom[#lettersToPickFrom] = nil
        end
    end
end


function getGuidsByLetter(cards, selector, excludedTags)
    -- print("getGuidsByLetter")
    picks = {}
    for _,team in ipairs(config.teams) do
        picks[team] = {}
    end
    for guid, card in pairs(cards) do
        canUse = false
        --print("guid " .. guid)
        --print("card " .. table.concat(card))
        
        if (card ~= nil) then 
            -- do stuff
        
            -- print("cardsToUse " .. #cardsToUse)
            -- print("card tags")

            canUse = selector(card)
            
            if(canUse) then
                for index, value in ipairs(excludedTags) do
                    if (card.tags[value]) then
                        -- print("can't use")
                        canUse = false
                    end
                end
            end

            if canUse then
                if picks[card.team][card.letter] == nil then
                    picks[card.team][card.letter] = {}
                end
                cardsForLetter = picks[card.team][card.letter]
                cardsForLetter[#cardsForLetter+1] = guid
            end
        end
    end
    return picks
end


function getCards(deck)

    -- print("deck.getCards")
    cards = {}

        -- print("deck.getCards loop")
    	for _,card in ipairs(deck.getObjects()) do

	        script = card.gm_notes
            -- print("deck.getCards loop script" .. script)

	        if script != '' then
	            data = JSON.decode(script)
	            cards[card.guid] = data
                -- print("deck.getCards loop data set")
	        end
	    end

    -- print("deck.getCards returning " .. #cards)
    return cards
end

function incOffset(xoffset, yoffset)
    if xoffset > 14 then
        yoffset = yoffset+5
        xoffset = 0
    else
        xoffset = xoffset+4
    end
    return xoffset, yoffset
end

function dealCards(deck, guids)
    cardsToGroup = {}
    xoffset = 0
    yoffset = 0

    for _, guid in ipairs(guids) do
        cardsToGroup[#cardsToGroup+1] = deck.takeObject({
            guid = guid,
            position = {-39.2 + xoffset, 1.5, -0.35 - yoffset}
        })
        	xoffset, yoffset = incOffset(xoffset, yoffset)
    end

    function finalGroup()
        groupedCards = group(cardsToGroup)

        function finalDeal()
            deck = groupedCards[1]
            deck.shuffle()
            deck.shuffle()
            deck.shuffle()
            for _,player in ipairs(getSeatedPlayers()) do
                deck.deal(1, player)
            end

            -- destroyObject(self)
        end

        Timer.create({
            identifier = tostring({}),
            function_name = 'finalDeal',
            function_owner = self,
            delay = 1,
            repetitions = 1
        })
    end

    Timer.create({
        identifier = tostring({}),
        function_name = 'finalGroup',
        function_owner = self,
        delay = 1,
        repetitions = 1
    })
end

function shuffleDecks()
	-- old decks
    -- getObjectFromGUID('62a7a0').shuffle()
    -- getObjectFromGUID('96fa0d').shuffle()
    -- getObjectFromGUID('9f1843').shuffle()
	whiteDeck = findDeckInZone(objects.whiteDeckArea)
	greenDeck = findDeckInZone(objects.greenDeckArea)
	blackDeck = findDeckInZone(objects.blackDeckArea)
	
	whiteDeck.shuffle()
	greenDeck.shuffle()
	blackDeck.shuffle()
end

function dealAreaCards()
	area_cards = findDeckInZone(objects.locationArea)
    -- area_cards = getObjectFromGUID('212b6a')
    area_cards.shuffle()

    game_board = getObjectFromGUID('ed0d18')
	snapPoints = game_board.getSnapPoints()

	
    for _,snappoint in ipairs(snapPoints) do
		for tag in snappoint.tags do
			if tag == "location" then
				area_card = area_cards.takeObject({
					position = game_board.positionToWorld(snappoint.position),
					rotation = { snappoint.rotation.x, snappoint.rotation.y + 180, snappoint.rotation.z }
				})
				area_card.setLock(true)
			end
		end
    end
end



showGameSetup()


