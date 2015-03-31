(function() {

	database = new DatabaseModel();

	var private = {
		debug: window.debug || true,
		// An object that contains all of the information, outside the database and
		// the theme, on how to display the page
		configuration: null,
		// An interchangable theme that will generate the final HTML and provides
		// CSS and JavaScript to help the page
		theme: null,
		// The database object of the path to display
		page: null,
		// An EJS template from the theme to generate the HTML with.
		template: null,
		contentElement: document.getElementById('main-content')
	};

	function displayPage(info) {
		var conf = private.configuration;

		console.log(info);
		private.page = info;
		private.contentElement.innerHTML = private.template.render({
			page: {
				configuration: conf,
				path: info,
				getI18nMessage: getI18nMessage,
				generator: new HtmlGenerator(conf, getI18nMessage)
			}
		});
		attachLinks('a[data-path]', onLinkClicked);
		return info;
		//return prefetch(info);
	}

	function attachLinks(query, handler) {
		var links = document.querySelectorAll(query);
		for (var i = 0; i < links.length; i++) {
			links[i].addEventListener('click', handler);
		}
	}

	function onLinkClicked(e) {
		var id = parseInt(e.target.dataset.path);
		database.path.get(id).then(displayPage);

		e.preventDefault();
		return false;
	}

	function onRefrenceClicked(e) {

	}

	function loadTheme(theme) {
		private.theme = theme;
		private.template = new EJS({
			text: private.theme.template
		});
	}

	function getUrlParameter(name) {
		return decodeURIComponent((new RegExp('[?|&]' + name + '=' +
					'([^&;]+?)(&|#|;|$)').exec(location.search) || [, ""])[1]
				.replace(/\+/g, '%20')) ||
			null
	}

	function getI18nMessage(name, params) {
		var message = chrome.i18n.getMessage(name, params);
		if (!message) {
			return name;
		}
		return message;
	}

	function getConfiguration() {
		var param = getUrlParameter;
		return database.settings.getAll().then(function(conf) {

			conf.language = parseInt(param('lang')) || conf.language;
			conf.path = param('q') || '/';
			conf.reference = param('ref') || null;
			//TODO: Parse the refrences

			private.configuration = conf;
			return conf;
		});
	}

	database.open()
		.then(getConfiguration)
		.then(function(conf) {
			return Promise.all([
				database.path.getPath(conf.language, conf.path),
				database.theme.get(conf.theme)
			]);
		}).then(function(e) {
			loadTheme(e[1]);
			return displayPage(e[0]);
		});

	if (private.debug) {
		window.debug = private;
		window.database = database;
		window.log = function log(e) {
			console.log(e);
			return e;
		};
	}
})();
