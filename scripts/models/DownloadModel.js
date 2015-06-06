function DownloadModel(database) {
	var that = this;
	var downloads = [];
	var libs = {};
	var queue = [];

	function getLib(name, url) {
		if (!(name in window)) {
			database.downloader.require(url);
			libs[name] = lib;
			return lib;
		}
	}

	function progress(message) {
		return function (data) {
			that.progress(message);
			return data;
		}
	}

	function getQueue() {
		return Promise.resolve(queue);
	}

	function downloadCatalog(languageId) {
		var installer = new that.CatalogInstaller(database, languageId);
		installer.progress = that.progress;
		return database.contentProvider.getCatalog(languageId)
			.then(progress('installing catalog'))
			.then(installer.install)
			.then('loading page');
	}

	function downloadBook(bookId) {
		var book;

		getLib('pako', 'scripts/dependencies/pako.js');
		getLib('sql', 'scripts/dependencies/sql.js');

		return database.node.get(bookId).then(function (b) {
					book = b;
					return database.contentProvider.getBook(book)
				})
			.then(progress('installing book'))
			.then(function (blob) {
				var sqlitedb, installer, p;
				sqlitedb = new SQL.Database(pako.inflate(blob));
				delete blob;
				installer = new that.BookInstaller(database.node, book);
				installer.progress = that.progress;
				p = installer.install(sqlitedb);
				sqlitedb.close();
				delete sqlitedb;
				return p;
			}).then(progress('loading page'));
	}

	function makeDownload(download) {
		return function(id) {
			return new Promise(function(fulfill, reject) {
				queue.push({
					method: download,
					id: id,
					fulfill: fulfill,
					reject: reject
				});
				if (queue.length == 1) {
					stepQueue();
				}
			});
		}
	}

	function stepQueue() {
		var action = queue.shift();
		action.method(action.id).then(function(result) {
			action.fulfill(result);
			stepQueue();
		}, function(result) {
			action.reject(result);
			stepQueue();
		});
	}

	that.progress = function () {};
	that.downloadCatalog = makeDownload(downloadCatalog);
	that.downloadBook = makeDownload(downloadBook);
}
