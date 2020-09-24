var bkg = chrome.extension.getBackgroundPage();


var UpdatePopup = (state_text="loading..", state_color="grey", currentTabID=null) => {
	let state_id = "#state";
	let reload_icon = "(&#x21bb;)";
	let state_html_content = " <button type='button' id='recheck_button' name='recheck_button'>" + reload_icon + "</button>";

	$(state_id).css('color', state_color);
	$(state_id).text(state_text);
	$(state_id).append(state_html_content);

	if(currentTabID) {
		let iconPath = 'images/logo_green_48.png'
		if(state_color == 'red') {
			iconPath = 'images/logo_red_48.png'
		}
		bkg.setExtensionIcon(iconPath, currentTabID);
	}

}


var UpdatePopupByState = () => {
	UpdatePopup();

	QUERY_OPTIONS = {
	  active: true,
	  currentWindow: true
	}

	// get current active tab url and check state.
	chrome.tabs.query(QUERY_OPTIONS, (tabs) => {
		bkg.getPageState(tabs[0].url)
		.then(state => {
			// safe
			if(state == 0) {
				UpdatePopup('Safe', 'green', tabs[0].id);
			}
			// server didn't responded
			else if(state == -1) {
				UpdatePopup("Can't say", "yellow", tabs[0].id);
			}
			// Malicious
			else {
				UpdatePopup("Malicious", "red", tabs[0].id);
			}
		})
		.catch(err => {
			// Default Popup
			UpdatePopup();
			bkg.console.log('Server Not Responding.' + err);
		});
	});

}


var testLinkState = (div_id = "#test_link_box") => {
	prefix_html_tag = "<p id='test_link_result' style='color:"
	suffix_html_tag = "</p>"

	$("#test_link_result").remove();	// remove previos result from test link checking.
	test_link = $("#test_link").val();

	bkg.getPageState(test_link)
	.then(state => {
		// safe
		if(state == 0) {
			$(div_id).append(prefix_html_tag + "green'> This url is safe." + suffix_html_tag);
		}
		// server didn't responded
		else if(state == -1) {
			$(div_id).append(prefix_html_tag + "yellow'> This url cannot br checked." + suffix_html_tag);
		}
		// Malicious
		else {
			$(div_id).append(prefix_html_tag + "red'> This url is Malicious." + suffix_html_tag);
		}

	})
	.catch(err => {
		// Default
		bkg.console.log('Server Not Responding.');
	});
}


$(document).ready(function(){
	// Update popup window according to state of webpage
  UpdatePopupByState();

  let reload_button = "#recheck_button";
  // reload current page state
  $("#state").on('click', reload_button, () => {
  	UpdatePopupByState();
  });

  let test_button = "#test_button";
  // check a link from popup
  $(test_button).click(function() {
  	testLinkState();
  });

  let refresh_button = "#refresh_button";
  // refresh button clicked
  $(refresh_button).click( () => {
  	bkg.clearTabsUrlState();
  });

});
