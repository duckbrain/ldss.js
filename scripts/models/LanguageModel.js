function LanguageModel(database) {
	var that = this;

	function initialize() {
		getAll().then(function (languages) {
			if (!languages.length) {
				return download();
			}
			return languages;
		});
	}

	function download() {
		return database.contentProvider.getLanguages().then(
			function (response) {
				return addAll(response.languages)
			});
	}

	function addAll(languages) {
		var server = database.server;
		return Promise.all(languages.map(function (language) {
			return server.languages.update(language);
		}));
	}

	function getAll() {
		return database.server.languages.query().all().execute();
	}

	function get(id) {
		return database.server.languages.get(id);
	}

	function getByCode(code) {
		return database.server.languages.query('code').only(code)
			.execute().then(database.helpers.single);
	}

	function getByLdsCode(code) {
		return database.server.languages.query('code_three').only(code)
			.execute().then(database.helpers.single);
	}

	that.initialize = initialize;
	that.download = download;
	that.getAll = getAll;
	that.get = get;
	that.getByCode = getByCode;
	that.getByLdsCode = getByLdsCode;
};

if (typeof module != 'undefined') {
	module.exports = LanguageModel;
}