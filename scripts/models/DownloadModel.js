function DownloadModel(database) {
	var that = this;
	var queue = [];
	var queueRunning = false;
	var libs = {};
	var queue = [];

	var onQueueChanged = new EventHandler();
	var onStatusChanged = new EventHandler();

	that.CatalogInstaller = LDSCatalogInstaller;
	that.BookInstaller = LDSZBookInstaller;

	function getQueue() {
		return queue;
	}

	function getLib(name, url) {
		if (!(name in window)) {
			database.downloader.require(url);
			var lib = window[name];
			libs[name] = lib;
			return lib;
		}
	}

	function downloadInitial() {
		//Check if downloads are needed and start them automatically.
		database.options.get('language').then(function(languageId) {
			return database.node.getPath(languageId, '/')
			.then(function (catalog) {
				if (!catalog) {
					return downloadCatalogWithLanguageId(languageId).then(function() {
						database.node.getPath(languageId, '/scriptures').then(downloadFolder)
					});
				}
			})
		});
	}

	function downloadFolder(folder) {
		folder.children.forEach(function (child) {
			if (child.type == 'book') downloadBook(child);
			if (child.type == 'folder') downloadFolder(child);
		});
	}

	function downloadBook(book) {
		return addToQueue('book', book.name, function() {

			getLib('pako', 'scripts/dependencies/pako.js');
			getLib('sql', 'scripts/dependencies/sql.js');

			return database.contentProvider.getBook(book).then().then(function (blob) {
				var sqlitedb = new SQL.Database(pako.inflate(blob));
				delete blob;
				var installer = new that.BookInstaller(database.node, book);
				var p = installer.install(sqlitedb);
				sqlitedb.close();
				return p;
			});
		});

		startQueue();
	}

	function downloadCatalogWithLanguageId(languageId) {
		return database.language.get(languageId).then(downloadCatalog);
	}

	function downloadCatalog(language) {
		return addToQueue('catalog', 'Catalog of ' + language.name, function() {
			var installer = new that.CatalogInstaller(database.node, language.id);
			return database.contentProvider.getCatalog(language.id).then(installer.install);
		});
	}

	function addToQueue(type, title, installer) {
		return new Promise(function(fulfill, reject) {
			queue.push(new DownloadItem(type, title, function() {
				return installer().then(fulfill, reject);
			}));
			onQueueChanged.fire();
			startQueue();
		});
	}

	function startQueue() {
		if (!queueRunning) {
			startNext();
		}
	}

	function startNext() {
		var info = queue[0];
		queueRunning = true;
		info.status = 'downloading';
		info.install().then(info.fulfill, info.reject).then(downloadFinished);
	}

	function downloadFinished() {
		queue.shift();
		onQueueChanged.fire(getQueue());
		if (0 < queue.length) {
			startNext();
		} else {
			queueRunning = false;
		}
	}

	that.getQueue = getQueue;
	that.downloadInitial = downloadInitial;
	that.downloadCatalog = downloadCatalog;
	that.downloadBook = downloadBook;
	that.downloadFolder = downloadFolder;
	that.subscribeQueueChanged = onQueueChanged.add;
	that.subscribeStatusChanged = onStatusChanged.add;
}

function DownloadItem(type, title, installer) {
	this.type = type;
	this.title = title;
	this.status = 'waiting';
	this.install = installer;
}
