function LDSContentProvider(database) {
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
		database.language.get(book.languageId).then(language) {
			return database.downloader.downloadBinary('data/' + language.code_three + book.path + '.zbook');
		});
};
}

LDSContentProvider.prototype = {};

if (typeof module != 'undefined') {
	module.exports = LDSContentProvider;
}
