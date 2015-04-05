function PathModel(database) {
  var that = this;

  function get(id) {
    return database.server.paths.get(id);
  }

  function getPath(languageId, path) {
    return database.server.paths.query('path')
      .only([languageId, path]).execute().then(database.helpers.single);
  }

  function exists(languageId, path) {
    return getPath(languageId, path).then(function(item) {
      return !!item;
    });
  }

  function add(item) {
    return database.server.paths.add(item);
  }

  function update(item) {
    return database.server.paths.update(item);
  }

  function clear(languageId) {
    //TODO: Limit to languageId
    return database.server.paths.clear();
  }

  that.add = add;
  that.clear = clear;
  that.get = get;
  that.getPath = getPath;
  that.update = update;
  that.exists = exists;
}

if (typeof module != 'undefined') {
  module.exports = PathModel;
  module.exports = PathModel;
}