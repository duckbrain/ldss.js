// This script is loaded by the background page to watch for and manage
// omnibox searches that use the apps keyword "lds"

//TODO: Change to use scriptureInfo.js when completed.

//TODO: Options for instant and open in new tab

keywords = ["library", "ot", "nt", "bm", "dc", "pgp", "a_of_f", "1_sam", "1_kgs", "1_chr", "1_cor", "1_thes", "1_tim", "1_pet", "1_jn", "1_ne", "2_sam", "2_kgs", "2_chr", "2_cor", "2_thes", "2_tim", "2_pet", "2_jn", "2_ne", "3_jn", "3_ne", "4_ne", "gen", "ex", "lev", "num", "deuteronomy", "josh", "judges", "ruth", "ezra", "nehemiah", "esther", "job", "psalms", "proverbs", "ecclesiastes", "song", "isaiah", "jeremiah", "lamentations", "ezekiel", "daniel", "hosea", "joel", "amos", "obadiah", "jonah", "micah", "nahum", "habakkuk", "zephaniah", "haggai", "zachariah", "malachi", "matt", "mark", "luke", "john", "acts", "romans", "galatians", "ephesians", "philippians", "colossions", "titus", "philemon", "hebrews", "james", "jude", "revelation", "jacob", "enos", "jarom", "omni", "words of mormon", "mosiah", "alma", "helaman", "mormon", "ether", "moroni", "moses", "abraham", "js_m", "js_h"];

books = ["Library", "Old Testament", "New Testament", "Book of Mormon", "Doctrine and Covenants", "Pearl of Great Price", "Articles of Faith", "1 Samuel", "1 Kings", "1 Chronicles", "1 Corinthians", "1 Thessalonians", "1 Timothy", "1 Peter", "1 John", "1 Nephi", "2 Samuel", "2 Kings", "2 Chronicles", "2 Corinthians", "2 Thessalonians", "2 Timothy", "2 Peter", "2 John", "2 Nephi", "3 John", "3 Nephi", "4 Nephi", "Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy", "Joshua", "Judges", "Ruth", "Ezra", "Nehemiah", "Esther", "Job", "Psalms", "Proverbs", "Ecclesiastes", "Song", "Isaiah", "Jeremiah", "Lamentations", "Ezekiel", "Daniel", "Hosea", "Joel", "Amos", "Obadiah", "Jonah", "Micah", "Nahum", "Habakkuk", "Zephaniah", "Haggai", "Zachariah", "Malachi", "Matthew", "Mark", "Luke", "John", "Acts", "Romans", "Galatians", "Ephesians", "Philippians", "Colossions", "Titus", "Philemon", "Hebrews", "James", "Jude", "Revelation", "Jacob", "Enos", "Jarom", "Omni", "Words of Mormon", "Mosiah", "Alma", "Helaman", "Mormon", "Ether", "Moroni", "Moses", "Abraham", "Joseph Smith - Matthew", "Joseph Smith - History"];

try
{
	chrome.omnibox.onInputEntered.addListener(function(text)
	{
		var url = 'chrome-extension://' + chrome.i18n.getMessage('@@extension_id') + '/ref.html?s=' + encodeURI(text);
		chrome.tabs.getSelected(null, function(tab)
		{
			chrome.tabs.update(tab.id, { url: url });
		});
	});
}
catch (ex)
{
	if (!localStorage.getItem('searchinfo.displayed'))
	{
		chrome.tabs.create(
		{
			url:"searchinfo.html"
		});
		localStorage.setItem('searchinfo.displayed', true)
	}
}

chrome.omnibox.onInputCancelled.addListener(function()
{

});

chrome.omnibox.onInputChanged.addListener(function(text, suggest)
{
	text = text.toLowerCase();
	var suggestions = [];
	var s;
	for (var i = 0; i < books.length; i++)
		if ((books[i].toLowerCase().indexOf(text) == 0) || (keywords[i].replace('_', ' ').toLowerCase().indexOf(text) == 0))
			if (i <= 7)
				suggestions.push(
				{
					"content" : books[i],
					"description" : 'Open the ' + books[i]
				});
			else
				suggestions.push(
				{
					"content" : books[i],
					"description" : 'Open ' + books[i]
				});
		else if (text.indexOf(books[i].toLowerCase()) == 0 || text.indexOf(keywords[i].toLowerCase()) == 0)
		{
			suggestions.push(
				{
					"content" : books[i],
					"description" : 'Open or Search ' + books[i]
				});
		}
	if (suggestions.length != 0)
		suggest(suggestions);
});

chrome.omnibox.onInputStarted.addListener(function()
{
	
});
