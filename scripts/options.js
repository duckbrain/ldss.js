(function() {
	var database = new DatabaseModel();
	var private = {
		themes: null,
		settings: null
	};

	function i18n(value) {
		//TODO: Something that works
		return value;
	}

	function load() {
		new EJS({
			url: 'themes/options/template.ejs'
		}).update('content', {
			page: {
				themes: private.themes,
				settings: private.settings,
				generator: new HtmlGenerator(private.settings, i18n)
			}
		});
	}

	function setter(name) {
		return function(value) {
			private[name] = value;
			return value;
		};
	}

	database.open().then(function() {
		return Promise.all([
			database.settings.getAll().then(setter('settings')),
			database.theme.getAll().then(setter('themes'))
		]);
	}).then(load);
})();


//TODO GET Data to display and add event listeners
