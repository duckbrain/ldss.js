var messageProvider = new ChromeMessageProvider();
var database = new DatabaseModel(new LDSContentProvider(new BrowserDownloader()));
var qDatabase = new DatabaseQuery(messageProvider);
var options, languageId, omnibox;

function log(e) {
	console.log(e);
	return e;
}

database.open().then(database.options.getAll).then(function (s) {
	options = s;
	languageId = s.language;
	omnibox = new OmniBoxSearchController(database);
	omnibox.init(languageId)
});

messageProvider.on('download-catalog', function (e, sender) {
	e.languageId = e.languageId || languageId;
	return database.download.downloadCatalog(e.languageId);
});

messageProvider.on('download-book', function (e, sender) {
	return database.download.downloadBook(e.bookId);
});

messageProvider.on('node-exists', function (e, sender) {
	e.languageId = e.languageId || languageId;
	return database.node.exists(e.languageId, e.path);
});

messageProvider.on('node-get', function (e, sender) {
	e.languageId = e.languageId || languageId;
	return database.node.get(e.languageId, e.path);
});

messageProvider.on('open', function (e, sender) {
	chrome.tabs.create({
		url: e.path,
		openerTabId: sender.tab.id
	});
});

messageProvider.on('miss', function (e, sender) {
	var result = qDatabase.execute(database, e.action, e.params);
	if (!qDatabase.isFailed(result)) {
		return result;
	}

	console.error('missed event: ', e);
	throw {
		message: 'Missed event',
		e: e,
		sender: sender
	};
});

chrome.app.runtime.onLaunched.addListener(function() {
	chrome.app.window.create('chrome.html', {
		bounds: {
			width: 970,
			height: 500
		}
	});
});
