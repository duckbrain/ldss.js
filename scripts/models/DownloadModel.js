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
			.then(progress('downloaded'))
			.then(installer.install)
			.then('done');
	}

	function downloadBook(bookId) {
		return database.node.get(bookId).then(function(book) {
			return database.contentProvider.getBook(book.details.url)
				.then(progress('downloaded'))
				.then(function(sqlitedb) {
					// TODO: Check this for memory leaks. This is a lot of data.
					var installer = new that.BookInstaller(database.node, sqlitedb, book);
					installer.progress = that.progress;
					var p = installer.install();
					sqlitedb.close();
					delete sqlitedb;
					return p;
				}).then(progress('done'));
		});
	}

	that.downloadCatalog = downloadCatalog;
	that.downloadBook = downloadBook;
}
