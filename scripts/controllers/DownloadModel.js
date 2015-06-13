function DownloadModel(database) {
	var that = this;
	var downloads = [];
	var libs = {};

	function getLib(name, url) {
		if (name in libs) {
			return libs[name];
		} else {
			var lib = database.downloader.require(url);
			libs[name] = lib;
			return lib;
		}
	}


	that.CatalogInstaller = LDSCatalogInstaller;
	that.BookInstaller = LDSZBookInstaller;
	that.progress = function () {};

	function progress(message) {
		return function (data) {
			that.progress(message);
			return data;
		}
	}

	function downloadCatalog(languageId) {
		var installer = new that.CatalogInstaller(database.node, languageId);
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

	that.downloadCatalog = downloadCatalog;
	that.downloadBook = downloadBook;
}