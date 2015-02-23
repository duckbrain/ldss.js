function BookModel(database) {
    this.database = database;
}

BookModel.prototype = {
    add: function add(ldsBook) {
        var b = ldsBook;
        return this.database.server.books.update({
            id: b.id,
            languageId: b.languageId,
            cbId: b.cb_id,
            name: b.name,
            fullName: b.full_name,
            displayOrder: b.display_order,
            description: b.description,
            version: b.version, // ?
            fileVersion: b.file_version,
            url: b.url,
            path: b.gl_uri,
            parentFolderId: b.parentId,
            downloaded: false,
            addedDate: b.dateadded,
            modifiedDate: b.datemodified,
            size: b.size,
            sizeIndex: b.size_index,
            mediaAvailable: !!b.media_available
        // 0 or 1
        });
    },
    
    download: function download(languageId, id) {
        var database = this.database;
        return this.get(languageId, id).then(function (book) {
            if (!book) {
                throw "Book does not exists";
            }
            return database.contentProvider.getBook(book.url);
        }).then(function (db) {
            var metadata = db.exec('SELECT version FROM bookmeta')[0];
            //TODO: Update the book's version and other info if needed
            var nodes = db.exec('SELECT * FROM nodes');
            db.close();
            delete db;
            nodes.languageId = languageId;
            nodes.bookId = id;
            return database.node.addList(nodes);
        });
    },
    
    get: function get(languageId, id) {
        return this.database.server.books.get([languageId, id]);
    }
}

if (typeof module != 'undefined') {
    module.exports = BookModel;
}