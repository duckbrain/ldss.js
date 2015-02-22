function BookModel(database) {
    this.database = database;
}

BookModel.prototype = {
    add: function add(ldsBook) {
        var b = ldsBook;
        return that.database.server.books.update({
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
            mediaAvailable: b.media_available && true
        // 0 or 1
        });
    },
    
    download: function download(languageId, id) {
        
    },
    
    get: function get(languageId, id) {
        return this.database.server.books.get([languageId, id]);
    }
}

if (typeof module != 'undefined') {
    module.exports = BookModel;
}