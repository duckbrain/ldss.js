var messageProvider = new ChromeMessageProvider();
var database = new DatabaseModel();

function log(e) {
    console.log(e);
}

database.open().then();

messageProvider.on('path-exists', function(e, sender, callback) {
    database.path.exists(e.path).then(function responseReceived(response) {
        e.response = response;
        console.log('path-exists', e);
        callback(e);
    });
})

messageProvider.on('open', function(e, sender, callback) {
    console.log('open', e);
    chrome.tabs.create({
        url: e.href,
        openerTabId: sender.tab.id
    }, callback);
});