/**
 * @name DatabaseModel
 * @class
 * 
 * @param {LDSContentProvider} contentProvider
 */
function DatabaseModel(contentProvider) {
    this.server = null;
    this.connection = {
        server: 'duck.jonathan.lds-scriptures',
        version: 11,
        schema: {
            languages: {
                key: { keyPath: 'id' },
                indexes: {
                    code: { unique: true },
                    code_three: { }
                }
            },
            settings: {
                key: { keyPath: 'id' },
                indexes: { 'id': {} }
            },
            themes: {
				key: { keyPath: 'id', autoIncrement: true },
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
                    path: { key: [ 'languageId', 'path' ], unique: false }
                }
            },
            books: {
                key: { keyPath: [ 'languageId', 'id' ] },
                indexes: {
                    children: { key: [ 'languageId', 'parentFolderId' ] },
                    path: { key: [ 'languageId', 'path' ], unique: false }
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
    single: function single(list) {
        if (list.length > 1) {
            throw "single had more than one.";
        }
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
