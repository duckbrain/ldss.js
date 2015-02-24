if (typeof require == 'function') {
    var SettingsModel = require('./SettingsModel.js');
    var LanguageModel = require('./LanguageModel.js');
    var CatalogModel = require('./CatalogModel.js');
    var BookModel = require('./BookModel.js');
    var FolderModel = require('./FolderModel.js');
    var PathModel = require('./PathModel.js');
    var LDSContentProvider = require('./LDSContentProvider.js');
    var db = require('../dependencies/db.js');
}

function DatabaseModel(contentProvider) {
    this.server = null;
    this.connection = {
        server: 'duck.jonathan.lds-scriptures',
        version: 7,
        schema: {
            languages: {
                key: { keyPath: 'id' },
                indexes: {
                    id: { unique: true },
                    code: { unique: true }
                }
            },
            settings: {
                key: { keyPath: 'id' },
                indexes: { 'id': {} }
            },
            /**
             * Represents the root catalog for any given language
             */
            catalogs: {
                key: { keyPath: 'languageId' }
            },
            nodes: {
                key: { keyPath: [ 'languageId', 'bookId', 'id' ] },
                indexes: {
                    children: { key: [ 'languageId', 'bookId', 'parentId' ] },
                    path: { key: [ 'languageId', 'path' ], unique: true }
                }
            },
            books: {
                key: { keyPath: [ 'languageId', 'id' ] },
                indexes: {
                    children: { key: [ 'languageId', 'parentFolderId' ] },
                    path: { key: [ 'languageId', 'path' ], unique: true }
                }
            },
            folders: {
                key: { keyPath: [ 'languageId', 'id' ] },
                indexes: {
                    children: { key: [ 'languageId', 'parentId' ] },
                    name: { key: [ 'languageId', 'name' ] }
                }
            }
        }
    };

    this.contentProvider = contentProvider;
    this.helpers = DatabaseModel.helpers;
}

DatabaseModel.prototype = {
    open: function open() {
        var that = this;
        return db.open(this.connection).then(function(server) {
            that.server = server;
            return that;
        });
    },
    close: function close() {
        this.server.close();
        this.server = null;
    }
};

DatabaseModel.helpers = {
    existsSingle: function existsSingle(promiseAttempt) {
        // TODO: Return a promise that returns true or false
    },
    listToSingle: function listToSingle(list) {
        return list[0];
    },
    dataToIdArray: function dataToIdArray(array) {
        var newArray = [ ];
        for (var i = 0; i < array.length; i++) {
            newArray.push(array[i].id);
        }
        return newArray;
    }
}

if (typeof module != 'undefined') {
    module.exports = DatabaseModel;
}
