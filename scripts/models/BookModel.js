function BookModel(database) {
    var that = this;
    this.database = database;

    that.add = function add(ldsBook) {
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
            parentFolderId: b.parentId || 0,
            downloaded: false,
            addedDate: b.dateadded,
            modifiedDate: b.datemodified,
            size: b.size,
            sizeIndex: b.size_index,
            mediaAvailable: !!b.media_available
        });
    }

    that.download = function download(languageId, id) {
        var database = that.database;
        return that.get(languageId, id).then(function(book) {
            if (!book) {
                throw "Book does not exists";
            }
            return database.contentProvider.getBook(book.url);
        }).then(function(db) {
            var metadata = db.exec('SELECT version FROM bookmeta')[0];
            // TODO: Update the book's version and other info if needed
            var nodes = db.exec('SELECT * FROM nodes');
            db.close();
            delete db;
            nodes.languageId = languageId;
            nodes.bookId = id;
            return database.node.addList(nodes);
        });
    }

    that.get = function get(languageId, id) {
        return that.database.server.books.get([ languageId, id ]);
    }

    that.getByPath = function getByPath(languageId, path) {
        return database.server.books.query('path').filter('languageId',
                languageId).filter('path', path).execute().then(
                database.helpers.single);
    }

    that.getChildren = function getChildren(languageId, parentId) {
        return database.server.books.query('children').filter('languageId',
                languageId).filter('parentFolderId', parentId).execute();
    }
}

if (typeof module != 'undefined') {
    module.exports = BookModel;
}