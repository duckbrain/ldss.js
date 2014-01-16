// This is the javascript file for options.html. it is not to be used
// for changing the settings for the app, but to work with the UI on the
// options page. It must be used at the bottom of the document, after
// all the elements have loaded.
// This file should be very reusable in other pages and in other apps.
// All you have to do is layout the HTML correctly and make the CSS do
// whatever you want. It could potentially be a Javascript library.

var devmodeBox;

function onpageload()
{
	window.addEventListener('hashchange', page_hashchange, false);
	//document.body.onhashchange = page_hashchange;

	if (location.hash.length == 0)
		location.hash = 'main';
	else page_hashchange();
}

function page_hashchange()
{
	var x, i;
	while (document.body.getElementsByClassName('selected').length > 0)
	{
		var selectedEls = document.body.getElementsByClassName('selected');
		for (var i = 0; i < selectedEls.length; i++)
		{
			selectedEls[i].classList.remove('selected');
		}
	}
	var selector = document.body.getElementsByClassName('selector')[0];
	var links = selector.getElementsByTagName('a');
	for (i = 0; i < links.length; i++)
		if (links[i].href.indexOf(location.hash.split('-')[0]) != -1)
		{
			links[i].parentElement.classList.add('selected');
			
			subLinks = links[i].parentElement.getElementsByTagName('ul')[0];
			if (subLinks)
			{
				subLinks = subLinks.getElementsByTagName('a');
				for (x = 0; x < subLinks.length; x++)
					if (subLinks[x].href.indexOf(location.hash) != -1)
					{
						subLinks[x].parentElement.classList.add('selected');
						break;
					}
			}
			break;
		}
}


function dev_toggle()
{
	if (!document.body.classList.contains('advanced'))
		document.body.classList.add('advanced');
	else
		document.body.classList.remove('advanced');
}
onpageload();
