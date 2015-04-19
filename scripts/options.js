(function () {
	//var database, $;
	database = new DatabaseModel();
	$ = new dQuery();

	private = {
		themes: null,
		settings: null,
		template: null
	};

	function getI18nMessage(name, params) {
		if (typeof name != 'string') {
			return name;
		}
		return chrome.i18n.getMessage(name, params) || name;
	}

	function valueChanged(e) {

	}

	function save() {
		var settings = {
			theme: $('#theme').value,
			'themeOptions': {
				background: $('#background-color').value,
				color: $('#text-color').value,
				accent: $('#accent-color').value,
				highlight: $('#highlight-color').value,
				margins: $('#margin-size').value,
				fontFamily: $('#font-family').value,
				fontSize: Math.pow(10, $('#font-size').value) * 12,
				hideFootnotes: $('#hide-footnotes').checked
			},
		};

		database.settings.update(settings)
			.then(function () {
				if (!$('#enable-overrides').checked) {
					return database.settings.revert('themeOptions');
				}
			})
			.then(load)
			.then(makeMessage('saved'));
	}

	function makeMessage(message) {
		return function () {
			$('#save-message').innerText = getI18nMessage(message);
			setTimeout(function () {
				$('#save-message').innerText = '';
			}, 2000);
		}
	}

	function close() {
		window.close();
	}

	function load() {
		return Promise.all([
			database.settings.getAll().then(setter('settings')),
			database.settings.getRaw().then(setter('rawSettings'))
		]).then(function () {
			private.template.update('content', {
				page: {
					themes: private.themes,
					settings: private.settings,
					rawSettings: private.rawSettings,
					generator: new HtmlGenerator(private.settings, getI18nMessage)
				}
			});

			$.click('#content .contents li a', function (e) {
				$.removeClass('#content .contents li', 'selected');
				$.addClass(e.target.parentElement, 'selected');
				$.removeClass('#content .main-content>*', 'selected');
				$.addClass(e.target.hash, 'selected');
			}, true);
			$.click('#save-button', save);
			$.click('#cancel-button', load);
			$.click('#clear-database', function () {
				database.server.nodes.clear().then(makeMessage('cleared'))
			})

		});
	}

	function setter(name) {
		return function (value) {
			private[name] = value;
			return value;
		};
	}

	database.open().then(function () {
		return Promise.all([
			database.downloader.download('themes/default/options.less'),
			database.theme.getAll().then(setter('themes'))
		]);
	}).then(function (results) {
		private.template = new EJS({
			url: 'themes/default/options.ejs'
		});

		less.render(results[0], {
			globalVars: {}
		}).then(function (output) {
			$('#custom-css').innerHTML = output.css;
		}, function (error) {
			throw error;
		});
	}).then(load);
})();


//TODO GET Data to display and add event listeners