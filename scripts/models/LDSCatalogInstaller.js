/**
 * Takes a catalog object downloaded from LDS.org and installs it into the paths
 * objectStore.
 * @param {DatabaseModel} database Database model for inter-class communication.
 */
function LDSCatalogInstaller(db, languageId) {
  var that = this;
  var helpers = new LDSInstallerHelpers(db);

  function install(root) {
    //
    // Add all of the items and have ID's assigned.
    //
    return db.clear(languageId).then(function() {
      return add(root.catalog, formatCatalog, null, true)
        //
        // Then update those items to make refrence to those ID's for
        // their family members.
        //
        .then(helpers.update);
    });
  }

  function add(glItem, format, parent, hasChildren) {
    var item = format(glItem);

    return db.add(item).then(function(item) {
      var folderAdds, bookAdds;

      item = item[0]; // Item comes back as an array with one item

      if (parent) {
        item.parent = parent;
        item.heiarchy = parent.heiarchy.concat([item]);
        parent.children.push(item);
      } else {
        item.parent = null;
        item.heiarchy = [item];
      }

      if (hasChildren) { // Catalog or folder
        folderAdds = glItem.folders.map(function(glFolder) {
          return add(glFolder, formatFolder, item, true);
        });
        bookAdds = glItem.books.map(function(glBook) {
          return add(glBook, formatBook, item, false);
        });
        return Promise.all(folderAdds.concat(bookAdds)).then(function() {
          //TODO: Sort by display order
          item.next = helpers.findSibling(+1, item);
          item.previous = helpers.findSibling(-1, item);
          return item;
        });
      } else { //It's a book
        item.children = [];
        return item;
      }
    });
  }

  function formatBlank(item) {
    return {
      languageId: languageId,
      parent: null,
      path: item.path,
      next: null,
      previous: null,
      children: [],
      name: item.name,
      type: item.type,
      media: [],
      heiarchy: [],
      content: item.content || null,
      details: item.type == 'book' ? {
        url: item.url || null,
        downloadedVersion: null,
        catalogVersion: item.version || null
      } : null
    };
  }

  function formatCatalog(item) {
    return formatBlank({
      path: '/',
      name: item.name,
      type: 'catalog'
    });
  }

  function formatFolder(item) {
    return formatBlank({
      path: '/' + item.id,
      name: item.name,
      type: 'folder'
    });
  }

  function formatBook(item) {
    return formatBlank({
      path: item.gl_uri,
      name: item.name,
      type: 'book',
      content: item.description,
      url: item.url,
      version: item.datemodified
    })
  }

  that.install = install;
}

if (typeof module != 'undefined') {
  module.exports = LDSCatalogInstaller;
}
