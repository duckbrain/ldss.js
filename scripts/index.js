(function () {
	//var database, navigation;

	function getI18nMessage(name, params) {
		if (typeof name != 'string') {
			return name;
		}
		return chrome.i18n.getMessage(name, params) || name;
	}

	database = new DatabaseModel();
	//database.download = new DatabaseQuery(new ChromeMessageProvider()).download;
	//database.contentProvider = new LocalContentProvider();
	navigation = new NavigationController(database);

	navigation.loadPath(location.href);
	navigation.getI18nMessage = getI18nMessage;

	database.open().then(navigation.initialize).then(navigation.navigateLoaded);
})();

function log(debug) {
	console.log(debug);
	return debug;
}
