lds.dm.chromeStorage = false;
lds.dm.load(null, function() {
	lds.catalog.updateLanguages();
	
	$('#main-database-loading').hide();
	lds.dm.koModel.refreshCatalog = function() {
		lds.catalog.db.onrequestcomplete = function() {
			var db = lds.catalog.db.db;
			//alert("Done");
			setTimeout(function() {
				loadCatalog();
				$('#main-database button, #main-database select').enable();
				$('#main-database-catalog').show();
				$('#main-database-loading').hide();
			}, 100);
		}
		$('#main-database button, #main-database select').disable();
		$('#main-database-catalog').hide();
		$('#main-database-loading').show();
		lds.catalog.updateCatalog();
	}
	lds.dm.koModel.downloadAll = function() {
		//TODO Disable the gui
		lds.catalog.downloadFolder(0, function() {
			//TODO reenable the gui
		});
	};
	lds.dm.koModel.downloadVisible = function() {
		var visible = $('#main-database-catalog input[type=checkbox]').filter(function() {
			return !this.disabled;
		});;
		for (var i = 0; i < visible.length; ++i) {
			setTimeout((function(i) {
				return function() {
					$(visible[i]).trigger('click');
				}
			})(i), i * 100);
		}
	}
	ko.applyBindings(lds.dm.koModel);
	lds.dm.startListening();
	loadCatalog();
});

window.addEventListener('hashchange', page_hashchange, false);
if (location.hash.length == 0)
	location.hash = 'main-general';
else page_hashchange();

function createCatalogNode(e) {
	
	if (!e) {
		// Nothing in the catalog
		var html = new lds.HTMLBuilder();
		// TODO: Internationalized string
		html.append('li').text('Catalog is empty, please refresh the catalog.');
		$('#main-database-catalog ul').html(html.getHTML());
		return;
	}
	
	var parentNode = $('#catalog-' + e.id + ' ul');
	if (!parentNode.length) parentNode = $('#main-database-catalog ul');
	
	$('#catalog-' + e.id).data('open', "true");
	
	var html = new lds.HTMLBuilder();
	
	for (var i in e.books) {
		var b = e.books[i];
		html.append('li');
		html.input('checkbox').data(b).data('type', 'book');
		if (typeof(b.nodes) == 'object')
			html.attr('disabled', true).attr('checked', true);
		else for (var i in lds.catalog.downloadQueue)
			if (lds.catalog.downloadQueue[i].url == b.url)
				html.attr('disabled', true).attr('indeterminate', true);
		html.text(b.name);
	}
	for (var i in e.folders) {
		var f = e.folders[i];
		
		html.append('li').attr('id', 'catalog-' + f.id).data('open', false);
		//if (lds.dm.koModel.developer_mode() && false) { //Disabled temporarily
		//	html.input('checkbox').data(f).data('type', 'folder'); 
		//	html.closeTag();
		//}
		html.child('a').data('id', f.id).text(f.name);
		html.append('ul').closeTag();
	}
	parentNode.html(html.getHTML()).find('a').click(function(x) {
		var t = $(x.target);
		if (t.parent().data('open') == 'true') {
			t.parent().find('ul').html('');
			t.parent().data('open', false);
		} else {
			lds.db.getID = parseInt(t.data('id'));
			lds.db.recursiveMode = false;
			lds.db.onrequestcomplete = createCatalogNode;
			lds.db.getFolderBooks();
			
		}
	});
	parentNode.find('input').click(function(x) {
		$(x.target).disable().indeterminate();
		
		if ($(x.target).data('type') == 'folder') {
			lds.catalog.downloadFolder($(x.target).data('id'), x.target, onBookDownloaded);
		}
		
		lds.catalog.downloadQueue.push({ 
			url: $(x.target).data('url'), 
			callback: onBookDownloaded, 
			button: x.target,
			id: parseInt($(x.target).data('id'))
		});
		lds.catalog.downloadBook();
	});
}

function loadCatalog() {
	lds.db.getID = 0;
	lds.db.recursiveMode = false;
	lds.db.onrequestcomplete = createCatalogNode;
	lds.db.getFolderBooks();
}

function onBookDownloaded(e) {
	$(e.button).check();
	console.debug(e);
}

function page_hashchange()
{
	$('.selected').removeClass('selected');
	var links = $('.selector a');
	
	// TODO: Reduce with JQuery
	for (var i = 0; i < links.length; i++)
		if (links[i].href.indexOf(location.hash.split('-')[0]) != -1)
		{
			links[i].parentElement.classList.add('selected');
			
			subLinks = links[i].parentElement.getElementsByTagName('ul')[0];
			if (subLinks)
			{
				subLinks = subLinks.getElementsByTagName('a');
				for (var x = 0; x < subLinks.length; x++)
					if (subLinks[x].href.indexOf(location.hash) != -1)
					{
						subLinks[x].parentElement.classList.add('selected');
						break;
					}
			}
			break;
		}
}

function developerOn() {
	lds.dm.koModel.developer_mode(true);
}

function developerOff() {
	lds.dm.koModel.developer_mode(false);
}