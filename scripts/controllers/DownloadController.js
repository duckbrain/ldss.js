function DownloadController(model, view) {
	var that = this;
	var queue = [];
	var queueRunning = false;

	that.CatalogInstaller = LDSCatalogInstaller;
	that.BookInstaller = LDSZBookInstaller;

	function start() {
		//view.subscribeDownloadCatalogRequested(downloadCatalog);
		//view.subscribeDownloadBookRequested(downloadBook);

		model.options.get('language').then(function(languageId) {
			return model.node.getPath(languageId, '/')
			.then(function (catalog) {
				if (!catalog) {
					return downloadCatalogWithLanguageId(languageId).then(function() {
						model.node.getPath(languageId, '/scriptures').then(downloadFolder)
					});
				}
			})
		});

		//TODO: Check if downloads are needed and start them automatically.
	}

	function save() {

	}

	function load() {

	}

	function updateView() {
		view.setDownloadQueue(queue);
		updateCurrent();
	}

	function updateCurrent() {
		view.setDownloadStatus(queue[0]);
	}

	function downloadFolder(folder) {
		folder.children.forEach(function (child) {
			if (child.type == 'book') downloadBook(child);
			if (child.type == 'folder') downloadFolder(child);
		})
	}

	function downloadBook(book) {
		return addToQueue('book', function() {

			getLib('pako', 'scripts/dependencies/pako.js');
			getLib('sql', 'scripts/dependencies/sql.js');

			return model.contentProvider.getBook(book).then().then(function (blob) {
				var sqlitedb = new SQL.Database(pako.inflate(blob));
				delete blob;
				var installer = new that.BookInstaller(model.node, book);
				var p = installer.install(sqlitedb);
				sqlitedb.close();
				return p;
			});
		});

		startQueue();
	}

	function downloadCatalogWithLanguageId(languageId) {
		return model.language.get(languageId).then(downloadCatalog);
	}

	function downloadCatalog(language) {
		return addToQueue('catalog', function() {
			var installer = new that.CatalogInstaller(model.node, language.id);
			return model.contentProvider.getCatalog(language.id).then(installer.install)
		});
	}

	function addToQueue(type, installer) {
		return new Promise(function(fulfill, reject) {
			queue.push(new DownloadItem(type, function() {
				return installer().then(fulfill, reject);
			}));
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
		if (0 < queue.length) {
			startNext();
		} else {
			queueRunning = false;
		}
	}

	this.start = start;
}

function DownloadItem(type, installer) {
	this.type = type;
	this.status = 'waiting';
	this.install = installer;
}
