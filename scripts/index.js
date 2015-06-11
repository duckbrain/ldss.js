(function () {
	//var database, view;

	function getI18nMessage(name, params) {
		return name;
	}

	database = new DatabaseModel();
	view = new DomView();
	view.getI18nMessage = getI18nMessage;

	var state = view.parsePath(location.href);
	view.subscribeNodeChangeWithPath(function(path) {
		database.node.getByPath(path).then()
	});
	view.parsePath(location.href);

	database.open().then(function() {
		Promise.all([
			database.languages.getAll(),
			database.options.getAll()
		]).then(function(e) {
			view.setLanguages(e[0]);
			view.setOptions(e[1]);
		});
	});
})();

function log(debug) {
	console.log(debug);
	return debug;
}
