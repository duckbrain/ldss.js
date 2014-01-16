// Dependencies: media.js jquery.js

lds.LDSDB = function() {
	this.dbName = 'lds_catalog';
	this.dbVersion = 16;
	this.objectStores = {
			books: {
				keyPath: 'id',
				index: { url: 'url', gl_uri: 'gl_uri' },
				updateDelete: true,
				children: { nodes: "nodes" },
				parent: { folders: "parent" }
			},
			folders: {
				keyPath: 'id',
				updateDelete: true,
				children: { books: "books", folders: "folders" },
				parent: { folders: "parent" }
			},
			nodes: {
				keyPath: ['bookid', 'id'],
				index: { gl_uri: 'gl_uri' },
				updateDelete: true,
				children: { nodes: "nodes" },
				parent: { nodes: ["parent", "bookid"], books: "bookid" }
			}
		};
	
	// Should be set to one of the request functions in the class when open called
	this.onopen = function() {};
	
	// Occurs when one of the request functions finish as a callback
	this.onrequestcomplete = function() {};
	
	this.catalogInfo = {};
	this.populateCatalog = function() {
		var onrequestcomplete = this.onrequestcomplete;
		if (this.db == null)
		{
			this.onopen = this.populateCatalog;
			this.open();
			return;
		}
		
		var self = this;
		var requestsOpen = 0;
		var transaction = this.db.transaction(["books", "folders"], "readwrite");
		var booksStore = transaction.objectStore('books');
		var foldersStore = transaction.objectStore('folders');
		
		transaction.onerror = this.onerrorData({transaction: transaction});
		
		var booksStoreClearRequest = booksStore.clear();
		var foldersStoreClearRequest = foldersStore.clear();
		
		var onclear = function() {
			if (booksStoreClearRequest.readyState == foldersStoreClearRequest.readyState) {
				//Stores are cleared, add the new data
				
				var checkDone = function() {
					requestsOpen--;
					if (requestsOpen <= 0)
						onrequestcomplete();
				}; 
				
				//TODO: Add root elemnt id 0
				requestsOpen++;
				var root = {
					id: 0,
					name: self.catalogInfo.name,
					display_order: self.catalogInfo.display_order,
					books: [],
					folders: [],
					parent_id: null,
					subBooksDownloaded: 0,
					subBooksTotal: NaN
				};
				for (var j in self.catalogInfo.books)
					root.books[j] = self.catalogInfo.books[j].id;
				for (var j in self.catalogInfo.folders)
					root.folders[j] = self.catalogInfo.folders[j].id;
				foldersStore.put(root).onsuccess = checkDone;
				
				var recurseCatalog = function(folder) {
					for (var i in folder.books) {
						var b = folder.books[i];
						requestsOpen++;
						booksStore.put({
							id: b.id,
							name: b.name,
							display_order: b.display_order,
							description: b.description,
							url: b.url,
							gl_uri: b.gl_uri,
							parent_id: folder.id,
							downloaded: false
						}).onsuccess = checkDone;
					}
					for (var i in folder.folders) {
						var f = folder.folders[i];
						requestsOpen++;
						var entry = {
							id: f.id,
							name: f.name,
							display_order: f.display_order,
							books: [],
							folders: [],
							parent_id: folder.id,
							subBooksDownloaded: 0,
							subBooksTotal: NaN
						};
						for (var j in f.books)
							entry.books[j] = f.books[j].id;
						for (var j in f.folders)
							entry.folders[j] = f.folders[j].id;
						foldersStore.put(entry).onsuccess = checkDone;
						recurseCatalog(f);
					}
				}
				
				self.catalogInfo.id = 0;
				recurseCatalog(self.catalogInfo);
			}
		};
		
		booksStoreClearRequest.onsuccess = onclear;
		foldersStoreClearRequest.onsuccess = onclear;
		booksStoreClearRequest.onerror = this.onerrorData({request: booksStoreClearRequest, transaction: transaction});
		foldersStoreClearRequest.onerror = this.onerrorData({request: foldersStoreClearRequest, transaction: transaction});
	};

	this.bookContent = {};
	this.populateBook = function() {
		var onrequestcomplete = this.onrequestcomplete;
		if (this.db == null)
		{
			this.onopen = this.populateBook;
			this.open();
			return;
		}
		
		var self = this;
		var requestsOpen = 0;
		var transaction = this.db.transaction(["nodes", "books", "folders"], "readwrite");
		var nodesStore = transaction.objectStore('nodes');
		var booksStore = transaction.objectStore('books');
		var foldersStore = transaction.objectStore('folders');
		transaction.onerror = this.onerrorData({transaction: transaction});
		
		var checkDone = function() {
			requestsOpen--;
			if (requestsOpen <= 0)
				onrequestcomplete();
		};
		
		var recurseNodes = function(node) {
			for (var i in node.nodes) {
				var n = node.nodes[i];
				requestsOpen++;
				var entry = {
					content: n.content,
					id: n.id,
					bookid: self.bookContent.id,
					nodes: [],
					parent_id: n.parent_id,
					refs: n.refs,
					short_title: n.short_title,
					subtitle: n.subtitle,
					title: n.title,
					gl_uri: n.uri,
					url: self.bookContent.url
				};
				for (var j in n.nodes)
					entry.nodes[j] = n.nodes[j].id;
					
				nodesStore.put(entry).onsuccess = checkDone;
				recurseNodes(n);
			}
		}
		
		// TODO Set on each folder how many of it's sub books are downloaded.
		
		var folderCount = 0;
		
		var recurseFolder = function(folder, parents) {
			folderCount++;
			folder.booksDownloaded = 0;
			folder.totalBooks = 0;
			for (var f in folder.folders) {
				foldersStore.get(folder.folders[f]).onsuccess = function(subFolder) {
					var newParents = parents.slice(0);
					newParents.push(folder);
					recurseFolder(subFolder, newParents)
				};
			}
			for (var b in folder.books) {
				booksStore.get(folder.books[b]).onsuccess = function() {
					for (var i in parents) {
						parents[i].totalBooks++;
						
					}
				}
			}
		}
		
		var checkFolderCount = function() {
			folderCount--;
			if (folderCount == 0) {
				
			}
		}
		
		booksStore.index('gl_uri').get(self.bookContent.uri).onsuccess = function(e) {
			++requestsOpen;
			var book = e.target.result;
			if (!book) {
				--requestsOpen;
				alert("Error downloading book \"" + self.bookContent.name + "\". Please try again later.")
			}
			book.media = self.bookContent.media;
			book.nodes = [];
			book.downloaded = true;
			book.shortTitle = self.bookContent.shortTitle;
			for (var j in self.bookContent.nodes)
				book.nodes[j] = self.bookContent.nodes[j].id;
			booksStore.put(book).onsuccess = checkDone;
			recurseNodes(self.bookContent);
			//foldersStore.get(0).onsuccess = function(baseFolder) {
			//	recurseFolder(baseFolder, [])
			//};
		};
	};

	this.getID = 0;
	this.recursiveMode = false;
	this.getFolder = function() {
		var id = this.getID;
		var onrequestcomplete = this.onrequestcomplete;
		if (this.db == null)
		{
			this.onopen = this.getFolder;
			this.open();
			return;
		}
		
		var self = this;
		var transaction = this.db.transaction(["folders"]);
		var objectStore = transaction.objectStore('folders');
		var request = objectStore.get(id);
		request.onsuccess = function() {
			onrequestcomplete(request.result);
		}
		request.onerror = this.onerrorData({request: request, transaction: transaction});
	};
	
	this.getFolderBooks = function() {
		var id = this.getID;
		var recursive = this.recursiveMode;
		var onrequestcomplete = this.onrequestcomplete;
		if (this.db == null)
		{
			this.onopen = this.getFolderBooks;
			this.open();
			return;
		}
		
		var self = this;
		var transaction = this.db.transaction(["books", "folders"]);
		var booksStore = transaction.objectStore('books');
		var foldersStore = transaction.objectStore('folders');
		var requestsOpen = 0;
		
		if (Number.isNaN(id))
			console.error("id = NaN");
		
		var request = foldersStore.get(id);
		request.onsuccess = function() {
			var folder = request.result;
			
			if (typeof(folder) == 'undefined') {
				onrequestcomplete();
			}
			
			window.folder = folder;
		
			var checkDone = function() {
				requestsOpen--;
				if (requestsOpen <= 0) {
					onrequestcomplete(folder);
				}
			};
			var populateBook = function(folder, i) {
				var bookid = folder.books[i];
				requestsOpen++;
				var bookRequest = booksStore.get(bookid);
				bookRequest.onsuccess = function() {
					folder.books[i] = bookRequest.result;
					checkDone();
				};
				bookRequest.onerror = self.onerrorData({request: bookRequest, transaction: transaction});
			};
			var populateFolder = function(folder, i) {
				var folderid = folder.folders[i];
				requestsOpen++;
				var folderRequest = foldersStore.get(folderid);
				folderRequest.onsuccess = function() {
					var f = folderRequest.result;
					folder.folders[i] = f;
					if (recursive) {
						for (var j in f.books) {
							populateBook(f, j);
						}
						for (var j in f.folders) {
							populateFolder(f, j);
						}
					}
					checkDone();
				};
				folderRequest.onerror = self.onerrorData({request: folderRequest, transaction: transaction});
			};
			
			if (!folder) {
				checkDone();
				return;
			}
			
			for (var i in folder.books)
				populateBook(folder, i);
			for (var i in folder.folders)
				populateFolder(folder, i);
		}
		request.onerror = this.onerrorData({request: request, transaction: transaction});
	};
	
	this.getBook = function() {
		var id = this.getID;
		var gl_uri = this.getGl_uri;
		var onrequestcomplete = this.onrequestcomplete;
		if (this.db == null)
		{
			this.onopen = this.getBook;
			this.open();
			return;
		}
		
		var self = this;
		var transaction = this.db.transaction(["books"]);
		var objectStore = transaction.objectStore('books');
		if (id != null)
			var request = objectStore.get(id);
		else var request = objectStore.index('gl_uri').get(gl_uri);
		request.onsuccess = function() {
			onrequestcomplete(request.result);
		}
		request.onerror = this.onerrorData({request: request, transaction: transaction});
	};
	
	this.getBookNodes = function() {
		var id = this.getID;
		var gl_uri = this.getGl_uri;
		var onrequestcomplete = this.onrequestcomplete;
		var recursive = this.recursiveMode;
		if (this.db == null)
		{
			this.onopen = this.getBookNodes;
			this.open();
			return;
		}
		
		var self = this;
		var transaction = this.db.transaction(["books", "nodes"]);
		var booksStore = transaction.objectStore('books');
		var nodesStore = transaction.objectStore('nodes');
		var requestsOpen = 0;
		
		if (id != null)
			var request = booksStore.get(id);
		else var request = objectStore.index('gl_uri').get(gl_uri);
		request.onsuccess = function() {
			var book = request.result;
			
			if (typeof(book) == 'undefined') {
				onrequestcomplete();
			}
		
			var checkDone = function() {
				requestsOpen--;
				if (requestsOpen <= 0) {
					onrequestcomplete(book);
				}
			};
			
			var populateNode = function(book, i) {
				requestsOpen++;
				var nodeRequest = nodesStore.get([book.id, book.nodes[i]]);
				nodeRequest.onsuccess = function() {
					var n = nodeRequest.result;
					book.nodes[i] = n;
					if (recursive) {
						for (var j in n.nodes) {
							populateNode(n, j);
						}
					}
					checkDone();
				};
				nodeRequest.onerror = self.onerrorData({request: nodeRequest, transaction: transaction});
			};
			
			for (var i in book.nodes)
				populateNode(book, i);
		}
		request.onerror = this.onerrorData({request: request, transaction: transaction});
	};
	
	this.getNode = function() {
		var id = this.getID;
		var gl_uri = this.getGl_uri;
		var onrequestcomplete = this.onrequestcomplete;
		if (this.db == null)
		{
			this.onopen = this.getNode;
			this.open();
			return;
		}
		
		var self = this;
		var transaction = this.db.transaction(["nodes"]);
		var objectStore = transaction.objectStore('nodes');
		if (id != null)
			var request = objectStore.get(id);
		else var request = objectStore.index('gl_uri').get(gl_uri);
		
		request.onsuccess = function() {
			onrequestcomplete(request.result);
		}
		request.onerror = this.onerrorData({request: request, transaction: transaction});
	};
	
	this.getNodeNodes = function() {
		var id = this.getID;
		var gl_uri = this.getGl_uri;
		var onrequestcomplete = this.onrequestcomplete;
		var recursive = this.recursiveMode;
		if (this.db == null)
		{
			this.onopen = this.getNodeNodes;
			this.open();
			return;
		}
		
		var self = this;
		var transaction = this.db.transaction(["nodes"]);
		var objectStore = transaction.objectStore('nodes');
		var requestsOpen = 0;
		
		if (id != null)
			var request = objectStore.get(id);
		else var request = objectStore.index('gl_uri').get(gl_uri);
		request.onsuccess = function() {
			var parent = request.result;
			
			if (typeof(parent) == 'undefined') {
				onrequestcomplete();
			}
		
			var checkDone = function() {
				requestsOpen--;
				if (requestsOpen <= 0) {
					onrequestcomplete(parent);
				}
			};
			
			var populateNode = function(parent, i) {
				requestsOpen++;
				var request = objectStore.get([parent.bookid, parent.nodes[i]]);
				request.onsuccess = function() {
					var n = request.result;
					parent.nodes[i] = n;
					if (recursive) {
						for (var j in n.nodes) {
							populateNode(n, j);
						}
					}
					checkDone();
				};
				request.onerror = self.onerrorData({request: request, transaction: transaction});
			};
			
			if (parent.nodes.length > 0) {
				for (var i in parent.nodes)
					populateNode(parent, i);
			} else {
				onrequestcomplete(parent);
			}
		}
		request.onerror = this.onerrorData({request: request, transaction: transaction});
	};
	
	this.getNodeInfo = function() {
		var id = this.getID;
		var gl_uri = this.getGl_uri;
		var onrequestcomplete = this.onrequestcomplete;
		if (this.db == null)
		{
			this.onopen = this.getNodeInfo;
			this.open();
			return;
		}
		
		var self = this;
		var transaction = this.db.transaction(["nodes", "books"]);
		var objectStore = transaction.objectStore('nodes');
		var booksStore = transaction.objectStore('books');
		if (id != null)
			var request = objectStore.get(id);
		else var request = objectStore.index('gl_uri').get(gl_uri);
		var returnInfo = { };	
		
		var checkDone = function() {
			if ('previous' in returnInfo 
			 && 'up' in returnInfo 
			 && 'next' in returnInfo
			 && 'current' in returnInfo)
				onrequestcomplete(returnInfo);
		}
		
		request.onsuccess = function() {
			var node = request.result;
			returnInfo.current = node;
			var parentRequest;
			if (node.parent_id == null) // Parent is a book
				parentRequest = booksStore.get(node.bookid);
			else
				parentRequest = objectStore.get([node.bookid, node.parent_id]);
			parentRequest.onsuccess = function(val) {
				var parent = parentRequest.result;
				var i = parent.nodes.indexOf(node.id);
				returnInfo.up = parentRequest.result;
				if (i > 0) {
					var previousRequest = objectStore.get([node.bookid, parent.nodes[i - 1]]);
					previousRequest.onsuccess = function() {
						returnInfo.previous = previousRequest.result;
						checkDone();
					};
				} else returnInfo.previous = null;
				if (i < parent.nodes.length - 1) {
					var nextRequest = objectStore.get([node.bookid, parent.nodes[i + 1]]);
					nextRequest.onsuccess = function() {
						returnInfo.next = nextRequest.result;
						checkDone();
					};
				} else returnInfo.next = null;
				checkDone();
			};
			
			onrequestcomplete(request.result);
		}
		request.onerror = this.onerrorData({request: request, transaction: transaction});
	};
	
	this.getBookInfo = function() {
		var id = this.getID;
		var gl_uri = this.getGl_uri;
		var onrequestcomplete = this.onrequestcomplete;
		if (this.db == null)
		{
			this.onopen = this.getBookInfo;
			this.open();
			return;
		}
		
		var self = this;
		var transaction = this.db.transaction(["books", "folders"]);
		var objectStore = transaction.objectStore('books');
		var foldersStore = transaction.objectStore('folders');
		if (id != null)
			var request = objectStore.get(id);
		else var request = objectStore.index('gl_uri').get(gl_uri);
		var returnInfo = { };	
		
		var checkDone = function() {
			if ('previous' in returnInfo 
			 && 'up' in returnInfo 
			 && 'next' in returnInfo
			 && 'current' in returnInfo)
				onrequestcomplete(returnInfo);
		}
		
		request.onsuccess = function() {
			var book = request.result;
			returnInfo.current = book;
			var parentRequest;
			parentRequest = foldersStore.get(book.parent_id);
			parentRequest.onsuccess = function(val) {
				var parent = parentRequest.result;
				var i = parent.books.indexOf(book.id);
				returnInfo.up = parent;
				if (i > 0) {
					var previousRequest = objectStore.get(parent.books[i - 1]);
					previousRequest.onsuccess = function() {
						returnInfo.previous = previousRequest.result;
						checkDone();
					};
				} else returnInfo.previous = null;
				if (i < parent.books.length - 1) {
					var nextRequest = objectStore.get(parent.books[i + 1]);
					nextRequest.onsuccess = function() {
						returnInfo.next = nextRequest.result;
						checkDone();
					};
				} else returnInfo.next = null;
				checkDone();
			};
			
			onrequestcomplete(request.result);
		}
		request.onerror = this.onerrorData({request: request, transaction: transaction});
	};
	
	this.getFolderInfo = function() {
		var id = this.getID;
		var gl_uri = this.getGl_uri;
		var onrequestcomplete = this.onrequestcomplete;
		
		if (id == 0) {
			onrequestcomplete({
				previous: null,
				up: null,
				next: null,
				current: null
			});
			return;
		}
		
		if (this.db == null)
		{
			this.onopen = this.getFolderInfo;
			this.open();
			return;
		}
		
		var self = this;
		var transaction = this.db.transaction(["folders"]);
		var objectStore = transaction.objectStore('folders');
		if (id != null)
			var request = objectStore.get(id);
		else var request = objectStore.index('gl_uri').get(gl_uri);
		var returnInfo = { };	
		
		var checkDone = function() {
			if ('previous' in returnInfo 
			 && 'up' in returnInfo 
			 && 'next' in returnInfo
			 && 'current' in returnInfo)
				onrequestcomplete(returnInfo);
		}
		
		request.onsuccess = function() {
			var folder = request.result;
			returnInfo.current = folder;
			var parentRequest;
			parentRequest = objectStore.get(folder.parent_id);
			parentRequest.onsuccess = function(val) {
				var parent = parentRequest.result;
				var i = parent.folders.indexOf(folder.id);
				returnInfo.up = parent;
				if (i > 0) {
					var previousRequest = objectStore.get(parent.folders[i - 1]);
					previousRequest.onsuccess = function() {
						returnInfo.previous = previousRequest.result;
						checkDone();
					};
				} else returnInfo.previous = null;
				if (i < parent.folders.length - 1) {
					var nextRequest = objectStore.get(parent.folders[i + 1]);
					nextRequest.onsuccess = function() {
						returnInfo.next = nextRequest.result;
						checkDone();
					};
				} else returnInfo.next = null;
				checkDone();
			};
			
			onrequestcomplete(request.result);
		}
		request.onerror = this.onerrorData({request: request, transaction: transaction});
	};
};

lds.LDSDB.prototype = new lds.DB();
