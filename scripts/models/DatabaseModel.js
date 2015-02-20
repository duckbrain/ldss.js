function DatabaseModel() {
    this.server = null;
    this.connection = {
        server: 'duck.jonathan.lds-scriptures',
        version: 4,
        schema: {
            languages: {
                key: {
                    keyPath: 'id'
                },
                indexes: {
                    id: {
                        unique: true
                    },
                    code: {
                        unique: true
                    }
                }
            },
            settings: {
                key: {
                    keyPath: 'id'
                },
                indexes: {
                    'id': {}
                }
            },
            /**
             * Represents the root catalog for any given language
             */
            catalogs: {
                key: {
                    keyPath: 'languageId'
                }
            },
            books: {
                key: {
                    keyPath: [ 'languageId', 'id' ]
                },
                indexes: {
                    languageId: {},
                    id: {},
                    unique: {
                        key: [ 'languageId', 'id' ],
                        unique: true
                    },
                    path: {}
                }
            },
            folders: {
                key: {
                    keyPath: [ 'languageId', 'id' ]
                },
                indexes: {
                    languageId: {},
                    id: {},
                    unique: {
                        key: [ 'languageId', 'id' ],
                        unique: true
                    },
                    name: {}
                }
            }
        }
    };
    this.contentProvider = new LDSContentProvider();
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