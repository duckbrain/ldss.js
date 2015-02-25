if (typeof require == 'function') {
    var FolderModel = require('./FolderModel.js');
}

/**
 * Creates a instance of a catalog model that for a given language
 * 
 * @param language
 *            The id of the language to use as a basis
 */
function CatalogModel(database) {
    var that = this;

    /**
     * Determines if the catalog for the given language has been installed.
     * 
     * @returns Promise
     */
    that.exists = function exists(id) {

    }

    /**
     * Clears all of the data for the given catalog.
     * 
     * @returns Promise
     */
    that.clear = function clear(id) {
        // TODO: Destroy all books
        // return Promise.all([ database.server.catalogs.clear(),
        // database.server.books.clear(),
        // database.server.folders.clear() ]);
        return Promise.resolve(true);

    }

    that.download = function download(id) {
        return that.clear().then(function clearCompleted() {
            return database.contentProvider.getCatalog(id)
        }).then(function processCatalog(response) {
            if (!response || !response.success) {
                console.error(response);
                throw "Unknown error from LDS servers";
            }

            response.catalog.languageId = id;
            return that.add(response.catalog);
        });
    }

    that.add = function add(glCatalog) {
        var c = glCatalog;
        var transactions = [ database.server.catalogs.update({
            languageId: c.languageId,
            name: c.name,
            changedDate: c.date_changed,
            displayOrder: c.display_order,
            books: database.helpers.dataToIdArray(c.books),
            folders: database.helpers.dataToIdArray(c.folders),
        }), database.folder.addChildren(c) ];

        return Promise.all(transactions).then(function() {
            return c;
        });
    }

    that.get = function get(id) {
        return database.server.catalogs.get(id);
    }
}

if (typeof module != 'undefined') {
    module.exports = BookModel;
}