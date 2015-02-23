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
    this.database = database;
}

CatalogModel.prototype = {
    /**
     * Determines if the catalog for the given language has been installed.
     * 
     * @returns Promise
     */
    exists: function exists(id) {
        
    },

    /**
     * Clears all of the data for the given catalog.
     * 
     * @returns Promise
     */
    clear: function clear(id) {
        // TODO: Destroy all books
        // return Promise.all([ this.database.server.catalogs.clear(),
        // this.database.server.books.clear(),
        // this.database.server.folders.clear() ]);
        return Promise.resolve(true);

    },
    download: function download(id) {
        var that = this;

        return that.clear().then(function clearCompleted() {
            return that.database.contentProvider.getCatalog(id)
        }).then(function processCatalog(response) {
            if (!response || !response.success) {
                console.error(response);
                throw "Unknown error from LDS servers";
            }

            response.catalog.languageId = id;
            return that.add(response.catalog);
        });
    },

    add: function add(glCatalog) {
        var c = glCatalog;
        var transactions = [ this.database.server.catalogs.update({
            languageId: c.languageId,
            name: c.name,
            changedDate: c.date_changed,
            displayOrder: c.display_order,
            books: this.database.helpers.dataToIdArray(c.books),
            folders: this.database.helpers.dataToIdArray(c.folders),
        }), this.database.folder.addChildren(c) ];

        return Promise.all(transactions).then(function() {
            return c;
        });
    },

    get: function get(id) {
        return this.database.server.catalogs.get(id);
    }
};


if (typeof module != 'undefined') {
    module.exports = BookModel;
}