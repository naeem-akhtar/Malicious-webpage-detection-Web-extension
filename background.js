var bkg = chrome.extension.getBackgroundPage();
// state determines the status of webpage after analysis
// 0 -> safe,		1/2 -> malicious. 	-1 -> not determined / error

// get currrent state of webpage from server by sending webpage link
var getCurrentPageState = (tab_link="", current_page=true) => {
	if(current_page) {
		tab_link = window.location.href;	// current webpage link
	}

	api_link = 'http://127.0.0.1:5000/predict';

	const options = {
		method: 'POST',
		body: JSON.stringify({url : tab_link}),
		headers : {
			'Content-Type': 'application/json'
		}
	}

	return fetch(api_link, options)
	.then(res => res.json())
	.then(data => {
		return data.state;
	})
	.catch(err => {
    bkg.console.log('Cannot get response from server.');
    return -1;
	});

}


// Check state before openinng or refreshing any page.
chrome.webNavigation.onBeforeNavigate.addListener(function() {
	getCurrentPageState()
	.then(state => {
		// bkg.console.log('BKG state : ' + state);
	})
	.catch(err => {
		console.log('Server Not Responding.');
	});
});
