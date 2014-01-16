// This script listens for messages on the background page and if it is
// a request for a scripture, it will load it to memmory (if not done)
// and will return the scripture HTML as a response.

//TODO: make it load scripture from i18n json scriptures, instead of xml


//Here will be some run-time or maybe permenent settings
//Such as if footnotes are shown.

//TODO Prepare xml docs for reading (put in dictionary based on filename)

loadedDocs = [ ];

function getScripture(file, book, chapter, verse, footnote)
{
//TODO Return HTML from the XML file
}

function load(search, file, book, chapter, verse)
{
    var h;

    if (file == undefined)
        if (search == undefined)
            return {
                html: '<br><br><span style="color: red;">INTERNAL ERROR:</span> A file must be specified to display content. Please report this issue.'
            };
        else
        {
            //Universal Search
            var bm = load(search, 'bm.xml');
            var ot = load(search, 'ot.xml');
            var nt = load(search, 'nt.xml');
            var dc = load(search, 'dc.xml');
            var pgp = load(search, 'pgp.xml');
            return {
                html: bm.html + ot.html + nt.html + dc.html + pgp.html,
                booktitle: "Library",
                back: 'ref.html?s=library',
                up:'ref.html?s=library'
            };
        }

    if (loadedDocs[file] == undefined)
    {
        var xmlrequest = new XMLHttpRequest();
        xmlrequest.open('GET', '../xml/' + file, false);
        xmlrequest.send();
        loadedDocs[file] = xmlrequest.responseXML;
    }

    if (file != undefined)
        var doc = loadedDocs[file];

    //
    //Content
    //

    //Load from XML
    var xmlVolume = doc.getElementsByTagName('volume')[0]
    var xmlBooks = doc.getElementsByTagName('book');
    var i;
    if (book != undefined)
        for (i = 0; i < xmlBooks.length; i++)
            if (xmlBooks[i].getAttribute('lds_org') == book)
            {
                var xmlBook = xmlBooks[i];
                var bookName = xmlBook.getAttribute('title');
                var xmlBookIndex = i;
                var xmlChapters = xmlBook.getElementsByTagName('chapter');
                if (xmlChapters.length == 1)
                    chapter = 1;
            }
    if (chapter != undefined)
        for (i = 0; i < xmlChapters.length; i++)
            if (xmlChapters[i].getAttribute('num') == chapter)
            {
                var xmlChapter = xmlChapters[i];
                var xmlVerses = xmlChapter.getElementsByTagName('verse');
            }

    //Get back and next links
    var back;
    var next;
    var up;
    if (book == undefined) //Volume Index
    {
        back = null;
        next = null;
        up = 'ref.html?s=library';
    }
    else if (chapter == undefined) //Book Index
    {
        if (xmlBookIndex > 0)
            back = 'ref.html?s=' + xmlBooks[xmlBookIndex - 1].getAttribute('lds_org');
        else back = null;
        if (xmlBookIndex < xmlBooks.length - 1) //TODO Make it work
            next = 'ref.html?s=' + xmlBooks[xmlBookIndex + 1].getAttribute('lds_org');
        else next = null;
        up = 'ref.html?s=' + xmlVolume.getAttribute('lds_org');
    }
    else if (verse == undefined) //Chapter
    {
        if (chapter > 1)
            back = 'ref.html?s=' + book + ' ' + (chapter - 1);
        else //TODO Make it work
        {
            if (xmlBookIndex > 0)
                back = 'ref.html?s=' + xmlBooks[xmlBookIndex - 1].getAttribute('lds_org') + ' ' + (xmlBooks[xmlBookIndex - 1].getElementsByTagName('chapter').length);
            else back = null;
        }
        if (chapter < xmlChapters.length)
            next = 'ref.html?s=' + book + ' ' + (chapter + 1);
        else if (xmlBookIndex < xmlBooks.length - 1) //TODO Make it work
            next = 'ref.html?s=' + xmlBooks[xmlBookIndex + 1].getAttribute('lds_org') + ' 1';
        else next = null;
        up = 'ref.html?s=' + book;
    }
    else //Verse
    {
        back = 'ref.html?s=' + book + ' ' + chapter;
        up = back;
        next = null;
    }

    if (search == undefined)
    {
        //Output non-search info
        if (book == undefined) //You want the volume index
        {
            h = '<h1 class="title">' + xmlVolume.getAttribute('title_long') + '</h1>';
            for (i = 0; i < xmlBooks.length; i++)
                if (xmlBooks[i].getAttribute('num_chapters') == "1")
                    h = h + '<p><a class="nav" id="' + (i - 1) + '" href="ref.html?s=' + xmlBooks[i].getAttribute('lds_org') + ' 1">' + xmlBooks[i].getAttribute('title') + '</a></p>';
                else
                    h = h + '<p><a class="nav" id="' + (i - 1) + '" href="ref.html?s=' + xmlBooks[i].getAttribute('lds_org') + '">' + xmlBooks[i].getAttribute('title') + '</a></p>';
        }
        else if (chapter == undefined) //You want the book index
        {
            h = '<h1 class="title">' + xmlBook.getAttribute('title_long') + '</h1>';
            if (book != "dc")
                h = h + '<h2 class="subtitle">' + xmlVolume.getAttribute('title') + '</h2>';
            for (i = 1; i <= xmlChapters.length; i++)
                if (book != "dc")
                    h = h + '<p><a class="nav" id="' + i + '" href="ref.html?s=' + xmlBook.getAttribute('lds_org') + ' ' + i + '">Chapter ' + i + '</a></p>';
                else
                    h = h + '<p><a class="nav" id="' + i + '" href="ref.html?s=' + xmlBook.getAttribute('lds_org') + ' ' + i + '">Section ' + i + '</a></p>';
        }
        else if (verse == undefined) //You want the chapter
        {
            if (book != "dc")
            {
                h = '<h1 class="title">Chapter ' + chapter + ': ' + xmlBook.getAttribute('title_long') + '</h1>';
                h = h + '<h2 class="subtitle">' + xmlVolume.getAttribute('title_long') + '</h2>';
            }
            else
            {
                h = '<h1 class="title">Section ' + chapter + ': ' + xmlBook.getAttribute('title_long') + '</h1>';
            }
            for (i = 0; i < xmlVerses.length; i++)
                h = h + '<p class="verse" id="' + (i + 1) + '"><b>' + (i + 1) + '</b> ' + xmlVerses[i].getAttribute('scripture') + '</p>';
        }
        else //You want the verse and footnotes
        {
            if (verse.length == 1)
            {
                h = '<h1 class="title">' + xmlBook.getAttribute('title_long') + ' ' + chapter + ':' + verse[0] + '</h1>';
                h = h + '<p class="verse" id="' + verse[0] + '"><b>' + verse[0] + '</b> ' + xmlVerses[verse[0] - 1].getAttribute('scripture') + '</p>';
            }
            else
            {
                h = '<h1 class="title">' + xmlBook.getAttribute('title_long') + ' ' + chapter + ':' + verse[0] + '-' + verse[1] + '</h1>';
                for (i = verse[0]; i <= verse[1]; i++)
                    h = h + '<p class="verse" id="' + i + '"><b>' + i + '</b> ' + xmlVerses[i - 1].getAttribute('scripture') + '</p>';
            }
        }
    }
    else
    {
        //Search
        var results = [];
		var verseText;
		var regex = search;
		var matches;
		var bookref;
		var j;
		if (book != undefined)
		{
			bookref = xmlBook.getAttribute('lds_org');
			if (chapter != undefined)
			{
				if (verse != undefined)
				{
					//Fill array with verse if a match
					verseText = xmlVerses[verse].getAttribute('scripture');
					matches = verseText.match(regex);
					if (matches != null)
						results.push(
						{
							refrence:bookName + ' ' + chapter + ':' + verse,
							link: bookref + ' ' + chapter + ':' + verse,
							summary:(verseText.length > 100 ? verseText.substr(0,100) : verseText)
						});
				}
				else
				{
					for (i = 0; i < xmlVerses.length; i++)
					{
						//Fill array with verse if a match
						verseText = xmlVerses[i].getAttribute('scripture');
						matches = verseText.match(regex);
						if (matches != null)
							results.push(
							{
								refrence:bookName + ' ' + chapter + ':' + (i + 1),
								link: bookref + ' ' + chapter + ':' + (i + 1),
								summary:(verseText.length > 100 ? verseText.substr(0,100) : verseText)
							});
					}
				}
			}
			else
			{
				for (j = 0; j < xmlChapters.length; j++)
				{
					xmlVerses = xmlChapters[j].getElementsByTagName('verse');
					for (i = 0; i < xmlVerses.length; i++)
					{
						//Fill array with verse if a match
						verseText = xmlVerses[i].getAttribute('scripture');
						matches = verseText.match(regex);
						if (matches != null)
							results.push(
							{
								refrence:bookName + ' ' + (j + 1) + ':' + (i + 1),
								link: bookref + ' ' + (j + 1) + ':' + (i + 1),
								summary:(verseText.length > 100 ? verseText.substr(0,100) : verseText)
							});
					}
				}
			}
		}
		else
		{
			for (var k = 0; k < xmlBooks.length; k++)
			{
				xmlChapters = xmlBooks[k].getElementsByTagName('chapter');
				bookName =  xmlBooks[k].getAttribute('title')
				bookref =  xmlBooks[k].getAttribute('lds_org')
				for (j = 0; j < xmlChapters.length; j++)
				{
					xmlVerses = xmlChapters[j].getElementsByTagName('verse');
					for (i = 0; i < xmlVerses.length; i++)
					{
						//Fill array with verse if a match
						verseText = xmlVerses[i].getAttribute('scripture');
						matches = verseText.match(regex);
						if (matches != null)
							results.push(
							{
								refrence:bookName + ' ' + (j + 1) + ':' + (i + 1),
								link: bookref + ' ' + (j + 1) + ':' + (i + 1),
								summary:(verseText.length > 100 ? verseText.substr(0,100) : verseText)
							});
					}
				}
			}
		}

        h = '<h1>Search results in ';
        if (verse == undefined)
            if (chapter == undefined)
                if (book == undefined)
                    h += xmlVolume.getAttribute('title') + '</h1>';
                else h += xmlBook.getAttribute('title') + '</h1>';
			else h += xmlBook.getAttribute('title') + ' Chapter ' + chapter + '</h1>';
		else h += xmlVolume.getAttribute('title') + ' Chapter ' + chapter + ':' + verse + '</h1>';
        for (i = 0; i < results.length; i++)
        {
            var r = results[i];
            h += '<p class="result"><a class="searchref" href="ref.html?s=' + r.link + '">' + r.refrence + '</a> ' + r.summary + '</p>';
        }
    }
    return {
        html: h,
        up: up,
        back: back,
        next: next,
        booktitle: bookName
    };
}

chrome.extension.onRequest.addListener(function(request, sender, sendResponse)
{
    //sendResponse is a function
    if (request != 'style')
        sendResponse(load(request.search, request.file, request.book, request.chapter, request.verse));
});
