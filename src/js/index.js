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
			
			if (q.indexOf('/search') === 0) {
				if (q.indexOf('/search=') === 0) {
					q = decodeURI(q.substring(8));
					//TODO: Search and display results
					$('#content').html("You searched \"" + q + "\"");
					lds.db.query = q;
					lds.db.onrequestcomplete = function(e) {
						presentSearch(q, e);
					};
					lds.db.search();
				} else {
					//TODO: Display search box page
					$('#content').html("You need a search");
				}
				return;
			}
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
				//alert("The book has not been downloaded. You will now be taken to the catalog page to download it.");
				//location.href = "options.html#main-database";
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
				//alert("The book has not been downloaded. You will now be taken to the catalog page to download it.");
				//location.href = "options.html#main-database";
				return;
			}
			
			presentBook(data);
			lds.db.onrequestcomplete = function(info) {
				presentToolbar(info);
			};
			lds.db.getBookInfo();
			
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
			if (!data && window == window.top) {
				//alert("The index has not been downloaded. You will now be taken to the catalog page to download it.");
				//location.href = "options.html#main-database";
				window.onpopstate = null;
				return;
			}
			
			presentFolder(data);
			lds.db.onrequestcomplete = function(info) {
				presentToolbar(info);
			};
			lds.db.getFolderInfo();
			
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
	if (!data) return;
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
		html.a(book.downloaded ? lds.index.bookFile + '?' + book.gl_uri : '').data({bookid: book.id, downloadurl: book.url});
		html.text(book.name);
		//html.a(lds.index.ldsorg_gl_uri + book.gl_uri, { target: '__blank' }).text('');
		html.close();
	}
	for (var i in data.folders) {
		var folder = data.folders[i];
		html.child('li').class('folder');
		html.a(lds.index.folderFile + '?' + folder.id).data({folderid:folder.id});
		//html.child('i').class(['fa', 'fa-folder']).close();
		html.text(folder.name);
		html.close();
	}
	$('#content').html(html.getHTML());
	$('#content a').off('click');
	$('#content a[data-folderid]').off('click').click(onFolderClick);
	$('#content :not(.not-downloaded) a[data-bookid]').off('click').click(onBookClick);
	$('#content .not-downloaded a[data-bookid]').off('click').click(function(x) {
		x.preventDefault();
		if (true) { //confirm("Would you like to download this title?")) {
			var e = $(x.target);
			e.disable();
			lds.catalog.downloadQueue.push({ 
				url: e.data('downloadurl'), 
				callback: onBookDownloaded, 
				button: x.target,
				id: parseInt(e.data('bookid'))
			});
			lds.catalog.downloadBook();
		}
	});
	
	var suffix = '';
	if (data.id == 0)
		$('#title').html(appName)
	else
		$('#title').html(appName + ' - ' + data.name + suffix)
	setRefrences(false);
}

function presentBook(data) {
	console.log(data);
	$('a').off("click");
	var html = new lds.HTMLBuilder();
	html.append('h1').text(data.name).append('ul');
	for (var i in data.nodes) {
		var node = data.nodes[i];
		html.li().class('node')
		html.a(lds.index.nodeFile + "?" + node.gl_uri).data({
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
	setRefrences(false);
}

function presentNode(data) {
	console.log(data);
	$('a').off("click");
	if (data.nodes.length > 0) {
		var html = new lds.HTMLBuilder();
		html.append('h1').text(data.title).close();
		html.ul();
		for (var i in data.nodes) {
			var node = data.nodes[i];
			html.li();
			html.a(lds.index.nodeFile + "?" + node.gl_uri).data({
				nodeid: node.id,
				bookid: node.bookid
			});
			html.text(node.title).close();
		}
		$('#content').html(html.getHTML());
		$('#content a').off("click").click(onNodeClick);
	} else {
		$('#content').html(data.content);
		$('#content a').click(onRefrenceClick)
	}
	if (!lds.dm.koModel.show_footnote_letters())
		$('sup').hide();
	else $('sup').show();
	
	var suffix = '';
	var appName = 'LDS Scriptures';
	var prefixes = ['Chapter', 'Section'];
	for (var i in prefixes) {
		var pre = prefixes[i] + ' ';
		if (data.title.indexOf(pre) != -1)
			suffix = ' ' + data.title.substring(data.title.indexOf(pre) + pre.length);
	}
	$('#title').html(appName + ' - ' + data.short_title + suffix);
	$('#ref-content').html(data.refs);
	
	$('#ref-content a').each(function(e) {
		var parts = this.pathname.split('.');
		var href = parts[0];
		parts.splice(0,1);
		if (parts.length > 0) href += "#";
		href += parts.join(',');
		this.href = 'index.html?' + href;
	});
	setRefrences(false);
	applyOnNodeLoad();
}

function presentToolbar(info) {
	console.log(info);
	
	var setLink = function(selector, node) {
		if (typeof(node) == "object" && node != null) {
			if ('bookid' in node)
				$(selector).attr('href', 'index.html?' + node.gl_uri)
					.data('folderid', '')
					.data('nodeid', node.id)
					.data('bookid', node.bookid)
					.off('click').on('click', onNodeClick);
			else if ('folders' in node)
				$(selector).attr('href', 'index.html?' + node.id)
					.data({
						folderid: node.id,
						bookid: "",
						nodeid: ""
					}).off('click').on('click', onFolderClick);
			else
				$(selector).attr('href', 'index.html?' + node.gl_uri)
					.data('folderid', '')
					.data('bookid', node.id)
					.data('nodeid', '')
					.off('click').on('click', onBookClick);
		}
		else
			$(selector).attr('href', '')
				.data('nodeid', '')
				.data('bookid', '')
				.off('click');
	};
	
	setLink('#uplevel', info.up);
	setLink('#previous', info.previous);
	setLink("#next", info.next);
}

function presentSearch(query, results) {
	console.log(results);
	$('a').off("click");
	var html = new lds.HTMLBuilder();
	var title = 'Results for "' + query + '"';
	html.append('h1').text(title).append('ul');
	for (var i = 0; i < results.length; ++i) {
		var node = results[i];
		html.li().class('node')
		html.a(lds.index.nodeFile + "?" + node.gl_uri).data({
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
	$('#title').html(appName + ' - ' + title)
	setRefrences(false);
}

function onBookDownloaded(e) {
	var b = $(e.button);
	b.enable();
	b.parent().removeClass("not-downloaded");
	b.off("click").on("click", onBookClick);
}

function onFolderClick(e) {
	e.preventDefault();
	history.pushState({
		folder: parseInt($(e.currentTarget).data('folderid'))
	}, "", "index.html");
	window.onpopstate();
}

function onBookClick(e) {
	e.preventDefault();
	history.pushState({
		book: parseInt($(e.currentTarget).data('bookid'))
	}, "", "index.html");
	window.onpopstate();
}

function onNodeClick(e) {
	e.preventDefault();
	history.pushState({
		node: parseInt($(e.currentTarget).data('nodeid')),
		book: parseInt($(e.currentTarget).data('bookid'))
	}, "", "index.html");
	window.onpopstate();
}

function onRefrenceClick(e) {
	//TODO: The link could be to a gl_uri. If this is so, we should try to go there
	e.preventDefault();
	var rowpos = $('#ref-content div:last').position();
	$(e.currentTarget.hash).animate({ scrollTop: rowpos.top + "px" });
	$(document.body).addClass('showrefs');
}

function setRefrences(s) {
	if (s) {
		$(document.body).addClass('showrefs');
	} else {
		$(document.body).removeClass('showrefs');
	}
}


// Apply Event Handlers
$('#autoscroll-link').click(function() {
	var box = $('autoscroll-box')
	box.checked(!box.checked());
})
$('#searchshow').click(function() {
	var b = $(document.body);
	var c = 'showsearch';
	if (b.hasClass(c))
		b.removeClass(c);
	else
		b.addClass(c);
});
$('#ref-close').click(function() { setRefrences(false); });

//
// Register Bookmarks
//
lds.bookmarks = new lds.BookmarkManager();
lds.bookmarks.reloadBookmarks();
$('#bookmark').click(function() { lds.bookmarks.save() })
