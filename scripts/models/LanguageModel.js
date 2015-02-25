function LanguageModel(database) {
    var that = this;
    this.database = database;

    /**
     * Downloads and installs the language list.
     * 
     * @returns Promise
     */
    that.download = function() {
        return this.database.contentProvider.getLanguages().then(
                function(response) {
                    return that.addAll(response.languages)
                });
    }

    that.addAll = function addAll(languages) {
        var server = this.database.server;
        return Promise.all(languages.map(function(language) {
            return server.languages.update(language);
        }));
    }

    /**
     * Gets the list of languages
     * 
     * @returns Promise
     */
    that.getAll = function getAll() {
        return this.database.server.languages.query().all().execute();
    }

    /**
     * Gets the language with the given id
     * 
     * @returns Promise
     */
    that.get = function get(id) {
        return this.database.server.languages.get(id);
    }

    /**
     * Gets the language with the given language code (eg: 'en' for English)
     * 
     * @returns Promise
     */
    that.getByCode = function getByCode(code) {
        return this.database.server.languages.query('code').only(code)
                .execute().then(this.database.helpers.listToSingle);
    }
};

if (typeof module != 'undefined') {
    module.exports = LanguageModel;
}
