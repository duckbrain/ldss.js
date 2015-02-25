function FolderModel(database) {
    var that = this;
    that.database = database;

    that.addChildren = function addChildren(glFolder) {
        var f = glFolder;

        return Promise.all(f.books.map(function(book) {
            book.parentId = f.id;
            book.languageId = f.languageId;
            return that.database.book.add(book);
        }).concat(f.folders.map(function(folder) {
            folder.parentId = f.id;
            folder.languageId = f.languageId;
            return that.add(folder);
        })));
    }

    that.add = function add(glFolder) {
        var f = glFolder;
        var transaction = that.database.server.folders.update({
            id: f.id,
            languageId: f.languageId,
            parentId: f.parentId, // undefined if catalog
            name: f.name,
            displayOrder: f.display_order,
            books: that.database.helpers.dataToIdArray(f.books),
            folders: that.database.helpers.dataToIdArray(f.folders),
        });
        return Promise.all([ transaction, that.addChildren(f) ]);
    }

    that.get = function get(languageId, id) {
        return that.database.server.folders.get([ languageId, id ]);
    }

    that.getByName = function getByPath(languageId, name) {
        return that.database.server.folders.query('name').filter('languageId',
                languageId).filter('name', name).execute().then(
                that.database.helpers.single);
    }
}

if (typeof module != 'undefined') {
    module.exports = FolderModel;
}