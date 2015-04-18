function LanguageModel(database) {
	var that = this;

	/**
	 * Downloads and installs the language list if not already installed..
	 *
	 * @returns Promise
	 */
	that.download = function () {
		that.getAll().then(function (languages) {
			if (!languages.length) {
				return database.contentProvider.getLanguages().then(
					function (response) {
						return that.addAll(response.languages)
					});
			}
		});
	}

	that.addAll = function addAll(languages) {
		var server = database.server;
		return Promise.all(languages.map(function (language) {
			return server.languages.update(language);
		}));
	}

	/**
	 * Gets the list of languages
	 *
	 * @returns Promise
	 */
	that.getAll = function getAll() {
		return database.server.languages.query().all().execute();
	}

	/**
	 * Gets the language with the given id
	 *
	 * @returns Promise
	 */
	that.get = function get(id) {
		return database.server.languages.get(id);
	}

	/**
	 * Gets the language with the given language code (eg: 'en' for English)
	 *
	 * @returns Promise
	 */
	that.getByCode = function getByCode(code) {
		return database.server.languages.query('code').only(code)
			.execute().then(database.helpers.single);
	}

	/**
	 * Gets the language with the given LDS language code (eg: 'eng' for English)
	 *
	 * @returns Promise
	 */
	that.getByLdsCode = function getByLdsCode(code) {
		return database.server.languages.query('code_three').only(code)
			.execute().then(database.helpers.single);
	}
};

if (typeof module != 'undefined') {
	module.exports = LanguageModel;
}
