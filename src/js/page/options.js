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

function shallowEqual(object1, object2) {
	const keys1 = Object.keys(object1);
	const keys2 = Object.keys(object2);

	if (keys1.length !== keys2.length) {
		return false;
	}

	for (let key of keys1) {
		if (object1[key] !== object2[key]) {
		return false;
		}
	}

	return true;
}


var blockedAttributes = [
	"developer_logs"
];

$('.menu .item').tab();





$('.featurePreview').click(function(){
	checker = blockedAttributes.includes(this.getAttribute("modal"))
	if (checker == true) {
		console.log('image no')
		prefix = this.getAttribute("modal")
		modal = "." + prefix + "_modal"
		$(modal).modal('show')

	}
	else {
		prefix = this.getAttribute("modal")
		modal = "." + prefix + "_modal"
		document.getElementsByClassName(prefix + "_modal")[0].getElementsByTagName('img')[0].setAttribute("src", "https://ropro.io/feature_previews/" + this.getAttribute("modal") + ".gif")
		$(modal).modal('show')
	}
})

var settings = {}

function fetchSetting(setting) {
	return new Promise(resolve => {
		chrome.runtime.sendMessage({greeting: "GetSetting", setting: setting}, 
			function(data) {
				console.log('sending data for setting fetch')
				console.log(data)
				resolve(data)
			}
		)
	})
}

function fetchSettingValidity(setting) {
	return new Promise(resolve => {
		chrome.runtime.sendMessage({greeting: "GetSettingValidity", setting: setting}, 
			function(data) {
				resolve(data)
				console.log(data)
			}
		)
	})
}

function fetchFreeTrialTime() {
	return new Promise(resolve => {
		async function doGet(resolve) {
			$.post("https://ropro.io/api/freeTrialInfo.php", function(data){
				resolve(data);
			})
		}
		doGet(resolve)
	})
}

function syncSettings(setting) {
	return new Promise(resolve => {
		chrome.runtime.sendMessage({greeting: "SyncSettings"}, 
			function(data) {
				resolve(data);
			}
		)
	})
}

function setStorage(key, value) {
	return new Promise(resolve => {
		chrome.storage.sync.set({[key]: value}, function(){
			resolve()
		})
	})
}

function getSubscription(userID) {
	$.getJSON('https://www.roblox.com/mobileapi/userinfo', function(data) {
        
        UserID = data['UserID']
		console.log(UserID)
		return new Promise(resolve => {
			async function doGet(resolve) {
				$.get("https://raw.githubusercontent.com/ProyalStuff/Roblox-Addon/main/users/" + UserID, function(data){
					console.log(data)
					resolve(data['subscription']);
				})
			}
			doGet(resolve)
		})
	})
}

function getStorage(key) {
	return new Promise(resolve => {
		chrome.storage.sync.get(key, function (obj) {
			resolve(obj[key])
		})
	}
	)
}


$('.ui.fitted.toggle.checked.checkbox').click(function(){
	this.classList.toggle('checked')
})

document.getElementById('saveDiscord').addEventListener('click', async function(){
	userID = await getStorage('rpUserID')
	$.post('https://ropro.io/api/saveDiscord.php', {userid: userID, discord: document.getElementById('discordValue').value})
})



function check(setting) {
	console.log(setting)
	return document.getElementById(setting).classList.contains('checked')
}

function getSettings() {
	newSettings = {
		"sandbox": check("sandbox"),
		"profileThemes": check("profileThemes"),
		"genreFilters": check("genreFilters"),
		"randomGame": check("randomGame"),
		"reputation": check("reputation"),
		"linkedDiscord": check("linkedDiscord"),
		"gameTwitter": check("gameTwitter"),
		"profileValue": check("profileValue"),
		"tradeOffersPage": check("tradeOffersPage"),
		"tradeOffersSection": check("tradeOffersSection"),
		"comments": check("comments"),
		"projectedWarningItemPage": check("projectedWarningItemPage"),
		"quickTradeResellers": check("quickTradeResellers"),
		"hideSerials": check("hideSerials"),
		"groupRank": check("groupRank"),
		"groupTwitter": check("groupTwitter"),
		"groupDiscord": check("groupDiscord"),
		"serverSizeSort": check("serverSizeSort"),
		"fastestServersSort": check("fastestServersSort"),
		"moreGameFilters": check("moreGameFilters"),
		"gameLikeRatioFilter": check("gameLikeRatioFilter"),
		"quickUserSearch": check("quickUserSearch"),
		"liveLikeDislikeFavoriteCounters": check("liveLikeDislikeFavoriteCounters"),
		"sandboxOutfits": check("sandboxOutfits"),
		"tradeValueCalculator": check("tradeValueCalculator"),
		"tradeDemandRatingCalculator": check("tradeDemandRatingCalculator"),
		"tradeItemValue": check("tradeItemValue"),
		"tradeItemDemand": check("tradeItemDemand"),
		"itemPageValueDemand": check("itemPageValueDemand"),
		"tradePageProjectedWarning": check("tradePageProjectedWarning"),
		"embeddedRolimonsItemLink": check("embeddedRolimonsItemLink"),
		"embeddedRolimonsUserLink": check("embeddedRolimonsUserLink"),
		"tradeOffersValueCalculator": check("tradeOffersValueCalculator"),
		"tradeProtection": check("tradeProtection"),
		"liveVisits": check("liveVisits"),
		"livePlayers": check("livePlayers"),
		"autoDecline": check("autoDecline"),
		"declineThreshold": parseInt(document.getElementById('declineThreshold').value),
		"cancelThreshold": parseInt(document.getElementById('cancelThreshold').value),
		"roproIcon": check("roproIcon"),
		"hideDeclinedNotifications": check("hideDeclinedNotifications"),
		"hideOutboundNotifications": check("hideOutboundNotifications"),
		"quickDecline": check("quickDecline"),
		"quickCancel": check("quickCancel"),
		"hideTradeBots": check("hideTradeBots"),
		"autoDeclineTradeBots": check("autoDeclineTradeBots"),
		"tradeBotDefender": check("tradeBotDefender"),
		"underOverRAP": check("underOverRAP"),
		"mostPlayedGames": check("mostPlayedGames"),
		"playtimeTracking": check("playtimeTracking"),
		"activeServerCount": check("activeServerCount"),
		"morePlaytimeSorts": check("morePlaytimeSorts"),
		"roSearcher": check("roSearcher"),
		"adblock": check("adblock"),
		"profileTier": check("profileTier")
	}
	changed = typeof settings == 'undefined' || !shallowEqual(settings, newSettings)
	if (changed) {
		console.log(newSettings)
		settings = newSettings
		setStorage("PESettings", settings)
	}
}

document.getElementById('saveSearcherColor').addEventListener('click', async function(){
	console.log('saving')
	setStorage("PESearcherColor", document.getElementById('roSearcherColor').value)
})





window.onblur = function(){
	if (doneLoading) {
		getSettings()
	}
}

var doneLoading = false
async function main() {
	restrict = await getStorage("restrictSettings")
	if (restrict == true) {
		document.getElementById('discordButton').style.display = "none";
		document.getElementById('supportButton').style.width = "204px";
		document.getElementById('discordInput').classList.add("disabled");
		restrictedElements = document.getElementsByClassName("restricted")
		for (i = 0; i < restrictedElements.length; i++) {
			restrictedElement = restrictedElements[i]
			restrictedElement.style.display = "none";
		}
	}
	await syncSettings()
	settings = await getStorage("PESettings")
	console.log('this far 1')
	for(let setting of Object.keys(settings)) {
		console.log('this far 2')
		settingElement = document.getElementById(setting)
		if (settingElement != null) {
			console.log('this far 3')
			if (settingElement.tagName == "DIV") {
				console.log('this far 4')
				if (await fetchSettingValidity(setting)) {
					console.log('this far 5')
					if (await fetchSetting(setting)) {
						console.log('this far 6')
						if (!settingElement.classList.contains("checked")) {
							settingElement.classList.add("checked")
						}
						if (!settingElement.getElementsByTagName('input')[0].hasAttribute('checked')) {
							settingElement.getElementsByTagName('input')[0].setAttribute('checked', true)
						}
					} else {
						if (settingElement.classList.contains("checked")) {
							settingElement.classList.remove("checked")
						}
						if (settingElement.getElementsByTagName('input')[0].hasAttribute('checked')) {
							settingElement.getElementsByTagName('input')[0].removeAttribute('checked')
						}
					}
				} else {
					settingElement.classList.add("disabled")
					settingElement.style.pointerEvents = "none"
					settingElement.getElementsByTagName("input")[0].removeAttribute("checked")
				}
			} else if (settingElement.tagName == "SELECT") {
				settingElement.value = await (setting)
				if (!await fetchSettingValidity(setting)) {
					settingElement.classList.add("disabled")
					settingElement.style.pointerEvents = "none"
				}
			} else {
				if (await fetchSetting(setting) > 0) {
					settingElement.value = await fetchSetting(setting)
				}
				if (!await fetchSettingValidity(setting)) {
					settingElement.parentNode.classList.add("disabled")
					settingElement.style.pointerEvents = "none"
				}
			}
		}
	}
	doneLoading = true
	setInterval(getSettings, 2000)
	console.log('hereee')
	$.getJSON('https://www.roblox.com/mobileapi/userinfo', function(data) {
		console.log('options yeah yeah')
        userID = data['UserID']
		console.log(userID)
		username = data['UserName']
		document.getElementById("subscriptionIcon").src = "./images/standard_icon.png"
		document.getElementById("subscriptionTier").innerHTML = "Standard"
		document.getElementById('userIcon').setAttribute('src', 'https://www.roblox.com/headshot-thumbnail/image?userId=' + userID + '&width=420&height=420&format=png')
		document.getElementById('usernameText').innerHTML = username
		console.log('options still yeah yeah')
		$.getJSON("https://raw.githubusercontent.com/ProyalStuff/Roblox-Addon/main/users/" + userID, function(data){
			console.log('hiiii')
			if (typeof data == "undefined") {
				subscription = "free_tier"
			}
			else {
				console.log(data)
				subscription = data['subscription']
				console.log(subscription)
				console.log(data['subscription'])
			}

			if (subscription == "free_tier" || subscription == "") {
				console.log('free yess')
				document.getElementById("subscriptionIcon").src = "./images/standard_icon.png"
				document.getElementById("subscriptionTier").innerHTML = "Standard"
			} else if (subscription == "donator_tier") {
				console.log('dono yess')
				document.getElementById("subscriptionIcon").src = "./images/donator_icon.png"
				document.getElementById("subscriptionTier").innerHTML = "Donator"
			} else if (subscription == "staff_tier") {
				console.log('staff yess')
				document.getElementById("subscriptionIcon").src = "./images/staff_icon.png"
				document.getElementById("subscriptionTier").innerHTML = "Staff"
			} else if (subscription == "ultra_tier") {
				console.log('ultra yess')
				document.getElementById("subscriptionIcon").src = "./images/staff.png"
				document.getElementById("subscriptionTier").innerHTML = "Staff"
			} else {
				console.log('else yess')
				document.getElementById("subscriptionIcon").src = "./images/standard_icon.png"
				document.getElementById("subscriptionTier").innerHTML = "Standard"
			}
			if (typeof userID == 'undefined') {
				conmsole.log('not logged in?')
				userID = -1
				username = "Not logged in"
			}
			console.log(username)
			console.log(userID)
		})
	})
}
main()

function internationalize() {
	document.getElementById('settingsText').innerText = chrome.i18n.getMessage("settings");
	document.getElementById('disclaimer1').innerText = "We are in no way affiliated with Roblox or RoPro";
	document.getElementById('disclaimer2').innerText = "Read more at...";
	$('.generalFeatures').text(chrome.i18n.getMessage("generalFeatures"));
	$('.tradingFeatures').text(chrome.i18n.getMessage("tradingFeatures"));
	$('.groupFeatures').text(chrome.i18n.getMessage("groupFeatures"));
	$('.accountSecurityFeatures').text(chrome.i18n.getMessage("accountSecurityFeatures"));
	$('.dealsNotifier').text(chrome.i18n.getMessage("dealsNotifier"));
}

window.addEventListener('load', internationalize);