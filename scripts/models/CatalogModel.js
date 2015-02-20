/**
 * Creates a instance of a catalog model that for a given language
 * 
 * @param language
 *            The id of the language to use as a basis
 */
function CatalogModel(database, languageId) {
    this.database = database;
    this.catalogDb = database.server.catalogs;
    this.bookDb = database.server.books;
    this.folderDb = database.server.folders;
    this.languageId = languageId;
}

CatalogModel.prototype = {
    /**
     * Determines if the catalog for the given language has been installed.
     * 
     * @returns Promise
     */
    isInstalled: function isDownloaded() {

    },

    /**
     * Clears all of the data for the given catalog.
     * 
     * @returns Promise
     */
    clear: function clear() {
        // TODO: Destroy all books
        return Promise.all([ this.catalogDb.clear(), this.bookDb.clear(),
                this.folderDb.clear() ]);
    },
    download: function download() {
        var that = this;

        return that.clear().then(function clearCompleted() {
            return that.database.contentProvider.getCatalog(that.languageId)
        }).then(
                function processCatalog(catalog) {
                    if (!catalog || !catalog.success) {
                        console.error(catalog);
                        throw "Unknown error from LDS servers";
                    }

                    var transactions = [ ];

                    function dataToIdArray(array) {
                        var newArray = [ ];
                        for (var i = 0; i < array.length; i++) {
                            newArray.push(array[i].id);
                        }
                        return newArray;
                    }

                    function addFolder(folder) {
                        // Add the books
                        var i;
                        for (i = 0; i < folder.books.length; i++) {
                            var b = folder.books[i];
                            transactions.push(that.bookDb.add({
                                id: b.id,
                                languageId: that.languageId,
                                cbId: b.cb_id,
                                name: b.name,
                                fullName: b.full_name,
                                displayOrder: b.display_order,
                                description: b.description,
                                version: b.version, // ?
                                fileVersion: b.file_version,
                                url: b.url,
                                path: b.gl_uri,
                                parentId: folder.id,
                                downloaded: false,
                                addedDate: b.dateadded,
                                modifiedDate: b.datemodified,
                                size: b.size,
                                sizeIndex: b.size_index,
                                mediaAvailable: b.media_available && true
                            // 0 or 1
                            }));
                        }
                        for (i = 0; i < folder.folders.length; i++) {
                            var f = folder.folders[i];
                            transactions.push(that.folderDb.add({
                                id: f.id,
                                languageId: that.languageId,
                                parentId: folder.id, // undefined if parent
                                                        // is catalog
                                name: f.name,
                                // englishName: f.eng_name, // null or ""
                                displayOrder: f.display_order,
                                books: dataToIdArray(f.books),
                                folders: dataToIdArray(f.folders),
                            // daysExpire: f.daysexpire // All are 0
                            }))
                            addFolder(f);
                        }
                    }

                    transactions.push(that.catalogDb.add({
                        languageId: that.languageId,
                        name: catalog.catalog.name,
                        changedDate: catalog.catalog.date_changed,
                        displayOrder: catalog.catalog.display_order,
                        books: dataToIdArray(catalog.catalog.books),
                        folders: dataToIdArray(catalog.catalog.folders),
                    }));

                    addFolder(catalog.catalog);

                    return Promise.all(transactions).then(
                            Promise.resolve(catalog.catalog));
                });
    },

    query: function query(path) {

    }
};

// module.exports = CatalogModel;
