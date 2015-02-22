function FolderModel(database) {
    this.database = database;
}

FolderModel.prototype = {
    addChildren: function addChildren(ldsFolder) {
        var i, t = [ ];
        var f = ldsFolder;

        for (i = 0; i < f.books.length; i++) {
            f.books[i].parentId = f.id;
            f.books[i].languageId = f.languageId;
            t.push(this.database.book.add(f.books[i]));
        }
        for (i = 0; i < f.folders.length; i++) {
            f.folders[i].parentId = f.id;
            f.folders[i].languageId = f.languageId;
            t.push(this.add(f.folders[i]));
        }

        return Promise.all(t);
    },

    add: function add(languageId, ldsFolder) {
        var f = ldsFolder;
        var transaction = this.database.server.folders.update({
            id: f.id,
            languageId: f.languageId,
            parentId: f.parentId, // undefined if catalog
            name: f.name,
            displayOrder: f.display_order,
            books: this.database.helpers.dataToIdArray(f.books),
            folders: this.database.helpers.dataToIdArray(f.folders),
        });
        return Promise.all([ transaction, this.addChildren(folder) ]);
    }
}

if (typeof module != 'undefined') {
    module.exports = FolderModel;
}