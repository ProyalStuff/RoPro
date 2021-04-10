/**

RoPro (https://ropro.io) v1.1

RoPro was wholly designed and coded by:
                               
,------.  ,--. ,-----.,------. 
|  .-.  \ |  |'  .--./|  .---' 
|  |  \  :|  ||  |    |  `--,  
|  '--'  /|  |'  '--'\|  `---. 
`-------' `--' `-----'`------' 
                            
Contact me with inquiries (job offers welcome) at:

Discord - Dice#1000
Email - dice@ropro.io
Phone - ‪(650) 318-1631‬

Write RoPro:

Dice Systems LLC
1629 K. Street N.W.
Suite 300
Washington, DC
20006-1631

RoPro Terms of Service:
https://ropro.io/terms

RoPro Privacy Policy:
https://ropro.io/privacy-policy

© 2020 Dice Systems LLC
**/

var theme = "dark"
if ($('.light-theme').length > 0) {
    var theme = "light"
}

searchBarHTML = `<div id="searchServerMain" style="margin-top:5px;margin-bottom:25px;height:45px;position:relative;">
					<div style="float:left;width:400px;margin-left:5px;margin-bottom:10px;" class="input-group">
					<form><input autofocus="" id="searchServer" class="form-control input-field" type="text" placeholder="Enter Exact Username..." maxlength="120" autocomplete="off" value="">
					<div style="font-size:12px;color:red;" id="serverSearchError"></div>
					<div style="font-size:12px;color:green;" id="serverSearchSuccess"></div>
					</form>
					<div class="input-group-btn"><button style="margin:0px;margin-left:2px;" class="input-addon-btn" type="submit">
					<span class="icon-nav-search"></span>
					</button></div></div>
					<span id="searchServerButton" style="padding:10px;margin-bottom:10px;float-left;" class="btn-secondary-md btn-more rbx-private-server-create-button">Search</span>
					</div>`

var pageIndex = 0;
var customServerList = null;
var globalGameId = 0;
var hasFastServers = false;

function fetchPlayTime(gameID, time) {
	return new Promise(resolve => {
		chrome.runtime.sendMessage({greeting: "GetURL", url:"https://ropro.io/api/getPlayTime.php?gameid=" + gameID + "&time=" + time},
			function(data) {
					resolve(data)
			})
	})
}

function fetchMaxPlayerIndex(gameID, maxPlayers) {
	return new Promise(resolve => {
		chrome.runtime.sendMessage({greeting: "GetMaxPlayerIndex", gameID: gameID, count: maxPlayers}, 
			function(data) {
				resolve(data)
		})
	})
}

function fetchLowPingServers(gameID, startIndex, maxServers) {
	return new Promise(resolve => {
		chrome.runtime.sendMessage({greeting: "GetLowPingServers", gameID: gameID, startIndex: startIndex, maxServers: maxServers}, 
			function(data) {
				resolve(data)
		})
	})
}

function fetchServerSearch(username, gameID) {
	return new Promise(resolve => {
		chrome.runtime.sendMessage({greeting: "GetUserServer", username: username, gameID: gameID}, 
			function(data) {
				resolve(data)
		})
	})
}

function fetchServerPage(gameID, index) {
	return new Promise(resolve => {
		chrome.runtime.sendMessage({greeting: "GetURL", url:"https://www.roblox.com/games/getgameinstancesjson?placeId=" + gameID + "&startIndex=" + index},
			function(data) {
				resolve(data)
		})
	})
}

function fetchSocialLinks(universeId) {
	return new Promise(resolve => {
		chrome.runtime.sendMessage({greeting: "GetURL", url:"https://games.roblox.com/v1/games/"+universeId+"/social-links/list"}, 
			function(data) {
				resolve(data)
		})
	})
}

function fetchDiscordID(discordUrl) {
	return new Promise(resolve => {
		chrome.runtime.sendMessage({greeting: "GetURL", url:"https://ropro.io/api/getDiscordID.php?link=" + discordUrl}, 
			function(data) {
				resolve(data)
		})
	})
}


function fetchGameInfo(universeId) {
	return new Promise(resolve => {
		chrome.runtime.sendMessage({greeting: "GetURL", url:"https://games.roblox.com/v1/games?universeIds=" + universeId}, 
			function(data) {
				resolve(data)
		})
	})
}

function fetchVotes(universeId) {
	return new Promise(resolve => {
		chrome.runtime.sendMessage({greeting: "GetURL", url:"https://games.roblox.com/v1/games/votes?universeIds=" + universeId}, 
			function(data) {
				resolve(data)
		})
	})
}

function fetchFavorites(universeId) {
	return new Promise(resolve => {
		chrome.runtime.sendMessage({greeting: "GetURL", url:"https://games.roblox.com/v1/games/" + universeId + "/favorites/count"}, 
			function(data) {
				resolve(data)
		})
	})
}

function fetchSetting(setting) {
	return new Promise(resolve => {
		chrome.runtime.sendMessage({greeting: "GetSetting", setting: setting}, 
			function(data) {
				resolve(data)
			}
		)
	})
}

function getLocalStorage(key) {
	return new Promise(resolve => {
		chrome.storage.local.get(key, function (obj) {
			resolve(obj[key])
		})
	})
}

function addCommas(nStr){
	nStr += '';
	var x = nStr.split('.');
	var x1 = x[0];
	var x2 = x.length > 1 ? '.' + x[1] : '';
	var rgx = /(\d+)(\d{3})/;
	while (rgx.test(x1)) {
		x1 = x1.replace(rgx, '$1' + ',' + '$2');
	}
	return x1 + x2;
}

async function loadServerPage(gameID, index){
	if (customServerList == null) {
		serverPage = await fetchServerPage(gameID, index)
	} else {
		if (index < customServerList.length) {
			serverPage = {"Collection": customServerList.slice(index, Math.min(index + 10, customServerList.length))}
		} else {
			serverPage = {"Collection": []}
		}
	}
	serversHTML = ""
	for (i = 0; i < serverPage.Collection.length; i++) {
		server = serverPage.Collection[i]
		gameId = server.Guid
		placeId = server.PlaceId
		playerCount = server.CurrentPlayers.length + " out of " + server.Capacity + " max"
		playersHTML = ""
		additionalInfoDiv = ""
		if (customServerList != null) {
			additionalInfoDiv = `<div class="text-info rbx-game-status rbx-game-server-status" style="margin-top:5px;font-size:13px;">Server Ping: ${server.Ping} ms</div>`
		}
		for (j = 0; j < server.CurrentPlayers.length; j++) {
			player = server.CurrentPlayers[j]
			thumbnail = player.Thumbnail.Url
			playerHTML = `<span class="special-span avatar avatar-headshot-sm player-avatar"><a class="avatar-card-link"><img class="avatar-card-image" src="${thumbnail}"></a></span>`
			playersHTML += playerHTML
		}
		serversHTML += `<li class="stack-row rbx-game-server-item"><div class="section-header">
						<div class="link-menu rbx-game-server-menu"></div></div>
						<div class="section-left rbx-game-server-details">
							<div class="text-info rbx-game-status rbx-game-server-status">${playerCount}</div>
							${additionalInfoDiv}
							<div class="rbx-game-server-alert hidden"><span class="icon-remove"></span></div>
							<a class="btn-full-width btn-control-xs rbx-game-server-join" href="#" data-placeid="2202352383" onclick='Roblox.GameLauncher.joinGameInstance(${placeId}, "${gameId}")'>Join</a></div>
						<div class="section-right rbx-game-server-players">${playersHTML}</div></li>`
	}
	pageIndex = index
	document.getElementById('maxPlayersLoadingBar').style.display = "none"
	$('#rbx-game-server-item-container').html(serversHTML)
	$('.rbx-running-games-footer').html(`<button type="button" id="loadMoreButton" class="btn-control-sm btn-full-width rbx-running-games-load-more">Load More</button>`)
	$('#loadMoreButton').click(function(){
		loadServerPage(gameID, pageIndex+10)
	})
}

function createServerElement(server) {
	gameId = server.Guid
	placeId = server.PlaceId
	playerCount = server.CurrentPlayers.length + " out of " + server.Capacity + " max"
	li = document.createElement("li")
	li.setAttribute("id", "serverSearchResult")
	li.setAttribute("class", "stack-row rbx-game-server-item")
	li.setAttribute("style", "margin-bottom:30px;")
	li.setAttribute("data-gameid",gameId.toString())
	playersHTML = ""
	for (i = 0; i < server.CurrentPlayers.length; i++) {
		player = server.CurrentPlayers[i]
		thumbnail = player.Thumbnail.Url
		if (thumbnail == server.thumbnailToFind) {
			specialStyleSpan = "z-index:100000;"
			specialStyleImg = "transform:scale(1.5);"
			specialId = 'id="myGlower"'
		} else {
			specialStyleImg = ""
			specialStyleSpan = ""
			specialId = ''
		}
		playerHTML = `<span style="${specialStyleSpan}" class="special-span avatar avatar-headshot-sm player-avatar"><a class="avatar-card-link"><img ${specialId} style="${specialStyleImg}" class="avatar-card-image" src="${thumbnail}"></a></span>`
		playersHTML += playerHTML
	}
	serverHTML = `<div class="section-header">
					<div class="link-menu rbx-game-server-menu"></div></div>
					<div class="section-left rbx-game-server-details">
						<div class="text-info rbx-game-status rbx-game-server-status">${playerCount}</div>
						<div class="rbx-game-server-alert hidden"><span class="icon-remove"></span></div>
						<a class="btn-full-width btn-control-xs rbx-game-server-join" href="#" data-placeid="2202352383" onclick='Roblox.GameLauncher.joinGameInstance(${placeId}, "${gameId}")'>Join</a></div>
					<div class="section-right rbx-game-server-players">${playersHTML}</div>`
	li.innerHTML = serverHTML
	document.getElementById('rbx-game-server-item-container').insertBefore(li, document.getElementById('rbx-game-server-item-container').childNodes[0])
	$(function() {
		var glower = $('#myGlower');
		setInterval(function() {  
			glower.toggleClass('active');
		}, 1000);
	})
}

function createMaxPlayers(maxPlayers) {
	dropdown = ""
	for (i = maxPlayers; i > 0; i--) {
		if (i == 1) {
			playerString = "Player"
		} else {
			playerString = "Players"
		}
		dropdown += `<li class="dropdown-custom-item" id="${i}"> <a style="font-size:13px;">${i} ${playerString}</a></li>`
	}
	fastServersButton = `<button style="height:38px;display:inline-block;margin-left:-160px;" type="button" id="fastServersButton" class="input-dropdown-btn category-options ng-scope"> 
			<span style="font-size:13px;" class="text-overflow rbx-selection-label ng-binding dropdown-button-text"> <a style="font-size:13px;">${chrome.i18n.getMessage("FastestServers")}</a></span>
			<span style="margin-right:-10px;margin-top:-1px;transform:scale(0.8);" class="icon-nav-my-feed"></span></button>`
	hasFastServers = true
	if (hasFastServers) {
		loadMargin = "310px"
	} else {
		loadMargin = "160px"
	}
	div = document.createElement("div")
	maxPlayersHTML = `<div style="float:right;width:150px;margin-top:-40px;" class="input-group-btn">
			<span id="maxPlayersLoadingBar" style="margin-right: ${loadMargin}; float: right; display: none; transform: scale(0.8); width: 100px; height: 25px; visibility: initial !important;" class="spinner spinner-default"></span>
            ${fastServersButton}
			<button style="height:38px;display:inline-block;" type="button" id="maxPlayerButton" class="input-dropdown-btn category-options ng-scope"> 
			<span style="font-size:13px;" class="text-overflow rbx-selection-label ng-binding dropdown-button-text">${chrome.i18n.getMessage("MaxPlayers")}</span> <span class="icon-down-16x16"></span> </button> 
            <ul page="0" style="width:150px;" id="maxPlayerDropdown" class="max-player-dropdown dropdown_menu dropdown_menu-4 dropdown-menu">
				${dropdown}
            </ul>
         </div>`
	div.innerHTML = maxPlayersHTML
	return div
}

function addMaxPlayers(maxPlayers) {
	serverContainer = document.getElementById('rbx-running-games')
	maxPlayersDiv = createMaxPlayers(maxPlayers)
	serverContainer.insertBefore(maxPlayersDiv, serverContainer.childNodes[1])
	async function checkSettings() {
		if (await fetchSetting("serverSizeSort") == false) {
			document.getElementById('maxPlayerButton').style.display = "none"
		}
		if (await fetchSetting("fastestServersSort") == false) {
			document.getElementById('fastServersButton').style.display = "none"
		}
	}
	checkSettings()
	$("#maxPlayerButton").click(function(){
		$(this.parentNode).find("#maxPlayerDropdown").toggleClass("active")
	})
	$("#fastServersButton").click(async function(){
		document.getElementById('maxPlayersLoadingBar').style.display = "inline-block"
		document.getElementById('maxPlayersLoadingBar').style.marginRight = "310px"
		customServerList = await fetchLowPingServers(globalGameId, pageIndex, 1000)
		loadServerPage(globalGameId, 0)
	})
	$(".dropdown-custom-item").click(async function(){
		maxPlayerSelection = parseInt(this.id)
		$("#maxPlayerButton").find('.dropdown-button-text').html(this.innerHTML)
		$("#maxPlayerDropdown").toggleClass("active")
		gameID = window.location.href.split("games/")[1].split("/")[0]
		document.getElementById('maxPlayersLoadingBar').style.display = "inline-block"
		index = await fetchMaxPlayerIndex(gameID, maxPlayerSelection)
		if (index != "NONE") {
			customServerList = null
			loadServerPage(gameID, index)
		} else {
			$("#maxPlayerButton").find('.dropdown-button-text').html("Error: None Found")
		}
	})
}

async function liveCounters() {
	async function loadCounters() {
		universeId = document.getElementById('game-detail-meta-data').getAttribute('data-universe-id')
		votes = await fetchVotes(universeId)
		favoritesData = await fetchFavorites(universeId)
		votes = votes.data[0]
		upvotes = document.getElementById('vote-up-text')
		downvotes = document.getElementById('vote-down-text')
		favorites = document.getElementsByClassName('game-favorite-count')[0]
		if (upvotes != null) {
			upvotes.style.fontSize = "11px"
			upvotes.innerHTML = addCommas(votes.upVotes)
		}
		if (downvotes != null) {
			downvotes.style.fontSize = "11px"
			downvotes.innerHTML = addCommas(votes.downVotes)
		}
		if (favorites != null) {
			favorites.innerHTML = addCommas(favoritesData.favoritesCount)
		}
	}
	if (await fetchSetting("liveLikeDislikeFavoriteCounters")) {
		setTimeout(function() {
			loadCounters()
		}, 1000)
		setInterval(function() {
			loadCounters()
		}, 10000)
	}
}

var timerArray = [];

function animateValue(obj, start, end, duration) {
    if (start === end) return;
    var range = end - start;
    var current = start;
    var increment = end > start? Math.ceil(Math.abs(end-start)/500) : -1 * Math.ceil(Math.abs(end-start)/500);
    var stepTime = Math.abs(Math.floor(duration / (range/Math.abs(increment))));
    timer = setInterval(function() {
		if (start == currentVisits || start == currentPlayers) {
			current += increment;
			obj.innerHTML = addCommas(current);
			if ((increment >= 0 && current >= end) || (increment < 0 && current <= end)) {
				clearInterval(timer);
				obj.innerHTML = addCommas(end);
				obj.setAttribute("title", obj.innerHTML)
			}
		}
	}, stepTime);
	timerArray.push([obj, timer])
}

async function livePlaying() {
	liveVisits = await fetchSetting("liveVisits");
	livePlaying = await fetchSetting("livePlayers");
	if (liveVisits || livePlaying) {
		async function loadPlaying() {
			if (liveVisits || livePlaying) {
				universeId = document.getElementById('game-detail-meta-data').getAttribute('data-universe-id')
				gameInfo = await fetchGameInfo(universeId)
				playing = gameInfo.data[0].playing
				visits = gameInfo.data[0].visits
				playingObj = document.getElementsByClassName('game-stat')[0].getElementsByTagName('p')[1]
				visitsObj = document.getElementById('game-visit-count')
				oldPlaying = parseInt(playingObj.innerHTML.replace(",","").replace(",","").replace(",",""))
				oldVisits = parseInt(visitsObj.getAttribute('title').replace(",","").replace(",","").replace(",","").replace(",",""))
				if (livePlaying) {
					playingObj.innerHTML = addCommas(oldPlaying)
				}
				if (liveVisits) {
					visitsObj.innerHTML = addCommas(oldVisits)
				}
				if (livePlaying) {
					for (i = 0; i < timerArray.length; i++) {
						if (timerArray[i][0] == playingObj) {
							clearInterval(timerArray[i][1])
						}
					}
					animateValue(playingObj, oldPlaying, playing, 5000);
					currentPlayers = oldPlaying;
				}
				if (oldVisits <= visits && liveVisits) {
					for (i = 0; i < timerArray.length; i++) {
						if (timerArray[i][0] == visitsObj) {
							clearInterval(timerArray[i][1])
						}
					}
					timerArray = []
					animateValue(visitsObj, oldVisits, visits, 10000);
					currentVisits = oldVisits;
				}
			}
		}
		setTimeout(loadPlaying, 1000)
		setInterval(loadPlaying, 20000)
	}
}

async function addSearchBar(gameID) {
	serverContainer = document.getElementById('rbx-running-games')
	searchBar = document.createElement("div")
	searchBar.innerHTML = searchBarHTML
	serverContainer.insertBefore(searchBar, serverContainer.childNodes[1])
	searchServerButton = document.getElementById('searchServerButton')
	searchServerButton.addEventListener("click", async function() {
		username = document.getElementById("searchServer").value
		if (username.length > 2) {
			prevResults = document.getElementById('serverSearchResult')
			if (prevResults != null) {
				prevResults.remove()
			}
			document.getElementById("serverSearchError").innerHTML = '<span class="spinner spinner-default"></span>'
			document.getElementById("serverSearchSuccess").innerHTML = ""
			server = await fetchServerSearch(username, gameID)
			if (server == "Not Found!") {
				document.getElementById("serverSearchError").innerHTML = "User " + username + " not found in game. Please wait or try again."
			} else if (server == "User Does Not Exist!") {
				document.getElementById("serverSearchError").innerHTML = "User " + username + " doesn't exist!"
			} else { //Found the server
				document.getElementById("serverSearchError").innerHTML = ""
				document.getElementById("serverSearchSuccess").innerHTML = "Found " + username + "!"
				createServerElement(server)
			}
		}
	})
}


function stripTags(s) {
	if (typeof s == "undefined") {
		return s
	}
	return s.replace(/(<([^>]+)>)/gi, "").replace(/</g, "").replace(/>/g, "").replace(/'/g, "").replace(/"/g, "");
 }

async function addEmbeds(sectionContent, universeId) {
	socialLinks = await fetchSocialLinks(universeId)
	socialLinks = socialLinks.data
	console.log(socialLinks)
	for (i = 0; i < socialLinks.length; i++) {
		/* if (socialLinks[i].type == "Discord") {
			console.log(socialLinks[i])
			discordUrl = socialLinks[i].url
			discordID = await fetchDiscordID(discordUrl)
			console.log(discordID)
			if (isNormalInteger(discordID)) {
				div = document.createElement('div')
				discordFrameHTML = `<iframe src="https://discordapp.com/widget?id=${discordID}&amp;theme=dark" width="300" height="500" allowtransparency="true" frameborder="0" style="position:absolute;right:0px;top:710px;" sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"></iframe>`
				div.innerHTML = discordFrameHTML
				sectionContent.appendChild(div)
			}
		} else  */if (socialLinks[i].type == "Twitter" && await fetchSetting("gameTwitter")) {
			twitterUrl = socialLinks[i].url
			twitterProfile = stripTags(twitterUrl.split('twitter.com/')[1])
			div = document.createElement('div')
			twitterFrameHTML = `<iframe src="https://ropro.io/twitterFrame.php?account=${twitterProfile}" width="342" height="100%" allowtransparency="true" frameborder="0" style="position:absolute;right:-250x;top:10px;" sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"></iframe>`
			div.innerHTML = twitterFrameHTML
			sectionContent.appendChild(div)
		}
	}
}

async function addActiveServerCount(gameId) {
	servers = await fetchServerPage(gameId, 0)
	serverTab = document.getElementById('tab-game-instances').getElementsByTagName('span')
	if (serverTab.length > 0) {
		serverTab[0].innerText += ` (${addCommas(parseInt(servers.TotalCollectionSize))})`
	}
}

function formatTime(time) {
    suffix = " hr"
    if (time < 60) {
        suffix = " minute"
		if (time != 1) {
			suffix += "s"
		}
    } else {
		oldTime = time
        time = Math.floor(time / 60)
		if (time != 1) {
			suffix += "s"
		}
		if (time <= 99) {
			suffix += " " + (oldTime - (time * 60)) + " min"
			if ((oldTime - (time * 60)) != 1) {
				suffix += "s"
			}
		}
    }
    return time + suffix
}

function getDaysSince(date) {
    now = new Date().getTime()
    return Math.floor(Math.abs((date - now) / (24 * 60 * 60 * 1000)))
}

async function getTimePlayed(gameId, timePeriod) {
	playTime = await fetchPlayTime(gameId, timePeriod)
	if (playTime.length > 0) {
		time = playTime[0].time_played
	} else {
		time = 0
	}
	timePlayedCache = await getLocalStorage("timePlayed")
	if (typeof timePlayedCache == "undefined") {
        timePlayedCache = {}
    }
	if (gameId in timePlayedCache && getDaysSince(timePlayedCache[gameId][1]) <= timePeriod) {
		time += timePlayedCache[gameId][0]
	}
	return time
}

function createUpgradeModal() {
    modalDiv = document.createElement('div')
    modalDiv.setAttribute('id', 'standardUpgradeModal')
    modalDiv.setAttribute('class', 'upgrade-modal')
	modalDiv.style.zIndex = 100000
    modalHTML = `<div id="standardUpgradeModal" style="z-index:10000;display:block;" class="upgrade-modal"><div style="background-color:#232527;position:absolute;width:500px;height:500px;left:-webkit-calc(50% - 250px);top:-webkit-calc(50% - 250px);" class="modal-content upgrade-modal-content">
    <span style="margin-top:5px;margin-right:5px;font-size:40px;" class="upgrade-modal-close">×</span>
    <div style="padding-bottom:5px;border-bottom: 3px solid #FFFFFF;font-family:Gotham;color:white;font-size:30px;position:absolute;top:20px;left:40px;"><img style="width:70px;left:0px;" src="https://ropro.io/images/standard_icon.png"> Standard Tier Feature</div><div style="font-family:HCo Gotham SSm;color:white;font-size:20px;position:absolute;top:115px;left:200px;width:270px;">Sorting your playtime by Month, Year, and All Time is only available for<br><b><img style="width:20px;margin-top:-3px;margin-right:3px;" src="https://ropro.io/images/standard_icon.png">RoPro Standard Tier+</b><br>subscribers.</div><div style="font-family:Gotham;color:white;font-size:18px;position:absolute;top:270px;left:200px;width:270px;"><u>More Subscription Benefits:</u>
    <ul style="margin-left:20px;font-size:12px;font-family:HCo Gotham SSm;">
    <li style="list-style-type:circle;">Fastest Server &amp; Server Size Sort</li>
    <li style="list-style-type:circle;">More Game Filters &amp; Like Ratio Filter</li><li style="list-style-type:circle;">Trade Value &amp; Demand Calculator</li><li style="list-style-type:circle;">Save Sandbox Outfits &amp; Use Bundles</li><li style="list-style-type:circle;">And many more! Find a full list <a style="text-decoration:underline;cursor:pointer;" href="https://ropro.io#standard" target="_blank">here</a>.</li></ul>
    </div><video width="70%" height="100%" style="pointer-events: none;position:absolute;top:10px;left:-70px;transform:scale(2);" src="" autoplay="" loop="" muted=""></video>
    <a href="https://ropro.io#standard" target="_blank"><button type="button" style="font-family:HCo Gotham SSm;position:absolute;left:25px;top:440px;width:450px;" class="btn-growth-sm PurchaseButton">Upgrade</button></a>
    </div></div>`
    modalDiv.innerHTML += modalHTML
    body = document.getElementsByTagName('body')[0]
    body.insertBefore(modalDiv, body.childNodes[0])
    $('.upgrade-modal-close').click(function(){
        document.getElementById('standardUpgradeModal').remove()
    })
}

function upgradeModal() {
    createUpgradeModal()
    document.getElementById('standardUpgradeModal').getElementsByTagName('video')[0].src = `https://ropro.io/dances/dance${(Math.floor(Math.random() * 18) + 1)}.webm`
    document.getElementById('standardUpgradeModal').style.display = "block"
}

async function updatePlayTime(gameId, timePeriod) {
	document.getElementById("playTimeText").innerHTML = '<span id="mostPlayedLoadingBar" style="position:absolute; top:-5px;left:40px; display: inline-block; transform: scale(0.5); width: 100px; height: 25px; visibility: initial !important;margin-right:50px;margin-top:0px;" class="spinner spinner-default"></span>'
	time = await getTimePlayed(gameId, timePeriod)
	document.getElementById("playTimeText").title = `${parseInt(time)} minutes`
	document.getElementById("playTimeText").innerText = formatTime(parseInt(time))
}

async function addPlayTime(gameId) {
	playTimeHTML = `<div style="margin-top:5px;font-size:12px;position:relative;" class="text-label">Played <img style="background-image:none;margin:0px;margin-top:-2px;margin-bottom:0px;transform:scale(1);border:none;margin-left:0px;margin-right:1px;width:15px;height:15px;" src="https://ropro.io/images/timer${theme == "dark" ? "_white" : "icon_light"}.png" class="info-label icon-pastname">
	<a href="#!/game-instances" style="font-size:13px;display:inline-block;" id="playTimeText" class="text-name" title=""><span id="mostPlayedLoadingBar" style="position:absolute; top:-5px;left:40px; display: inline-block; transform: scale(0.5); width: 100px; height: 25px; visibility: initial !important;margin-right:50px;margin-top:0px;" class="spinner spinner-default"></span></a><div id="timeDropdown" style="overflow:visible;margin-top:-10px;margin-left:0px;float:right;width:150px;transform:scale(0.8);margin-right:-37px;z-index:10;margin-bottom:0px;" class="input-group-btn group-dropdown">
	<button style="border:none;" type="button" class="input-dropdown-btn" data-toggle="dropdown" aria-expanded="false"> 
	<span style="float:right;" class="icon-down-16x16"></span><span id="timeLabel" class="rbx-selection-label ng-binding" ng-bind="layout.selectedTab.label" style="font-size:14px;float:right;margin-right:5px;">Past Week</span> 
	</button>
	<ul style="max-height:1000px;width:100px;margin-left:35px;" id="timeOptions" data-toggle="dropdown-menu" class="dropdown-menu" role="menu"> 
	<li>
	<a time="pastWeek" class="timeChoice">
		<span ng-bind="tab.label" class="ng-binding" style="font-size:14px;">Past Week</span>
	</a></li><li>
	<a time="pastMonth" class="timeChoice">
		<span style="font-size:14px;" ng-bind="tab.label" class="ng-binding">Past Month</span>
	</a></li><li>
	<a time="pastYear" class="timeChoice">
		<span style="font-size:14px;" ng-bind="tab.label" class="ng-binding">Past Year</span>
	</a></li><li>
	<a time="allTime" class="timeChoice">
		<span style="font-size:14px;" ng-bind="tab.label" class="ng-binding">All Time</span>
	</a></li></ul></div></div>`
	div = document.createElement('div')
	div.innerHTML = playTimeHTML
	titleContainer = document.getElementsByClassName('game-title-container')
	if (titleContainer.length > 0) {
		titleContainer[0].appendChild(div)
	}
	updatePlayTime(gameId, 7)
	var morePlaytimeSorts = await fetchSetting("morePlaytimeSorts")
	$('.timeChoice').click(function(){
		time = this.getAttribute("time")
		if (time == "pastWeek") {
			document.getElementById('timeLabel').innerText = "Past Week"
			updatePlayTime(gameId, 7)
		} else if (time == "pastMonth") {
			if (morePlaytimeSorts) {
				document.getElementById('timeLabel').innerText = "Past Month"
				updatePlayTime(gameId, 30)
			} else {
				upgradeModal()
			}
		} else if (time == "pastYear") {
			if (morePlaytimeSorts) {
				document.getElementById('timeLabel').innerText = "Past Year"
				updatePlayTime(gameId, 365)
			} else {
				upgradeModal()
			}
		} else if (time == "allTime") {
			if (morePlaytimeSorts) {
				document.getElementById('timeLabel').innerText = "All Time"
				updatePlayTime(gameId, 365)
			} else {
				upgradeModal()
			}
		}
	})
}

function isNormalInteger(str) {
    return /^\+?(0|[1-9]\d*)$/.test(str);
}

async function checkGamePage() {
	gameSplit = window.location.href.split("games/")[1]
	if (typeof gameSplit != 'undefined') {
		globalGameId = gameSplit.split("/")[0]
		if (isNormalInteger(globalGameId)) { // Valid Game Page
			universeId = document.getElementById('game-detail-meta-data').getAttribute('data-universe-id')
			addEmbeds(document.getElementById('game-detail-page'), universeId)
			gameInfo = await fetchGameInfo(universeId)
			addMaxPlayers(gameInfo.data[0].maxPlayers)
			//addSearchBar(gameId)
			if (await fetchSetting("liveLikeDislikeFavoriteCounters")) {
				liveCounters()
			}
			livePlaying()
			if (await fetchSetting("activeServerCount")) {
				addActiveServerCount(globalGameId)
			}
			if (await fetchSetting("playtimeTracking")) {
				addPlayTime(globalGameId)
			}
		}
	}
}
checkGamePage()