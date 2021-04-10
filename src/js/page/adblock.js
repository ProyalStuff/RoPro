

console.log('loading adblock i guess')






function fetchSetting(setting) {
	return new Promise(resolve => {
		chrome.runtime.sendMessage({greeting: "GetSetting", setting: setting}, 
			function(data) {
				resolve(data)
			}
		)
	})
}




async function adBlock() {
	if (await fetchSetting('adblock')) {
		var elements = document.getElementsByClassName("abp");
		console.log(elements)
		while(elements.length > 0){
			elements[0].parentNode.removeChild(elements[0]);
		}
	}
}

async function adBlock2() {
	if (await fetchSetting('adblock')) {
		var elements = document.getElementsByClassName("profile-ad");
		console.log(elements)
		while(elements.length > 0){
			elements[0].parentNode.removeChild(elements[0]);
		}
	}
}







adBlock()

adBlock2()


// Live follow count testing!


function Commas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}


function getIdFromURL(url) {
	return parseInt(url.split("users/")[1].split("/profile")[0])
}

console.log(getIdFromURL(location.href))


function fetchFollowers(userID) {
	return new Promise(resolve => {
		chrome.runtime.sendMessage({greeting: "GetURL", url:"https://friends.roblox.com/v1/users/" + userID + "/followers/count"}, 
			function(data) {
				resolve(data)
				console.log(data)
				console.log(data.count)
				console.log(Commas(data.count))
			}
		)
	})
}


async function liveFollowers() {
	if (location.href.includes("/profile")) {
		if (await fetchSetting('adblock')) {
			var userID = getIdFromURL(location.href)
			fetchFollowers(userID)
		}
	}
}

liveFollowers()


