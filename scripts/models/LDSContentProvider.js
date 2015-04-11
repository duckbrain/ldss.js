if (typeof require == 'function') {
	var Downloader = require('./Downloader.js');
	var pako = require('./../dependencies/pako.js');
	var SQL = require('./../dependencies/sql.js');
}

function LDSContentProvider(database) {
	var that = this;

	that.download = function download(params) {
		return database.downloader.download(params);
	};

	that.getAction = function(action, data) {
		data = data || {};
		data.action = action;
		data.format = 'json';

		return that.download({
			url: 'http://tech.lds.org/glweb',
			data: data
		}).then(JSON.parse);
	};

	that.getLanguages = function() {
		return that.getAction('languages.query');
	};

	that.getCatalog = function(languageId) {
		return that.getAction('catalog.query', {
			languageid: languageId,
			platformid: 1
		});
	};

	that.getBook = function getBook(url) {
		//TODO Lazy load SQL and pako when this function is called. They provide a lot of unessessary overhead.
		return database.downloader.downloadBinary(url).then(pako.inflate).then(function(sqlite3blob) {
			return new SQL.Database(sqlite3blob);
		});
	};
}

LDSContentProvider.prototype = {};

if (typeof module != 'undefined') {
	module.exports = LDSContentProvider;
}
