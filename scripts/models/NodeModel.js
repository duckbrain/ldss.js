/**
 * @name NodeModel
 * @class Collection of functions for accessing the nodes table class
 * @description Collection of functions for accessing the nodes table description
 * Collection of functions for accessing the nodes table. Longer docs here
 * 
 * @param {DatabaseModel} database The database to make all calls through
 */
function NodeModel(database) {
    var that = this;
    
    that.database = database;
    
    that.addList = function addList(glNodes) {
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

            transactions.push(that.add(node));
        }

        return Promise.all(transactions);
    }

    that.add = function add(glNode) {
        var n = glNode;
        return that.database.server.nodes.update({
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

    that.get = function get(languageId, bookId, id) {
        return that.database.server.nodes.get([ languageId, bookId, id ]);
    }

    that.getByPath = function getByPath(languageId, path) {
        return that.database.server.nodes.query('path')
            .filter('languageId', languageId)
            .filter('path', path).execute().then(that.database.helpers.single);
    }
}

if (typeof module != 'undefined') {
    module.exports = NodeModel;
}