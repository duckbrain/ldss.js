function PathModel(database) {
    this.database = database;
}

PathModel.prototype = {
    exists: function exists(languageId, path) {
        return this.get(languageId, path).then(function onSuccess(pathObj) {
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
                    fulfilled = true;
                }
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

    /**
     * Bizarre path of id's. All front '/' are optional. Numbers represent the
     * id's 
     * 
     * <ul>
     * <li>/ - Catalog</li>
     * <li>/1 - Folder</li>
     * <li>/1/ - Book</li>
     * <li>/1/2 - Node (book id, node id)
     * </ul>
     * 
     * @param {Integer} languageId
     * @param path
     * @returns
     */
    parsePath: function(languageId, path) {
        var parsePath = path, elements, id;

        if (parsePath.indexOf('/') == 0) {
            parsePath = parsePath.substring(1);
        }

        if (parsePath == '') {
            return db.catalog.get(languageId).then(this.getCatalogInfo);
        }

        elements = parsePath.split('/');
        if (elements.length == 2) {
            var bookId = Number.parseInt(elements[0]);
            var nodeId = Number.parseInt(elements[1]);
            if (!Number.isNaN(bookId)) {
                if (elements[1].length == 0) {
                    return db.book.get(languageId, bookId).then(
                            this.getBookInfo);
                } else if (!Number.isNaN(nodeId)) {
                    return db.node.get(languageId, bookId, nodeId).then(
                            this.getNodeInfo);
                }

            }
        } else if (elements.length == 1) {
            id = Number.parseInt(parsePath);
            if (!Number.isNaN(id)) {
                return db.folder.get(languageId, id).then(this.getFolderInfo)
            }
        }
        return null
    },

    get: function get(languageId, path) {
        var i, parse, db = this.database;

        parse = this.parsePath(languageId, path);
        if (parse) {
            return parse;
        }

        return this.firstSuccess(
                [ db.folder.getByName(languageId, path)
                        .then(this.getFolderInfo),
                        db.book.getByPath(languageId, path).then(
                                this.getBookInfo),
                        db.node.getByPath(languageId, path).then(
                                this.getNodeInfo) ]);
    },

    getCatalogInfo: function(catalog) {
        if (!catalog) {
            return null;
        }
        return {
            type: 'catalog',
            id: catalog.id,
            name: catalog.name,
            path: '/'
        };
    },

    getFolderInfo: function(folder) {
        if (!folder) {
            return null;
        }
        return {
            type: 'folder',
            id: folder.id,
            languageId: folder.languageId,
            parentId: folder.parentId,
            name: folder.name,
            path: '/' + folder.id
        };
    },

    getBookInfo: function(book) {
        if (!book) {
            return null;
        }
        return {
            type: 'book',
            id: book.id,
            languageId: book.languageId,
            parentId: book.parentFolderId,
            name: book.name,
            downloaded: book.downloaded,
            path: book.path
        }
    },

    getNodeInfo: function(node) {
        if (!node) {
            return null;
        }
        return {
            type: 'node',
            id: node.id,
            languageId: node.languageId,
            bookId: node.bookId,
            parentId: node.parentId,
            name: node.name,
            path: node.path
        }
    },

    getDetails: function(info) {
        var details = {
            type: info.type,
            id: info.type,
            languageId: info.languageId,
            bookId: info.bookId,
            parentId: info.parentId,
            name: info.name
        };
        return Promise.all(
                [ this.getChildren(info), this.fillHeiarchy([ info ]) ]).then(
                function(data) {
                    details.children = data[0];
                    details.heiarchy = data[1];
                    details.parent = details.children[details.length - 2];
                    return Promise.all(
                            [ this.getPrevious(details.heiarchy, 1) ]).then(
                            function(data) {
                                details.previous = data[0];
                                // TODO: next
                                return details;
                            });
                })
    },

    getPrevious: function(heiarchy, level) {
        if (heiarchy.length >= level) {
            return null;
        }

        return getChildren(heiarchy[heiarcy.length - level - 1]).then(
                function(siblings) {
                    var i;
                    for (i = 0; i < siblings; i++) {
                        if (siblings[i].id == heiarchy[level].id) {
                            break;
                        }
                    }

                    if (i > 0) {
                        return siblings[i];
                    } else {
                        getPrevious(heiarchy, level + 1)
                    }
                });
    },

    fillHeiarchy: function(heiarchy) {
        return this.getParentInfo(heiarchy[0]).then(function(parent) {
            if (parent) {
                heiarchy.insert(0, value);
                return this.fillHeiarchy(heiarchy);
            } else {
                return heiarchy;
            }
        });
    },

    getParentInfo: function(c) {
        var db = this.database;
        switch (c.type) {
        case 'catalog':
            return Promise.resolve(null);
        case 'folder':
        case 'book':
            if (typeof c.parentId == "undefined") {
                return db.catalog.get(c.languageId).then(this.getCatalogInfo);
            } else {
                return db.folder.get(c.languageId, c.id).then(
                        this.getFolderInfo);
            }
        case 'node':
            if (typeof c.parentId == "undefined") {
                return db.book.get(c.languageId, c.bookId).then(
                        this.getBookInfo);
            } else {
                return db.node.get(c.languageId, c.bookId, c.id).then(
                        this.getNodeInfo);
            }
        default:
            throw "Unknown info type";
        }
    },

    getChildren: function(c) {
        switch (c.type) {
        case 'catalog':
            return this.getFolderAndBookChildren(c.id, null);
        case 'folder':
            return this.getFolderAndBookChildren(c.languageId, c.id);
        case 'book':
            return this.getNodeChildren(c.languageId, c.id, null);
        case 'node':
            return this.getNodeChildren(c.languageId, c.bookId, c.id);
        default:
            throw "Unknown info type";
        }
    },

    getFolderAndBookChildren: function(languageId, parentId) {
        var db = this.database;
        return Promise.all(
                [ db.folder.getChildren(languageId, parentId),
                        db.book.getChildren(languageId, parentId) ]).then(
                function(children) {
                    var folder, books, i;
                    folders = children[0];
                    books = children[1];
                    children = [ ];
                    for (i = 0; i < folders.length; i++) {
                        children.push(this.getFolderInfo(folders[i]));
                    }
                    for (i = 0; i < books.length; i++) {
                        children.push(this.getBookInfo(books[i]));
                    }
                    return children;
                });
    },

    getNodeChildren: function(languageId, bookId, parentId) {
    }
};

if (typeof module != 'undefined') {
    module.exports = PathModel;
}
