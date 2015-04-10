var messageProvider = new ChromeMessageProvider();
var database = new DatabaseModel(new LDSContentProvider(new BrowserDownloader()));
var languageId;

function log(e) {
  console.log(e);
  return e;
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

messageProvider.on('node-exists', function(e, sender) {
  e.languageId = e.languageId || languageId;
  return database.node.exists(e.languageId, e.path);
});

messageProvider.on('node-get', function(e, sender) {
  e.languageId = e.languageId || languageId;
  return database.node.get(e.languageId, e.path);
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
