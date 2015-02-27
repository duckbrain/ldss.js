var messageProvider = new ChromeMessageProvider();
var database = new DatabaseModel(new LDSContentProvider(new BrowserDownloader()));
var languageId;

function log(e) {
    console.log(e);
    return e;
}

database.open().then(database.language.download).then(database.settings.getLanguage).then(function(id) {
    languageId = id;
    log(id);
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
    throw 'Missed event';
});
