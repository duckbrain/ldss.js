function FolderModel(database) {
    var that = this;

    that.addChildren = function addChildren(glFolder) {
        var f = glFolder;

        return Promise.all(f.books.map(function(book) {
            book.parentId = f.id;
            book.languageId = f.languageId;
            return database.book.add(book);
        }).concat(f.folders.map(function(folder) {
            folder.parentId = f.id;
            folder.languageId = f.languageId;
            return that.add(folder);
        })));
    }

    that.add = function add(glFolder) {
        var f = glFolder;
        var transaction = database.server.folders.update({
            id: f.id,
            languageId: f.languageId,
            parentId: f.parentId || 0, // 0 if catalog
            name: f.name,
            displayOrder: f.display_order,
            books: database.helpers.dataToIdArray(f.books),
            folders: database.helpers.dataToIdArray(f.folders),
        });
        return Promise.all([ transaction, that.addChildren(f) ]);
    }

    that.get = function get(languageId, id) {
        return database.server.folders.get([ languageId, id ]);
    }

    that.getByName = function getByPath(languageId, name) {
        return database.server.folders.query('name').filter('languageId',
                languageId).filter('name', name).execute().then(
                database.helpers.single);
    }
    
    that.getChildren = function getChildren(languageId, parentId) {
        return database.server.folders.query('children').filter('languageId',
                languageId).filter('parentId', parentId).execute();
    }
}

if (typeof module != 'undefined') {
    module.exports = FolderModel;
}