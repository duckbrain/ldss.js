function DownloadModel(database) {
  var that = this;
  var downloads = [];

  that.CatalogInstaller = LDSCatalogInstaller;
  that.BookInstaller = LDSZBookInstaller;

  function downloadCatalog(languageId) {
    var installer = new that.CatalogInstaller(database.path, languageId);
    return database.contentProvider.getCatalog(languageId).then(installer.install);
  }

  function downloadBook(bookId) {
    return database.path.get(bookId).then(function(book) {
      return database.contentProvider.getBook(book.details.url).then(function(sqlitedb) {
        var installer = new that.BookInstaller(database.path, sqlitedb, book);
        var p = installer.install();
        sqlitedb.close();
        delete sqlitedb;
        return p;
      });
    });
  }

  that.downloadCatalog = downloadCatalog;
  that.downloadBook = downloadBook;
}
