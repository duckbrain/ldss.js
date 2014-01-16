// This script will provide a way to detect which bookmark a page was
// opened from (if any) and then modify links to follow keep the
// bookmark id in the URL. It will then detect the URL parameter for the
// id and provide a function to update the bookmark to the new location.
// Also contains the gup function for finding URL parameter values.

function gup(name, url)
{
	if (url == undefined)
		url = location.href;
	name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
	var regexS = "[\\?&]"+name+"=([^&#]*)";
	var regex = new RegExp(regexS);
	var results = regex.exec(url);
	if(results == null)
		return "";
	else
		return results[1];
}

bookmarkSearchId = 'chrome-extension://' + chrome.i18n.getMessage('@@extension_id') + '/ref.html?s=';
mybookmark = null;
bookmarkid = gup('bookmark');


function bkmkfxurl(url) { return ((bookmarkid != '') ? (url + '&bookmark=' + bookmarkid) : url); }

function backgroundStart() {
	chrome.bookmarks.onCreated.addListener(function(id, bookmark) {
		//If does not have bookmark id, search through tabs for an app tab with this URL that is not already assigned

		//If a bookmark has an ID, remove it.
	});
}

function updatebookmark() {
	var newurl = bookmarkSearchId + search;
	var b = confirm('Would you like to update your bookmark "' + mybookmark.title + '" to the current page?');
	if (b)
		chrome.bookmarks.update(bookmarkid, {'url': newurl});
}

function tabBookmarkCheck() {
	if (bookmarkid == '')
		chrome.bookmarks.search(bookmarkSearchId + search, function(results) {
			console.debug('Bookmark Search Results for ' + bookmarkSearchId + search);
			console.debug(results);
			finnishCheck = function(bookmark) {
				location.href = location.href + '&bookmark=' + bookmark.id;
			}
			if (results.length > 1) {
				//Ask user which one and call finnishCheck when done.
				console.error('"Ask user which bookmark" not implemented');
			}
			else if (results.length == 1)
				finnishCheck(results[0]);
			else
				return;
		});
	else {
		chrome.bookmarks.get(bookmarkid, function (bookmark) {
			if (bookmark.length > 1) {
				//Ask user which one and set mybookmark when done
				console.error('"Ask user which bookmark" not implemented');
			}
			else if (bookmark.length == 1)
				mybookmark = bookmark[0];
			else
				return;
			document.getElementById('bookmark').innerHTML = mybookmark.title;
			document.getElementById('bookmark').title = 'Clicking here will update the bookmark "' + mybookmark.title + '" with the current page.';
			document.getElementById('bookmarkclear').href = 'ref.html?s=' + search;
			document.getElementById('bookmark').parentElement.classList.remove('noshow');
			if (GetAutobookmark())
				updatebookmark();
		});
	}
}
