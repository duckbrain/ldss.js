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

    return addAll(result[0].values)
      .then(findTree)
      .then(findRelations)
      .then(updateVersion)
      .then(helpers.update);
    // TODO: After updated, it should look for the book or nodes that have 1 child and no content. Those items should
    // be updated to have thier child's name and content, but the names on refrences should not be updated. The child
    // can then be deleted.
  }

  function updateVersion() {
    book.details.downloadedVersion = book.details.catalogVersion;
    return book;
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
    if (node.type == 'node') {
      node.heiarchy = node.parent.heiarchy.concat([node]);
      node.next = helpers.findSibling(+1, node);
      node.previous = helpers.findSibling(-1, node);
    }
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
