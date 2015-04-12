function DownloadModel(database) {
	var that = this;
	var downloads = [];

	that.CatalogInstaller = LDSCatalogInstaller;
	that.BookInstaller = LDSZBookInstaller;
	that.progress = function() {};

	function progress(message) {
		return function(data) {
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
		return database.node.get(bookId).then(function(book) {
			return database.contentProvider.getBook(book.details.url)
				.then(progress('installing book'))
				.then(function(sqlitedb) {
					// TODO: Check this for memory leaks. This is a lot of data.
					var installer = new that.BookInstaller(database.node, book);
					installer.progress = that.progress;
					var p = installer.install(sqlitedb);
					sqlitedb.close();
					delete sqlitedb;
					return p;
				}).then(progress('loading page'));
		});
	}

	that.downloadCatalog = downloadCatalog;
	that.downloadBook = downloadBook;
}
