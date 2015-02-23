var messageProvider = new ChromeMessageProvider();
var database = new DatabaseModel(new LDSContentProvider(new BrowserDownloader()));
database.setting = new SettingsModel(database);
database.language = new LanguageModel(database);
database.catalog = new CatalogModel(database);
database.node = new NodeModel(database);
database.book = new BookModel(database);
database.folder = new FolderModel(database);
database.path = new PathModel(database);

var db;

function log(e) {
    console.log(e);
    return e;
}

database.open().then();

messageProvider.on('path-exists', function(e, sender) {
    //return database.path.exists(e.message.path);
    return true;
})

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