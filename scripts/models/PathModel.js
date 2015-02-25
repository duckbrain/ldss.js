function PathModel(database) {
    var that = this;

    that.exists = function exists(languageId, path) {
        return that.get(languageId, path).then(function onSuccess(pathObj) {
            return !!pathObj;
        }, function onError() {
            return false;
        });
    }

    function firstSuccess(promises) {
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
    }

    /**
     * Bizarre path of id's. All front '/' are optional. Numbers represent the
     * id's
     * <ul>
     * <li>/ - Catalog</li>
     * <li>/1 - Folder</li>
     * <li>/1/ - Book</li>
     * <li>/1/2 - Node (book id, node id)
     * </ul>
     * 
     * @param {Integer}
     *            languageId
     * @param {String}
     *            path
     * @returns {Promise|Null}
     */
    function parsePath(languageId, path) {
        var parsePath = path, elements, id;

        if (parsePath.indexOf('/') == 0) {
            parsePath = parsePath.substring(1);
        }

        if (parsePath == '') {
            return database.catalog.get(languageId).then(getCatalogInfo);
        }

        elements = parsePath.split('/');
        if (elements.length == 2) {
            var bookId = Number.parseInt(elements[0]);
            var nodeId = Number.parseInt(elements[1]);
            if (!Number.isNaN(bookId)) {
                if (elements[1].length == 0) {
                    return database.book.get(languageId, bookId).then(
                            getBookInfo);
                } else if (!Number.isNaN(nodeId)) {
                    return database.node.get(languageId, bookId, nodeId).then(
                            getNodeInfo);
                }

            }
        } else if (elements.length == 1) {
            id = Number.parseInt(parsePath);
            if (!Number.isNaN(id)) {
                return database.folder.get(languageId, id).then(getFolderInfo)
            }
        }
        return null
    }

    that.get = function get(languageId, path) {
        var parse;

        parse = parsePath(languageId, path);
        if (parse) {
            return parse;
        }

        return firstSuccess([ database.folder.getByName(languageId, path).then(
                getFolderInfo),
                database.book.getByPath(languageId, path).then(getBookInfo),
                database.node.getByPath(languageId, path).then(getNodeInfo) ]);
    }

    function getCatalogInfo(catalog) {
        if (!catalog) {
            return null;
        }
        return {
            type: 'catalog',
            id: catalog.languageId,
            name: catalog.name,
            path: '/'
        };
    }

    function getFolderInfo(folder) {
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
    }

    function getBookInfo(book) {
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
    }

    function getNodeInfo(node) {
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
    }

    that.getDetails = function(info) {
        var details = {
            type: info.type,
            id: info.type,
            languageId: info.languageId,
            bookId: info.bookId,
            parentId: info.parentId,
            name: info.name
        };
        return Promise.all([ getChildren(info), fillHeiarchy([ info ]) ]).then(
                function(data) {
                    details.children = data[0];
                    details.heiarchy = data[1];
                    details.parent = details.children[details.length - 2];
                    return Promise.all([ getPrevious(details.heiarchy, 0) ]).then(
                            function(data) {
                                details.previous = data[0];
                                // TODO: next
                                return details;
                            });
                })
    }

    function getPrevious(heiarchy, level) {
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
    }

    function fillHeiarchy(heiarchy) {
        return getParentInfo(heiarchy[0]).then(function(parent) {
            if (parent) {
                heiarchy.unshift(parent);
                return fillHeiarchy(heiarchy);
            } else {
                return heiarchy;
            }
        });
    }

    function getParentInfo(c) {
        switch (c.type) {
        case 'catalog':
            return Promise.resolve(null);
        case 'folder':
        case 'book':
            if (typeof c.parentId == "undefined") {
                return database.catalog.get(c.languageId).then(getCatalogInfo);
            } else {
                return database.folder.get(c.languageId, c.id).then(
                        getFolderInfo);
            }
        case 'node':
            if (typeof c.parentId == "undefined") {
                return database.book.get(c.languageId, c.bookId).then(
                        getBookInfo);
            } else {
                return database.node.get(c.languageId, c.bookId, c.id).then(
                        getNodeInfo);
            }
        default:
            throw "Unknown info type";
        }
    }

    function getChildren(c) {
        switch (c.type) {
        case 'catalog':
            return getFolderAndBookChildren(c.id, -1);
        case 'folder':
            return getFolderAndBookChildren(c.languageId, c.id);
        case 'book':
            return getNodeChildren(c.languageId, c.id, -1);
        case 'node':
            return getNodeChildren(c.languageId, c.bookId, c.id);
        default:
            throw "Unknown info type";
        }
    }

    function getFolderAndBookChildren(languageId, parentId) {
        return Promise.all(
                [ database.folder.getChildren(languageId, parentId),
                  database.book.getChildren(languageId, parentId) ]).then(
                function(children) {
                    var folder, books, i;
                    folders = children[0];
                    books = children[1];
                    children = [ ];
                    for (i = 0; i < folders.length; i++) {
                        children.push(getFolderInfo(folders[i]));
                    }
                    for (i = 0; i < books.length; i++) {
                        children.push(getBookInfo(books[i]));
                    }
                    return children;
                });
    }

    function getNodeChildren(languageId, bookId, parentId) {
        throw "getNodeChildren: Not Implemented";
    }
}

if (typeof module != 'undefined') {
    module.exports = PathModel;
}
