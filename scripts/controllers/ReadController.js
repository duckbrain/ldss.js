function ReadController(model, view) {
	function start() {
		view.subscribeNodeChangeWithPath(onNodeChangedWithPath);
		view.subscribeLanguageChange(onLanguageChange);

		model.open().then(function() {
			view.init();

			model.language.getAll().then(view.setLanguages);
			model.options.getAll().then(function(options) {
				view.setOptions(options);
				model.theme.get(options.theme).then(view.setTheme);
			});
		});
	}

	function onNodeChangedWithPath(path) {
		//model.node.getByPath(path).then()
	}

	function onLanguageChange(languageCode) {

	}

	this.start = start;
}
