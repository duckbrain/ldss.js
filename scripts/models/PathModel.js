function PathModel(database) {
    this.database = database;
}

PathModel.prototype = {
    exists: function exists(path) {
        return this.get(path).then(function onSuccess(pathObj) {
            return !!pathObj;
        }, function onError() {
            return false;
        })
    },

    firstSuccess: function firstSuccess(promises) {
        return new Promise(function(fulfill, reject) {

            var fulfilled = false;

            function fulfillSafe(data) {
                if (!fulfilled && data) {
                    fulfill(data);
                }
                fulfilled = true;
                return data;
            }

            function rejectSafe(data) {
                if (!fulfilled) {
                    reject(data);
                }
                fulfilled = true;
                return data;
            }

            function doNothing(e) {
                // swallow exceptions
            }

            for (var i = 0; i < promises.length; i++) {
                promises[i] = promises[i].then(fulfillSafe, doNothing)
            }

            Promise.all(promises).then(rejectSafe, rejectSafe);
        });
    },

    get: function get(languageId, path) {
        var db = this.database;

        return this
                .firstSuccess([ db.catalog.get(languageId).then(
                        this.getCatalogPathInfo),
                        db.folder.getByPath(languageId, path).then(
                                this.getFolderPathInfo),
                        db.book.getByPath(languageId, path).then(
                                this.getBookPathInfo),
                        db.node.getByPath(languageId, path).then(
                                this.getNodePathInfo) ]);
    },

    getFolderAndBookChildren: function getFolderAndBookChildren(languageId,
            parentId) {
        var db = this.database;
        return Promise.all(
                [ db.folder.getChildren(languageId, parentId),
                        db.book.getChildren(languageId, parentId) ]).then(
                function(children) {
                    var folders = children[0];
                    var books = children[1];

                });
    },

    getCatalogPathInfo: function getCatalogPathInfo(catalog) {
        this.getFolderAndBookChildren(catalog.id, null).then(function (children) {
            return {
                item: catalog,
                type: 'catalog',
                children: children,
                content: null,
                refrences: null,
                next: null,
                previous: null,
                parent: null,
                heiarchy: []
            }
        })
    },

    getFolderPathInfo: function getFolderPathInfo(folder) {

    },

    getBookPathInfo: function getBookPathInfo(book) {

    },

    getNodePathInfo: function getNodePathInfo(node) {

    }
}

if (typeof module != 'undefined') {
    module.exports = PathModel;
}