function LanguageModel(database) {
    this.database = database;
    this.db = database.server.languages;
};

LanguageModel.prototype = {

    /**
     * Determines if the language list has been downloaded
     * 
     * @returns Promise
     */
    isInstalled: function() {
        return this.db.query().all().execute().then(function (items) {
            return items.length > 0;
        });
    },

    /**
     * Downloads and installs the language list.
     * 
     * @returns Promise
     */
    download: function() {
        var db = this.db;
        
        return db.clear()
            .then(this.database.contentProvider.getCatalog())
            .then(function(items) {
            
            var transactions = [];
            
            for (var i = 0; i < items.languages.length; i++) {
                transactions.push(db.add(items.languages[i]));
            }
            
            return Promise.all(transactions);
            
        });
    },

    /**
     * Gets the list of languages
     * 
     * @returns Promise
     */
    getAll: function getAll() {
        return this.db.query().all().execute();
    },

    /**
     * Gets the language with the given id
     * 
     * @returns Promise
     */
    get: function get(id) {
        return this.db.query().filter('id', id).execute().then(function (list) {
            return list[0];
        });
    },

    /**
     * Gets the language with the given language code (eg: 'en' for English)
     * 
     * @returns Promise
     */
    getByCode: function getByCode(code) {

    }
};

// module.exports = LanguageModel;
