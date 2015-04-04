// This is a Chrome content script. It is not run with the permissions
// of the extension. To do anything, it must tell the background page to
// do it.
// This page will insert an extra item to the tools on the Chruch
// website's scriptures. This item will take you directly to that
// scripture in the app. A similar button will take you from the app's
// hiding toolbar to the chruch web site. This will allow tight
// integration with the Church website scriptures.

(function() {
	console.log("LDS Scriptures Content Script Started");
	
	var href = chrome.extension.getURL("index.html") + "?" + location.pathname;
	var image = chrome.extension.getURL("img/icon_16.png");
	var tools = document.getElementById('secondary')
	if (tools == null) return;
	tools = tools.getElementsByClassName('tools')[0];
	if (tools == null) return;
	var newItem = document.createElement('li');
	var newLink = document.createElement('a');
	newLink.innerText = "LDS Scriptures";
	newLink.classList.add('hide-footnotes');
	newLink.classList.add('chrome-app-icon');
	newLink.href = href;
	newLink.onclick = function() {
		alert("Due to Chrome's security features, you wil need to drag this link to the address bar to navigate to it. This will be fixed in a future update.")
		return false;
	}
	newItem.appendChild(newLink);
	tools.appendChild(newItem);
})();
