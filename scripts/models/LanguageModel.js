function LanguageModel(database) {
    this.database = database;
};

LanguageModel.prototype = {

    /**
     * Downloads and installs the language list.
     * 
     * @returns Promise
     */
    download: function() {
        var that = this;

        return this.database.contentProvider.getCatalog().then(
                function(response) {
                    return that.addAll(response.languages);
                });
    },

    addAll: function addAll(languages) {
        var transactions = [ ];

        for (var i = 0; i < languages.length; i++) {
            transactions.push(this.database.server.languages.put(languages[i]));
        }

        return Promise.all(transactions);
    },

    /**
     * Gets the list of languages
     * 
     * @returns Promise
     */
    getAll: function getAll() {
        return this.database.server.languages.query().all().execute();
    },

    /**
     * Gets the language with the given id
     * 
     * @returns Promise
     */
    get: function get(id) {
        return this.database.server.languages.get(id);
    },

    /**
     * Gets the language with the given language code (eg: 'en' for English)
     * 
     * @returns Promise
     */
    getByCode: function getByCode(code) {
        return this.database.server.languages.query('code').only(code)
                .execute().then(this.database.helpers.listToSingle);
    }
};

if (typeof module != 'undefined') {
    module.exports = LanguageModel;
}