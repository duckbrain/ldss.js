// This script will read a URL parameter from the gup function defined
// by bookmark.js and will send a message to the background page to
// load the scripture found in the search string. It will then load
// the response into a new div and add it to the DOM. It also loads
// the navigation links from the pages and make a link to the current
// scripture on lds.org
search = decodeURI(gup("s"));

function read()
{
	var request = {
		request: "scripture content",
		s: search
		};
	chrome.runtime.sendMessage(request);
	chrome.runtime.onMessage.addListener(function(response)
	{
		if (response.request != "scripture content response")
			return;
		
		response = response.info;	
		
		var content = document.createElement('div');
		content.className = response.classes;
		content.innerHTML = response.content;
		document.body.appendChild(content);
		
		//Set the title
		if (response.refrence.file != undefined || response.refrence.search != undefined)
		document.title = content.getElementsByTagName('h1')[0].innerText;
		
		if (response.up)
			document.getElementById('uplink').href = response.up;
		if (response.back)
			document.getElementById('backlink').href = response.back;
		if (response.next)
			document.getElementById('nextlink').href = response.next;
			
		document.getElementById('ldsorglink').href = response.ldsorg;
	});
}

function addLinkToBreadCrumbs(search, contents)
{
	var e = document.createElement('a');
	if (search != undefined)
		e.href = bkmkfxurl("ref.html?s=" + search);
	e.innerHTML = contents;
	document.getElementById("breadcrumbs").appendChild(e);
}
