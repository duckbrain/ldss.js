function LocalContentProvider(database) {
	var that = this;

	function download(url) {
		return database.downloader.download(params);
	};

	that.getLanguages = function () {
		return download('data/languages.json');
	};

	that.getCatalog = function (languageId) {
		return download('data/' + languageId + '/catalog.json');
	};

	that.getBook = function getBook(book) {
		return database.language.get(book.languageId).then(function (language) {
			return database.downloader.downloadBinary('data/' + language.code_three + book.path + '.zbook');
		});
	}
}

if (typeof module != 'undefined') {
	module.exports = LocalContentProvider;
}