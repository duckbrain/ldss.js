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
            path: node.path,
            content: node.content,
            refrences: node.refrences
        }
    }

    that.getDetails = function(info) {
        if (typeof info == 'undefined' || info == null) {
            return Promise.resolve(null);
        }

        var details = info;
        return Promise.all([ getChildren(info), fillHeiarchy([ JSON.parse(JSON.stringify(info)) ]) ]).then(
                function(data) {
                    details.children = data[0];
                    details.heiarchy = data[1];
                    details.parent = details.heiarchy[details.heiarchy.length - 2];
                    return Promise.all([ 
                                getPrevious(details.heiarchy, 1),
                                getNext(details.heiarchy, 1) ]).then(
                            function(data) {
                                details.previous = data[0];
                                details.next = data[1];
                                // TODO: next
                                return details;
                            });
                })
    }

    function getPrevious(heiarchy, level) {
        if (heiarchy.length <= level) {
            return null;
        }

        var parent = heiarchy[heiarchy.length - level - 1];
        var item = heiarchy[heiarchy.length - level];

        return getChildren(parent).then(
                function(siblings) {
                    var i;
                    for (i = 0; i < siblings.length; i++) {
                        if (siblings[i].id == item.id && siblings[i].type == item.type) {
                            break;
                        }
                    }

                    if (i > 0) {
                        //TODO: Refactor getNext and getPrevious into one function.
                        //TODO: Decend back down the tree to level 1
                        return siblings[i - 1];
                    } else {
                        return getPrevious(heiarchy, level + 1)
                    }
                });
    }

    function getNext(heiarchy, level) {
        if (heiarchy.length <= level) {
            return null;
        }

        var parent = heiarchy[heiarchy.length - level - 1];
        var item = heiarchy[heiarchy.length - level];

        return getChildren(parent).then(
                function(siblings) {
                    var i;
                    for (i = 0; i < siblings.length; i++) {
                        if (siblings[i].id == item.id && siblings[i].type == item.type) {
                            break;
                        }
                    }

                    if (i < siblings.length - 1) {
                        return siblings[i + 1];
                    } else {
                        return getNext(heiarchy, level + 1)
                    }
                });
    }

    function fillHeiarchy(heiarchy) {
        if (!heiarchy.length) {
            heiarchy = [ heiarchy ];
        }

        return getParentInfo(heiarchy[0]).then(function(parent) {
            if (parent) {
                heiarchy.unshift(parent);
                return fillHeiarchy(heiarchy);
            } else {
                return heiarchy;
            }
        });
    }

    that.fillHeiarchy = fillHeiarchy;

    function getParentInfo(c) {
        switch (c.type) {
        case 'catalog':
            return Promise.resolve(false);
        case 'folder':
        case 'book':
            if (c.parentId == 0) {
                return database.catalog.get(c.languageId).then(getCatalogInfo);
            } else {
                return database.folder.get(c.languageId, c.parentId).then(getFolderInfo);
            }
        case 'node':
            if (c.parentId == 0) {
                return database.book.get(c.languageId, c.bookId).then(getBookInfo);
            } else {
                return database.node.get(c.languageId, c.bookId, c.parentId).then(getNodeInfo);
            }
        default:
            throw "Unknown info type";
        }
    }

    function getChildren(c) {
        if (typeof c == 'undefined') {
            return undefined;
        }

        switch (c.type) {
        case 'catalog':
            return getFolderAndBookChildren(c.id, 0);
        case 'folder':
            return getFolderAndBookChildren(c.languageId, c.id);
        case 'book':
            return getNodeChildren(c.languageId, c.id, 0);
        case 'node':
            return getNodeChildren(c.languageId, c.bookId, c.id);
        default:
            throw "Unknown info type in 'getChildren'";
        }
    }

    that.getChildren = getChildren;

    function getFolderAndBookChildren(languageId, parentId) {
        return Promise.all(
                [ database.folder.getChildren(languageId, parentId),
                  database.book.getChildren(languageId, parentId) ]).then(
                function(children) {
                    var folders, books, i;
                    folders = children[0];
                    books = children[1];
                    children = [ ];
                    for (i = 0; i < books.length; i++) {
                        children.push(getBookInfo(books[i]));
                    }
                    for (i = 0; i < folders.length; i++) {
                        children.push(getFolderInfo(folders[i]));
                    }
                    return children;
                });
    }

    function getNodeChildren(languageId, bookId, parentId) {
        return database.node.getChildren(languageId, bookId, parentId).then(function (nodes) {
            return nodes.map(function(node) {
                return getNodeInfo(node);
            });
        });
    }
}

if (typeof module != 'undefined') {
    module.exports = PathModel;
}
