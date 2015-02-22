var messageProvider = new ChromeMessageProvider();
var database = new DatabaseModel();

database.open().then();

messageProvider.on('path-exists', function(e, callback) {
    database.path.exists(e.path).then(callback);
})

messageProvider.on('open', function(e, callback) {
    console.log('I need to open something');
    console.log(e);
    chrome.tabs.create({
        url: e.href
        //openerTabId: //TODO: populate this with the tab that clicked the link
    }, callback);
});