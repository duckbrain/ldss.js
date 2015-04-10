/**
 * Takes a catalog object downloaded from LDS.org and installs it into the paths
 * objectStore.
 * @param {DatabaseModel} database Database model for inter-class communication.
 */
function LDSCatalogInstaller(db, languageId) {
  var that = this;
  var helpers = new LDSInstallerHelpers(db);
  var paths = {};
  that.progress = function() {};

  function progress(message) {
    return function(data) {
      that.progress(message);
      return data;
    }
  }

  function install(root) {
    //
    // Add all of the items and have ID's assigned.
    //
    return db.clear(languageId).then(progress('cleared')).then(function() {
      return add(root.catalog, formatCatalog, null)
        .then(progress('added'))
        //
        // Then update those items to make refrence to those ID's for
        // their family members.
        //
        .then(helpers.update).then('done');
    });
  }

  function add(glItem, format, parent) {
    var item = format(glItem);
    paths[item.path] = item;

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

      if (item.type != 'book') { // Catalog or folder
        folderAdds = glItem.folders.map(function(glFolder) {
          return add(glFolder, formatFolder, item);
        });
        bookAdds = glItem.books.map(function(glBook) {
          return add(glBook, formatBook, item);
        });
        return Promise.all(folderAdds.concat(bookAdds)).then(function() {
          //TODO: Sort by display order
          item.next = helpers.findSibling(+1, item);
          item.previous = helpers.findSibling(-1, item);
          return item;
        });
      } else { //It's a book!
        item.children = [];
        return item;
      }
    });
  }

  function createFolderPath(item) {
    if (item.children.length > 0) {
      // Try making one from the children
      pathElements = item.children[0].path.split('/');
      for (i = 1; i < item.children.length; i++) {
        otherPath = item.children[i].path.split('/');
        for (j = 0; j < pathElements.length; j++) {
          if (pathElements[j] != otherPath[j]) {
            pathElements = pathElements.slice(0, j);
          }
        }
      }
      newPath = pathElements.join('/');
      if (!newPath in paths) {
        path = newPath;
      } else {
        // Try making one from the parent and name
        otherPath = item.name.replace(/\W+/g, '-').toLowerCase();
        pathElements = item.parent.path.split('/');
        pathElements.push(otherPath);
        newPath = pathElements.join('/');
        if (!newPath in paths) {
          path = newPath;
        }
        //else default to number
      }
    }
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
    //TODO: Make a path name by looking at what the children have in common or the name. Ensure that the same path name
    //is not used more than once. If the generated name matches an existing one, fall back to the id number
    var path = '/' + item.id;
    var i, j, pathElements, otherPath, newPath;

    return formatBlank({
      path: path,
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
