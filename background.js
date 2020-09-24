var bkg = chrome.extension.getBackgroundPage();

const api_link = 'https://malicious-urls-detection.herokuapp.com';
const predict_action_PATH = '/predict'

// MAP for all known tabs url with state from server
var tabs_url_state = new Map();

var addTabsUrlState = (url, state) => {
	tabs_url_state.set(url, state);
}

// use var for global scope
var clearTabsUrlState = () => {
	tabs_url_state.clear();
}


// get currrent state of webpage from server by sending webpage link
var getPageState = (page_link="") => {
	const options = {
		method: 'POST',
		body: JSON.stringify({url : page_link}),
		headers : {
			'Content-Type': 'application/json'
		}
	}

	return fetch(api_link + predict_action_PATH, options)
	.then(res => res.json())
	.then(data => {
		return data.state;
	})
	.catch(err => {
    bkg.console.log('Cannot get response from server.');
    return -1;
	});

}

let actionOnUnsafeURL = (url = "") => {
	// window.alert("This Webpage might be malicious. If you don't trust this website leave.");
	const notification_name = "malicious_url_alert";
	const notification_OPTIONS = {
    type: 'basic',
    iconUrl: 'images/logo_red_48.png',
    title: "Malicious URL detected",
    message: "This Webpage might be malicious. If you don't trust this website leave.\nURL : " + url
  };
	chrome.notifications.create(notification_name, notification_OPTIONS);
}

// change extesnion icon on a particular tab
var setExtensionIcon = (iconPath, currentTabID) => {
	chrome.browserAction.setIcon({
    path : iconPath,
    tabId : currentTabID
  });
}

// Any new tab is opened or reload.
chrome.webNavigation.onBeforeNavigate.addListener(function() {
	const QUERY_OPTIONS = {
	  currentWindow: true
	}

	// check state of any new url
	chrome.tabs.query(QUERY_OPTIONS, (tabs) => {
	  // iterate all active tabs urls
	  tabs.forEach( (tab) => {
	  	if(!tabs_url_state.has(tab.url)) {	// new url found
			  getPageState(tab.url)
			  .then(state => {
					bkg.console.log(tab.url, 'BKG state : ' + state);
					addTabsUrlState(tab.url, state);	// add new url and state to Map
					if(state != 0 && state != -1) {  // Notify user about any unsafe url
						actionOnUnsafeURL(tab.url);
					}
				})
				.catch(err => {
					bkg.console.log('Server Not Responding.' + err);
				});
			}
		});
	});

});
