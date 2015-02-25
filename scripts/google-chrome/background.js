var messageProvider = new ChromeMessageProvider();
var database = new DatabaseModel(
        new LDSContentProvider(new BrowserDownloader()));
database.settings = new SettingsModel(database);
database.language = new LanguageModel(database);
database.catalog = new CatalogModel(database);
database.node = new NodeModel(database);
database.book = new BookModel(database);
database.folder = new FolderModel(database);
database.path = new PathModel(database);

function log(e) {
    console.log(e);
    return e;
}

database.open().then(database.language.download()).then(log).then(
        database.settings.getLanguage).then(log).then(database.catalog.exists).then(log).then(
        function(exists) {
            if (!exists)
                return database.settings.getLanguage().then(database.catalog.download).then(log);
        });

messageProvider.on('path-exists', function(e, sender) {
    // return true;
    return database.path.exists(e.path);
});

messageProvider.on('path-get', function(e, sender) {
    return database.path.get(e.languageId, e.path);
});

messageProvider.on('open', function(e, sender) {
    chrome.tabs.create({
        url: e.href,
        openerTabId: sender.tab.id
    });
});

messageProvider.on('miss', function(e, sender) {
    console.error('missed event: ', e);
    throw 'Missed event';
});
