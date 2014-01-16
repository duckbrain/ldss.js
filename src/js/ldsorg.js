// This is a Chrome content script. It is not run with the permissions
// of the extension. To do anything, it must tell the background page to
// do it.
// This page will insert an extra item to the tools on the Chruch
// website's scriptures. This item will take you directly to that
// scripture in the app. A similar button will take you from the app's
// hiding toolbar to the chruch web site. This will allow tight
// integration with the Church website scriptures.
if (location.href.indexOf('lds.org/scriptures') != -1 && location.href.indexOf('lds.org/scriptures/study-helps') == -1)
{
	function getAppLocation(search)
	// Finds the appropriate link to take the user to the app.
	{
		return 'chrome-extension://' + chrome.i18n.getMessage('@@extension_id') + '/ref.html?s=' + search;
	}

	//The unordered list that all the tools are in.
	var tools, icon = false;
	tools = document.getElementsByClassName('tools')[0];
	if (tools == undefined)
		tools = document.getElementById('feature1-1').getElementsByTagName('ul')[0];
	else icon = true;
	var listItem = document.createElement('li');
	var anchor = document.createElement('a');
	if (icon)
	{
		anchor.classList.add('applink');
		anchor.href = getAppLocation(document.title);
	}
	else
		anchor.href = getAppLocation('library');
	anchor.innerText = 'LDS Scriptures App';

	listItem.appendChild(anchor);
	tools.appendChild(listItem);
}
