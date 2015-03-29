/**
 * Takes a catalog object downloaded from LDS.org and installs it into the paths
 * objectStore.
 * @param {DatabaseModel} database Database model for inter-class communication.
 */
function LDSCatalogInstaller(database) {
  var that = this;

  function install(root, languageId) {
    //
    // Add all of the items and have ID's assigned.
    //
    return database.path.clear(languageId).then(function() {
      add(root.catalog, formatCatalog, null, true, languageId)
        //
        // Then update those items to make refrence to those ID's for
        // their family members.
        //
        .then(update);
    });
  }

  function add(glItem, formatter, parent, hasChildren, languageId) {
    var item = formatter(glItem, languageId);

    return database.path.add(item).then(function(item) {.
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
          return add(glFolder, formatFolder, item, true, languageId);
        });
        bookAdds = glItem.books.map(function(glBook) {
          return add(glBook, formatBook, item, false, languageId);
        });
        return Promise.all(folderAdds.concat(bookAdds)).then(function() {
          //TODO: Sort by display order
          item.next = findSibling(+1, item);
          item.previous = findSibling(-1, item);
          return item;
        });
      } else { //It's a book
        item.children = [];
        return item;
      }
    });
  }

  function findSibling(direction, item) {
    var index, siblings;

    if (item.parent) {
      siblings = item.parent.children
      index = siblings.indexOf(item);

      if (siblings[index + direction]) {
        return siblings[index + direction];
      } else {
        //TODO Traverse to find better sibling
        return null;
      }
    } else {
      return null;
    }
  }

  function formatBlank(item) {
    return {
      languageId: item.languageId,
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

  function formatCatalog(item, languageId) {
    return formatBlank({
      languageId: languageId,
      path: '/',
      name: item.name,
      type: 'catalog'
    });
  }

  function formatFolder(item, languageId) {
    return formatBlank({
      languageId: languageId,
      path: '/' + item.id,
      name: item.name,
      type: 'folder'
    });
  }

  function formatBook(item, languageId) {
    return formatBlank({
      languageId: languageId,
      path: item.gl_uri,
      name: item.name,
      type: 'book',
      content: item.description,
      url: item.url,
      version: item.datemodified
    })
  }

  function update(item) {
    var children = item.children;
    item.heiarchy = summary(item.heiarchy);
    item.next = summary(item.next);
    item.preivous = summary(item.previous);
    item.children = summary(item.children);
    return Promise.all([
      database.path.update(item),
      children.map(updateSummaries)
    ]);
  }

  function summary(item) {
    if (!item) {
      return null;
    } else if (Array.isArray(item)) {
      return item.map(summary);
    } else {
      return {
        id: item.id,
        name: item.name,
        path: item.path,
        type: item.type
      };
    }
  }

  that.install = install;
}

if (typeof module != 'undefined') {
  module.exports = LDSCatalogInstaller;
}
