// This script will wait for the doucment to load and then find all
// elements that need to be localized and replace the innerHTML with
// the proper string from messages.json for that location.
//
// Localization allows us to add a folder with a copy of all the
// nessassay files and translate them to have an alternate language for
// the whole app. It is a pain to implement, but will be well worth it
// when the time comes that we can find a copy of the Scriptures in
// another language.
//
// It will also provide a way to access files that are localized,
// besides messages.json. Paths are returned from the root of the app,
// so you may need to use add ../ to the front to exit directories.
// (Optionally you can pass a second parameter to supply the number of
// directories to exit.)
//
// Elements must be spans and they must have a the data-i18n attribute
// set the the message name to have the message localized. They may also
// contain a default content in case the page is viewed outside the app.
//
// The script will also translate anchors/links (<a> tags) with a
// data-i18n attribute set and will set that to the anchor's title, so
// when the user's mouse is held over the link, they can have a tooltip
// telling them what it does in their language. 
//
// You can call chrome.i18n.getPath(name) to get  the localized path for
// a file in the extension.

function findData()
{
	var spans = document.getElementsByTagName('span');
	for (var i = 0; i < spans.length; i++)
	{
		var span = spans[i];
		if (span.dataset.i18n)
			span.innerHTML = chrome.i18n.getMessage(span.dataset.i18n)
	}
	
	var links = document.getElementsByTagName('a');
	for (var i = 0; i < links.length; i++)
	{
		var a = links[i];
		if (a.dataset.i18n)
			a.title = chrome.i18n.getMessage(a.dataset.i18n)
	}
}
chrome.i18n.getPath = function(name, exits)
{
	var path = '_locales/' + chrome.i18n.getMessage('locale') + '/' + name;
	if (exits)
		for (var i = 0; i < exits; i++)
			path = '../' + path;
	return path;
}

findData();
