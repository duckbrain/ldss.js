// This script listens for messages on the background page and if it is
// a request for a scripture, it will load it to memory (if not done)
// and will return the scripture HTML as a response.

var ref = 'ref.html?s=';

loadedDocs = {};

function getScriptureContent(scripture, builder)// This function will take the output of a getScriptureInfo call and will return
// the appropriate HTML content. The content will be created with standard DOM
// functions, not raw HTML strings. It will return an object that contains
// properties.
//		back: contains a string that is a relative href to the chapter/book before
//		next: contains a string that is a relative href to the chapter/book after
//		up: contains a string that is a relative href to to the level up from the scripture
//		content: contains a DOM object that is a div with all the content for the
//			requested scriptures, if the request was a search, will contain a div
//			that contains all the search results.
//
// builder should only be used for recursion in the function
//
// This function will be able to access the scriptures in .json files stored in
// the locale for the user.
{
    var content, c, classes = 'scripture';
    var up, back, next, onlineurl;
    
    if (scripture.file == undefined) 
        if (scripture.search != undefined) {
        //TODO: Must search entire scriptures
        
        }
        else {
            //Build Library Page
            var content = new HTMLBuilder();
            content.addChild('h1', false, false, index[0].title)
            for (var i = 1; i < index.length; i++) 
                if (index[i].bookindex == undefined || index[i].ldsorg == 'dc') 
                    content.addChild('p', false, false, index[i].title, ref + index[i].ldsorg);
            
            classes += ' library'
            onlineurl = 'http://lds.org/scriptures';
        }
    else {
		
		
        //Has a file to load
        if (loadedDocs[scripture.file] == undefined)//Not in memory yet
        {
            //Load and parse JSON file
            var request = new XMLHttpRequest();
            request.open('GET', chrome.i18n.getPath(scripture.file, 1), false);
            request.send();
            loadedDocs[scripture.file] = JSON.parse(request.responseText);
        }
        
		
        //Set the data to be used
        var volume = loadedDocs[scripture.file];
        var book, chapter, verses, i;
        if (scripture.bookindex != undefined) {
            book = volume.books[scripture.bookindex];
            if (scripture.chapter != undefined) {
                chapter = book.chapters[scripture.chapter - 1];
                if (scripture.versesStart != undefined) {
                    verses = [];
                    for (i = scripture.versesStart - 1; i < scripture.versesEnd - 1; i++) 
                        verses.push(chapter.verses[i]);
                }
                else 
                    verses = chapter.verses;
            }
        }
        if (volume.chaptername == undefined) 
            volume.chaptername = 'Chapter';
			
			
			
			
        
        //
        // Write the content and navigation links
        //
        
        console.debug({
            volume: volume,
            book: book,
            chapter: chapter,
            verses: verses
        });
        if (builder == undefined) 
            content = new HTMLBuilder();
        else 
            content = builder;
        if (scripture.search != undefined) {
            //Load the content of the scripture
            classes += ' search'
        }
        else {
            if (book != undefined) {
                if (chapter != undefined) {
                    //Add Header
                    if (scripture.versesStart != undefined) //Verse Range
                    {
                        c = book.title + ' ' + scripture.chapter + ':' + scripture.versesStart;
                        if (scripture.versesStart != scripture.versesEnd) 
                            c += '-' + scripture.versesEnd;
                        content.addChild('h1', false, false, c);
                        up = ref + book.ldsorg + ' ' + scripture.chapter;
                    }
                    else //All verses in chapter
                    {
                        content.addChild('h1', false, false, book.title + ' ' + scripture.chapter);
                        up = ref + book.ldsorg;
                    }
                    //Add Content
                    for (i = 0; i < verses.length; i++) 
                        content.addChild('p', i + 1, false, '<span class="vsnum">' + (i + 1) + '</span> ' + verses[i].content);
                    
                    //Navigation Links
                }
                else //List Chapters in Book
                {
                    content.addChild('h1', false, false, book.title);
                    for (i = 1; i < scripture.chapters; i++) 
                        content.addChild('p', i + 1, false, volume.chaptername + ' ' + i, 'ref.html?s=' + book.ldsorg + ' ' + i);
                    
                    //Navigation Links
                    up = ref + volume.ldsorg;
                }
            }
            else //List Books in File
            {
                content.addChild('h1', undefined, undefined, volume.title);
                for (i = 0; i < volume.books.length; i++) {
                    book = volume.books[i]
                    content.addChild('p', i, undefined, book.title, 'ref.html?s=' + book.ldsorg);
                }
                
                //Navigation only up.
                up = ref + 'library';
            }
        }
    }
    
    return {
        refrence: scripture,
        up: up,
        back: back,
        next: next,
        content: content.getHTML(),
        classes: classes,
        ldsorg: onlineurl,
    };
}

chrome.runtime.onMessage.addListener(function(request){
    // Request is an object that must contain the property request that explains
    // what the request is for.
    // 
    // In the case of a "scripture content" request, it must either be the
    // response of a getScriptureInfo call with a request property added or it
    // must contain an s property to give the string to pass to getScriptureInfo.
    
    if (request.request == 'scripture content') 
        if (request.s) 
            var response = { info: getScriptureContent(getScriptureInfo(request.s)) };
        else 
            var response = { info: getScriptureContent(scripture) };
        response.request = 'scripture content response';
        chrome.runtime.sendMessage(response);
    
    // If the request is a "scripture info" request, the s property must also be
    // set, but the response will be the response of getScriptureInfo.
    if (request.request == 'scripture info') 
        if (request.s) {
			var response = { info: getScriptureInfo(request.s), request: 'scripture info response' };
            chrome.runtime.sendMessage(response);
		}
});
