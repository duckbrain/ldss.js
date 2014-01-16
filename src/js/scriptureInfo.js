// This script will provide a function that will be given a user input
// string an will result in all data needed for that scripture or search
// besides the scripture content itself.
// The data is retrieved from a localized JSON file index.json that has
// books and volumes and information. This information is used to
// determine which volume or book the user is trying to find. This is much
// more dynamic then the switch statement used before and much more
// manageable, but it may cause a slight reduction in speed. It may however
// be faster as well. We will have to see.

function getBookInfo(t)
// Returns an object that contains the information about the book or volume
// found at the beginning of the search string and passes the remainder of the
// string back. Is optimized for ldsorg searches first because they are what are
// used internally in the app's links.
{
	var s = t.toLowerCase();
	var i;
	var item;
	var x;
	//For speed reasons, start with the ldsorg search
	for (i = 0; i < index.length; i++)
	{
		item = index[i];
		if (s.indexOf(item.ldsorg.toLowerCase()) == 0)
			return {
				file: item.file,
				title: item.title,
				ldsorg: item.ldsorg,
				titleLong: item.titleLong,
				bookindex: item.bookindex - 1,
				chapters: item.chapters,
				remainder: t.substring(item.ldsorg.length).trim()
			};
	}
	//Do the title second
	for (i = 0; i < index.length; i++)
	{
		item = index[i];
		if (s.indexOf(item.title.toLowerCase()) == 0)
			return {
				file: item.file,
				title: item.title,
				ldsorg: item.ldsorg,
				titleLong: item.titleLong,
				bookindex: item.bookindex - 1,
				chapters: item.chapters,
				remainder: t.substring(item.title.length).trim()
			};
	}
	//Finish with anything else
	for (i = 0; i < index.length; i++)
	{
		item = index[i];
		if (s.indexOf(item.titleLong.toLowerCase()) == 0)
			return {
				file: item.file,
				title: item.title,
				ldsorg: item.ldsorg,
				titleLong: item.titleLong,
				bookindex: item.bookindex - 1,
				chapters: item.chapters,
				remainder: t.substring(item.titleLong.length).trim()
			};
		for (x = 0; x < item.names.length; x++)
		{
			if (s.indexOf(item.names[x].toLowerCase()) == 0)
				return {
					file: item.file,
					title: item.title,
					ldsorg: item.ldsorg,
					titleLong: item.titleLong,
					bookindex: item.bookindex - 1,
					chapters: item.chapters,
					remainder: t.substring(item.names[x].length).trim()
				};
		}
	}
	return { remainder: t.trim() };
}

function getScriptureInfo(t)
{
	var info = getBookInfo(t);
	var r = info.remainder;

	if (r.length == 0)
		return info;

	if (!info.file || !info.chapters)
	{
		info.search = r;
		return info;
	}

	//Separates it into words
	var w = r.split(' ');
	
	var chapter, verseText;
	if (w[0].indexOf(':') != -1)//User added a colon between chapter and verse
	{
		var x = w[0].split(':')
		chapter = parseInt(x[0]);
		verseText = x[1];
	}
	else
	{
		chapter = parseInt(w[0]);
		verseText = w[1]
	}
	//Both chapter and verseText will be set

	if (isNaN(chapter))//No chapter defined, search the book
	{
		info.search = r;
		return info;
	}

	//Remove the first word from potential search
	r = r.substring(r.indexOf(' ') + 1);

	//Chapter was defined, set it in the info
	info.chapter = chapter;

	if (verseText)
	{
		var verseStart, verseEnd;
		if (verseText.indexOf('-') != -1)//Has a range
		{
			var x = verseText.split('-');
			verseStart = parseInt(x[0]);
			verseEnd = parseInt(x[1]);
		}
		else//One verse
		{
			verseStart = verseEnd = parseInt(verseText);
		}
		
		if (isNaN(verseStart) || isNaN(verseEnd))//If it is not a valid verse range
		{
			//Use it as a search and your done
			info.search = r;
			return info;
		}
		
		//You won't be searching within a verse, so you are done.
		info.verseStart = verseStart;
		info.verseEnd = verseEnd;	
	}
	
	return info;


	//TODO Make it use regex
	// \d[ :]/
}

var index;

function loadData()
{
	var xmlrequest = new XMLHttpRequest();
	xmlrequest.open('GET', '../' + chrome.i18n.getPath('index.json'), false);
	xmlrequest.send();
	index = JSON.parse(xmlrequest.responseText);
}

loadData();