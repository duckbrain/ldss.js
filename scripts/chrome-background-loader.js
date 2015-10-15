var messageProvider = new ChromeMessageProvider();
var database = new DatabaseModel(new LDSContentProvider(new BrowserDownloader()));
database.download.CatalogInstaller = LDSCatalogInstaller;
var qDatabase = new DatabaseQuery(messageProvider);

messageProvider.on('download-book', function (e, sender) {
	return database.download.downloadBook(e.bookId);
});
