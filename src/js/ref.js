//This document is at the bottom of the page so it loads after the
// DOM loads. It is NOT in charge of loading the HTML from the
// background page, but is responsible for the keyboard shortcuts,
// styles, toolbar, and any other operations on the ref.html page.
//
// Is only to be loaded at the bottom of /ref.html

function loadpage()
{
	read();
	searchMode_leave();
	search = document.getElementById('search');
	search.addEventListener('focus', searchMode_enter, false);
	search.addEventListener('blur', searchMode_leave, false);
}

if (search != '')
	tabBookmarkCheck(search);
verseSearch = 0;
if (GetStyleMode('CSSFile'))
	document.head.appendChild(GetStyleTag('CSSFile'));
if (GetStyleMode('CustomCSS'))
	document.head.appendChild(GetStyleTag('CustomCSS'));
if (GetStyleMode('Simple'))
	document.head.appendChild(GetStyleTag('Simple'));
	
function keypress(e)
{
	if (e.keyCode == 110) //n
	{
		ScrollToVerse(scrolledVerse + 1);//Next verse
		e.preventDefault();
	}
	if (e.keyCode == 98) //b
	{
		ScrollToVerse(scrolledVerse - 1);//Previous verse
		e.preventDefault();
	}
	if (e.keyCode == 122) //z
	{
		location.href = document.getElementById('nextlink').href;//Next chapter
		e.preventDefault();
	}
	if (e.keyCode == 97) //a
	{
		location.href = document.getElementById('backlink').href;//Previous chapter
		e.preventDefault();
	}
	if (e.keyCode == 113) //q
	{
		location.href = document.getElementById('uplink').href;//Up a level
		e.preventDefault();
	}
	if (e.keyCode == 117) //u
	{
		updatebookmark();
		e.preventDefault();
	}
	if (e.keyCode == 115) //s
	{
		document.getElementById('search').focus();//Focus the search bar
		e.preventDefault();
	}
	if (e.keyCode == 120) //x
	{
		var a = document.getElementById('autoscroll')
		a.checked = !a.checked;
		togglescroll(a.checked);
		e.preventDefault();
	}
	console.debug('Key Pressed: ' + e.keyCode);
}

scrolledVerse = 0;

function ScrollToVerse(num)
{
	var theElement = document.getElementById(String(num));
	var selectedPosY = 0;

	while(theElement != null)
	{
		selectedPosY += theElement.offsetTop;
		theElement = theElement.offsetParent;
	}
	window.scrollTo(selectedPosX,selectedPosY);
}
function window_scroll()
{
	var vc = document.getElementById('0').children;
	for (var x = 0; x < vc.length; x++)
	{
		var el = document.getElementById(String(x));
		if (el == undefined || el == null)
			continue;
		var selectedPosY = 0;
		while (el != null)
		{
			selectedPosY += el.offsetTop;
			el = el.offsetParent;
		}
		if (selectedPosY > window.pageYOffset + 10)
		{
			scrolledVerse = x - 1;
			if (scrolledVerse < 1)
				scrolledVerse = 0
			//console.debug('Scrolled To: ' + scrolledVerse);
			break;
		}
	}
	
	// This section sets the hash code, but prevents it from scrolling to that verse
	var el = document.getElementById(String(scrolledVerse));
	if (el)
	{
		el.id = '';
		location.hash = scrolledVerse;
		el.id = String(scrolledVerse);
	}
	
	// If the page is not being automatically scrolled, then 
	// set the desired position to where it is at.
	if (!scrolling)
		desiredScroll = window.pageYOffset;
}

chrome.runtime.onMessage.addListener(function(request) {
	if (request.request == 'update style')
	{
		//Must update the styles

		//Should remove any style tags, but the default one.
		var toremove = document.getElementsByTagName('link')[1];
		while (toremove)
		{
			document.head.removeChild(toremove);
			toremove = document.getElementsByTagName('link')[1];
		}

		toremove = document.getElementsByTagName('style')[0];
		while (toremove)
		{
			document.head.removeChild(toremove)
			toremove = document.getElementsByTagName('style')[0];
		}
		
		//Add whichever style tags are allowed by the settings
		if (GetStyleMode('CSSFile'))
			document.head.appendChild(GetStyleTag('CSSFile'));
		if (GetStyleMode('CustomCSS'))
			document.head.appendChild(GetStyleTag('CustomCSS'));
		if (GetStyleMode('Simple'))
			document.head.appendChild(GetStyleTag('Simple'));
	}
});

function searchMode_enter()
{
	document.removeEventListener('keypress', keypress, false);
 
	//Add a specific class for specifying that the bar is shown
	document.getElementsByClassName('navbar')[0].classList.add('open')
}
function searchMode_leave()
{
	document.addEventListener('keypress', keypress, false);

	//Remove the specific class for specifying that the bar is shown
	document.getElementsByClassName('navbar')[0].classList.remove('open')
}

var desiredScroll = 0;
var scrolling = false;
var scrollSpeed = 1;//This is the speed of the auto scroll
					//TODO make shortcut keys and a control on the panel to control the speed

function togglescroll(scroll)
{
	if (scroll)
		scrollTimer = setInterval(scrollTimer, 33);
	else clearInterval(scrollTimer);
	scrolling = scroll;
}
function scrollTimer()
{
	desiredScroll += scrollSpeed;
	window.scrollTo(window.pageXOffset, desiredScroll);
}

loadpage();
