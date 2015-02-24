function NodeModel(database) {
    this.database = database;
}

NodeModel.prototype = {
        addList: function addList(glNodes) {
            var transactions = [ ];
            var i, j, row, names, node;
            var languageId = glNodes.languageId;
            var bookId = glNodes.bookId;

            glNodes = glNodes[0];
            names = glNodes.columns


            for (i = 0; i < glNodes.values.length; i++) {
                row = glNodes.values[i];
                node = {};
                for (j = 0; j < names.length; j++) {
                    node[names[j]] = row[j];
                }

                node.language_id = languageId;
                node.book_id = bookId;

                transactions.push(this.add(node));
            }

        return Promise.all(transactions);
    },
    
    add: function add(glNode) {
        var n = glNode;
        return this.database.server.nodes.update({
            id: n.id,
            languageId: n.language_id,
            bookId: n.book_id,
            parentId: n.parent_id,
            contentId: n.content_id,
            displayOrder: n.display_order,
            name: n.title,
            subtitle: n.subtitle,
            shortTitle: n.short_title,
            path: n.uri,
            content: n.content,
            refrences: n.refs
        })
    }
}

if (typeof module != 'undefined') {
    module.exports = NodeModel;
}