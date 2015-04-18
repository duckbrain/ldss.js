function LDSContentProvider(database) {
	var that = this;

	that.download = function download(params) {
		return database.downloader.download(params);
	};

	that.getAction = function (action, data) {
		data = data || {};
		data.action = action;
		data.format = 'json';

		return that.download({
			url: 'http://tech.lds.org/glweb',
			data: data
		}).then(JSON.parse);
	};

	that.getLanguages = function () {
		return that.getAction('languages.query');
	};

	that.getCatalog = function (languageId) {
		return that.getAction('catalog.query', {
			languageid: languageId,
			platformid: 17
		});
	};

	that.getBook = function getBook(book) {
		return database.downloader.downloadBinary(book.details.url);
	};
}

LDSContentProvider.prototype = {};

if (typeof module != 'undefined') {
	module.exports = LDSContentProvider;
}
