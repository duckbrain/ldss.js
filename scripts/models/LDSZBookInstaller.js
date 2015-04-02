function LDSZBookInstaller(db, sqlitedb, book) {
  var that = this;
  var nodes;
  var helpers = new LDSInstallerHelpers(db);

  function install() {
    nodes = {};

    var result = sqlitedb.exec(
      'SELECT id, parent_id, title, subtitle, ' +
      'short_title, uri, content, refs ' +
      'FROM nodes'
    );

    return addAll(result[0].values).then(findTree).then(findRelations).then(helpers.update);
    // TODO: Update the book's version
    var metadata = sqlitedb.exec('SELECT version FROM bookmeta')[0];
  }

  function uninstall() {
    //TODO
  }

  function addAll(rows) {
    return Promise.all(rows.map(add));
  }

  function add(glNode) {
    var item = formatNode(glNode);

    return db.add(item).then(function(item) {
      item = item[0]; // Item comes back as an array with one item
      nodes[glNode[0]] = item;
    });
  }

  function findTree() {
    var node, parent, i;

    book.children = [];

    for (i in nodes) {
      node = nodes[i];
      parent = nodes[node.parent];
      if (parent) {
        node.parent = parent;
        parent.children.push(node);
      } else {
        node.parent = book;
        book.children.push(node);
      }
    }

    return book;
  }

  function findRelations(node) {
    node.heiarchy = node.parent.heiarchy.concat([node]);
    node.next = helpers.findSibling(+1, node);
    node.previous = helpers.findSibling(-1, node);
    for (var i = 0; i < node.children.length; i++) {
      findRelations(node.children[i]);
    }
    return node;
  }

  function formatNode(row) {
    return {
      languageId: book.languageId,
      parent: row[1],
      path: row[5],
      next: null,
      previous: null,
      children: [],
      name: row[2],
      type: 'node',
      media: [],
      heiarchy: [],
      details: {
        content: row[6],
        refrences: row[7],
        shortTitle: row[4],
        subtitle: row[3]
      }
    };
  }

  that.install = install;
}

if (typeof module != 'undefined') {
  module.exports = LDSZBookInstaller;
}
