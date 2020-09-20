var bkg = chrome.extension.getBackgroundPage();

var UpdatePopup = (state_text="loading..", state_color="grey") => {
	var state_id = "#state";

	$(state_id).text(state_text);
	$(state_id).css('color', state_color);
}


var UpdatePopupByState = () => {
	bkg.getCurrentPageState()
	.then(state => {
		// bkg.console.log('POP state : ' + state);

		// safe
		if(state == 0) {
			UpdatePopup('Safe', 'green');
		}
		// server didn't responded
		else if(state == -1) {
			UpdatePopup("Can't say", "yellow");
		}
		// Malicious
		else {

		}

	})
	.catch(err => {
		// Default Popup
		UpdatePopup();
		bkg.console.log('Server Not Responding.');
	});
}


var testLinkState = (div_id = "#test_link_box") => {
	prefix_html_tag = "<p id='test_link_result' style='color:"
	$("#test_link_result").remove();	// remove previos result from test link checking.
	test_link = $("#test_link").val();
	bkg.console.log(test_link);

	bkg.getCurrentPageState(test_link)
	.then(state => {
		// safe
		if(state == 0) {
			$(div_id).append(prefix_html_tag + "green'> This url is safe.</p>");
		}
		// server didn't responded
		else if(state == -1) {
			$(div_id).append(prefix_html_tag + "yellow'> This url cannot br checked.</p>");
		}
		// Malicious
		else {
			$(div_id).append("red'> This url is Malicious.</p>");
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

  // check a link from popup
  $("#test_button").click(function() {
  	testLinkState();
  })
});

