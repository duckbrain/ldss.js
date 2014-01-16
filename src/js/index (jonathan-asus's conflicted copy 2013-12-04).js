lds.index = {
	folderFile: location.pathname,
	bookFile: location.pathname,
	nodeFile: location.pathname,
	ldsorg_gl_uri: 'http://www.lds.org'
};

window.onpopstate = function() {
	//Load the new popstate
	var popstate = history.state;
	if (popstate == null) {
		//TODO: Set popstate based on URL.
		var q = location.href.substring(location.href.lastIndexOf('?') + 1);
		if (location.href.lastIndexOf('?') == -1 || q.length == 0) {
			popstate = { folder: 0 };
		} else if (!isNaN(parseInt(q))) {
			// Folder ID
			popstate = { folder: parseInt(q) };
		} else if (q.indexOf('/') === 0) {
			// Remove trailing '/'
			if (q.lastIndexOf('/') === q.length - 1)
				q = q.substring(0, q.length - 1);
			popstate = {};
			
			// Check for verse id
			var hashIndex = q.indexOf('#');
			if (hashIndex != -1) {
				var hash = q.substring(hashIndex + 1);
				var verses;
				q = q.substring(0, hashIndex);
				
				if (hash.indexOf(',') == -1 && hash.indexOf('-') == -1) {
					// Could be a footnote
					var parsedHash = parseInt(hash);
					if (!isNaN(parsedHash) && parsedHash.toString() != hash) {
						verses = [ parsedHash ];
						refrence = hash;
					}
				}
				else {
					verses = hash.split(',');
					for (var i in verses) {
						if (typeof (verses[i]) != 'string')
							continue;
						var range = parseInt(verses[i].split('-'));
						if (range.length == 2) {
							verses.splice(i, 1);
							for (var j = range[0]; j <= range[1]; j++)
								verses.push(j);
						}
					}
					parseInt(verses);		
				}
				popstate.verses = verses;
				popstate.hash = hash;
				console.debug(popstate);
			}
			
			// gl_uri book or node
			lds.db.getID = null;
			lds.db.getGl_uri = q;
			lds.db.onopen = function() {
				var open = 2;
				lds.db.onrequestcomplete = function(e) {
					console.debug(e);
					if (e != null) {
						if ('bookid' in e) {
							popstate.node = e.id;
							popstate.book = e.bookid;
						}
						else {
							popstate.book = e.id;
						}
						history.replaceState(popstate, "", "index.html");
						window.onpopstate();
					} else {
						open--;
						if (!open) {
							$('#content').html('Path ' + q + ' not found');
						}
					}
				};
				lds.db.getBook();
				lds.db.getNode();
			};
			lds.db.open();
			
			return;
		} else {
			// Search
			// TODO: Implement Searching
			$('#content').html('You searched for: ' + decodeURI(q));
			return;
		}
	}
	
	if ('node' in popstate) {
		// Load the node index
		lds.db.onrequestcomplete = function(data) {
			if (data == null) {
				alert("The book has not been downloaded. You will now be taken to the catalog page to download it.");
				location.href = "options.html#main-database";
				return;
			}
			
			presentNode(data);
			
			lds.db.onrequestcomplete = function(info) {
				presentToolbar(info);
			};
			lds.db.getNodeInfo();
			
			var hash = 'hash' in popstate ? "#" + popstate.hash : ''
			history.replaceState(popstate, "", lds.index.nodeFile + "?" + data.gl_uri + hash);
		}
		lds.db.getID = [popstate.book, popstate.node];
		lds.db.getNodeNodes();
		
	} else if ('book' in popstate) {
		// Load the book index
		lds.db.onrequestcomplete = function(data) {
			if (data == null) {
				alert("The book has not been downloaded. You will now be taken to the catalog page to download it.");
				location.href = "options.html#main-database";
				return;
			}
			
			presentBook(data);
			history.replaceState(popstate, "", lds.index.bookFile + "?" + data.gl_uri);
		}
		lds.db.onerror = function(data) {
			alert("Book not downloaded");
		}
		lds.db.getID = popstate.book;
		lds.db.getBookNodes();
		
	} else {
		// Load the folder index
		if (!('folder' in popstate))
			popstate.folder = 0;
		lds.db.onrequestcomplete = function(data) {
			if (data == null) {
				alert("The index has not been downloaded. You will now be taken to the catalog page to download it.");
				location.href = "options.html#main-database";
				return;
			}
			
			presentFolder(data);
			history.replaceState(popstate, "", lds.index.folderFile + "?" + data.id);
		}
		lds.db.getID = popstate.folder;
		lds.db.getFolderBooks();
	}
	
}

function openUri(gl_uri) {
	// TODO Search throught the 
	lds.db.getID = null;
	lds.db.getGl_uri = gl_uri;
	lds.db.onrequestcomplete = function(e) {
		if (e == null)
			return;
		if ('bookid' in e) {
			var state = { book: e.bookid, node: e.id };
			history.replaceState(state, "", lds.index.nodeFile + "?" + data.gl_uri);
		} else {
			var state = { book: e.id };
			history.replaceState(popstate, "", lds.index.bookFile + "?" + data.gl_uri);
		}
		
	}
	lds.db.getBook();
	lds.db.getNode();
}

function presentFolder(data) {
	console.log(data);
	//TODO: Pull from internationalized string
	var appName = 'LDS Scriptures';
	if (data.id == 0)
		data.name = appName;
	
	var html = new lds.HTMLBuilder();
	html.append('h1').text(data.name).append('ul');
	for (var i in data.books) {
		var book = data.books[i];
		var classes = ['book'];
		if (!book.downloaded)
			classes.push('not-downloaded');
		html.child('li').class(classes);
		html.a(book.downloaded ? lds.index.bookFile + '?' + book.gl_uri : '', { 'data-bookid': book.id }).text(book.name);
		html.a(lds.index.ldsorg_gl_uri + book.gl_uri, { target: '__blank' }).text('');
		html.close();
	}
	for (var i in data.folders) {
		var folder = data.folders[i];
		html.child('li').class('folder');
		html.child('a').data({folderid:folder.id});
		html.text(folder.name);
		html.close();
	}
	$('#content').html(html.getHTML());
	$('#content a').unbind( "click" );
	$('#content a[data-folderid]').click(onFolderClick);
	$('#content a[data-bookid]').click(onBookClick);
	
	var suffix = '';
	if (data.id == 0)
		$('#title').html(appName)
	else
		$('#title').html(appName + ' - ' + data.name + suffix)
	$('#refs').hide();
}

function presentBook(data) {
	console.log(data);
	var html = new lds.HTMLBuilder();
	html.append('h1').text(data.name).append('ul');
	for (var i in data.nodes) {
		var node = data.nodes[i];
		html.li().class('node')
		html.child('a').data({
			nodeid: node.id,
			bookid: node.bookid
		});
		html.text(node.title);
	}
	$('#content').html(html.getHTML());
	$('#content a').unbind( "click" );
	$('#content a').click(onNodeClick);
	
	var suffix = '';
	var appName = 'LDS Scriptures';
	$('#title').html(appName + ' - ' + data.shortTitle + suffix)
	$('#refs').hide();
}

function presentNode(data) {
	console.log(data);
	if (data.nodes.length > 0) {
		var html = new lds.HTMLBuilder();
		html.append('h1').text(data.title);
		for (var i in data.nodes) {
			var node = data.nodes[i];
			html.append('a').data({
				nodeid: node.id,
				bookid: node.bookid
			});
			html.text(node.title);
			html.append('br');
		}
		$('#content').html(html.getHTML());
		$('#content a').unbind( "click" );
		$('#content a').click(onNodeClick);
	} else {
		$('#content').html(data.content);
		$('#content a').click(onRefrenceClick)
	}
	if (!lds.dm.koModel.show_footnote_letters())
		$('pre').hide();
	else $('pre').show();
	
	var suffix = '';
	var appName = 'LDS Scriptures';
	var prefixes = ['Chapter', 'Section'];
	for (var i in prefixes) {
		var pre = prefixes[i] + ' ';
		if (data.title.indexOf(pre) != -1)
			suffix = ' ' + data.title.substring(data.title.indexOf(pre) + pre.length);
	}
	$('#title').html(appName + ' - ' + data.short_title + suffix);
	$('#refs').html(data.refs).show();
	
	$('#refs a').each(function(e) {
		var parts = this.pathname.split('.');
		var href = parts[0];
		parts.splice(0,1);
		if (parts.length > 0) href += "#";
		href += parts.join(',');
		this.href = 'index.html?' + href;
	});
	
	applyOnNodeLoad();
}

function presentToolbar(info) {
	console.log(info);
	
	var setNodeLink = function(selector, node) {
		if (node)
			$(selector).attr('href', 'index.html?' + node.gl_uri)
				.data('nodeid', node.id)
				.data('bookid', node.bookid)
				.off('click').on('click', onNodeClick);
		else 
			$(selector).attr('href', '#')
				.data('nodeid', '')
				.data('bookid', '')
				.off('click');
	};
	
	setNodeLink('#uplevel', info.up);
	setNodeLink('#previous', info.previous);
	setNodeLink("#next", info.next);
}

function onFolderClick(e) {
	history.pushState({
		folder: parseInt($(e.target).data('folderid'))
	}, "", "index.html");
	window.onpopstate();
	return false;	
}

function onBookClick(e) {
	history.pushState({
		book: parseInt($(e.target).data('bookid'))
	}, "", "index.html");
	window.onpopstate();
	return false;
}

function onNodeClick(e) {
	history.pushState({
		node: parseInt($(e.target).data('nodeid')),
		book: parseInt($(e.target).data('bookid'))
	}, "", "index.html");
	window.onpopstate();
	return false;
}

function onRefrenceClick(e) {
	var rowpos = $('#refs div:last').position();
	$(e.target.hash).animate({ scrollTop: rowpos.top + "px" });
	$(document.body).addClass('showrefs');
}


// Apply Event Handlers
$('#autoscroll-link').click(function() {
	var box = $('autoscroll-box')
	box.checked(!box.checked());
})

