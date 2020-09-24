var bkg = chrome.extension.getBackgroundPage();
// state determines the status of webpage after analysis
// 0 -> safe,		1/2 -> malicious. 	-1 -> not determined / error

api_link = 'https://malicious-urls-detection.herokuapp.com';
predict_action_PATH = '/predict'

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

// PS : This was returning undefined
// var getCurrentPageState =  () => {
// 	return chrome.tabs.query({
// 	  active: true,
// 	  currentWindow: true
// 		}, (tabs) => {
// 		  var url = tabs[0].url;
// 		  return getPageState(url);
// 	});
// }


var actionOnUnsafeURL = (url = "") => {
	// window.alert("This Webpage might be malicious. If you don't trust this website leave.");
	notification_name = "malicious_url_alert";
	notification_OPTIONS = {
    type: 'basic',
    iconUrl: 'https://kasikornbank.com/en/personal/Digital-banking/KBankCyberRisk/Pages/img/phishing/Kbank_icon_2-07.png',
    title: "Malicious URL detected",
    message: "This Webpage might be malicious. If you don't trust this website leave.\nURL : " + url
  };
	chrome.notifications.create(notification_name, notification_OPTIONS, () => {

	});
}


// DICTIONARY for all tabs
// var tabsDICT = {};

// Check state before openinng or refreshing any web page.
chrome.webNavigation.onBeforeNavigate.addListener(function() {
	QUERY_OPTIONS = {
	  // active: true,
	  currentWindow: true
	}

	chrome.tabs.query(QUERY_OPTIONS, (tabs) => {
	  // var url = tabs[0].url;	// current page url from chrome api.
	  // bkg.console.log(tabs);

	  tabs.forEach( (tab) => {
		  getPageState(tab.url)
		  .then(state => {
				bkg.console.log(tab.url, 'BKG state : ' + state);
				// Notify user about any unsafe url
				if(state != 0 && state != -1) {
					actionOnUnsafeURL(tab.url);
				}
			})
			.catch(err => {
				bkg.console.log('Server Not Responding.' + err);
			});
		});

	});
});
