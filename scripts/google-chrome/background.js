var messageProvider = new ChromeMessageProvider();
var database = new DatabaseModel(new LDSContentProvider(new BrowserDownloader()));
var languageId;
var logged = [];

function log(e) {
  logged.push(e);
  console.log(e);
  return e;
}

function installBook(book) {
  return database.contentProvider.getBook(book.details.url).then(log).then(function(sqlitedb) {
    var installer = new LDSZBookInstaller(database.path, sqlitedb, book);
    var p = installer.install();
    sqlitedb.close();
    delete sqlitedb;
    return p;
  });
}

database.open().then(database.language.download).then(database.settings.getLanguage).then(function(id) {
  languageId = id;
}).then(log);

messageProvider.on('download-catalog', function(e, sender) {
  e.languageId = e.languageId || languageId;
  return database.download.downloadCatalog(e.languageId);
});

messageProvider.on('download-book', function(e, sender) {
  return database.download.downloadBook(e.bookId);
});

messageProvider.on('path-exists', function(e, sender) {
  e.languageId = e.languageId || languageId;
  return database.path.exists(e.languageId, e.path);
});

messageProvider.on('path-get', function(e, sender) {
  e.languageId = e.languageId || languageId;
  return database.path.get(e.languageId, e.path);
});

messageProvider.on('open', function(e, sender) {
  chrome.tabs.create({
    url: e.path,
    openerTabId: sender.tab.id
  });
});

messageProvider.on('miss', function(e, sender) {
  console.error('missed event: ', e);
  throw {
    message: 'Missed event',
    e: e,
    sender: sender
  };
});
