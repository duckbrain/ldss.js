var messageProvider = new ChromeMessageProvider();
var database = new DatabaseModel(new LDSContentProvider(new BrowserDownloader()));
database.download.CatalogInstaller = LDSCatalogInstaller;
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

messageProvider.on('node-exists', function (e, sender) {
	e.languageId = e.languageId || languageId;
	return database.node.exists(e.languageId, e.path);
});

messageProvider.on('node-get', function (e, sender) {
	e.languageId = e.languageId || languageId;
	return database.node.getPath(e.languageId, e.path);
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

var myWin = null;

chrome.app.runtime.onLaunched.addListener(function() {
  chrome.app.window.create('sql.html', {
    'bounds': {
      'width': 400,
      'height': 400
    }
  }, function(win) {
       myWin = win;
       myWin.contentWindow.postMessage('Just wanted to say hey.', '*');
     });
});
