(function() {

	database = new DatabaseModel();

	var private = {
		debug: window.debug || true,
		configuration: null,
		theme: null,
		page: null,
		template: null,
		contentElement: document.getElementById('main-content')
	};

	function displayPage(info) {
		var conf = private.configuration;

		console.log(info);
		private.page = info;
		private.contentElement.innerHTML = private.template.render({
			lang: conf.language,
			info: info,
			_: getI18nMessage
		});
		attachLinks('a[data-info]', onLinkClicked);
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
		console.log(e);
		var info = JSON.parse(e.target.dataset.info);
		database.path.getDetails(info).then(displayPage);
		console.log(info);

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
		var name, param, overrides, value;

		overrides = {
			language: 'lang',
			path: 'q',
			refrence: 'ref'
		};

		return database.settings.getAll().then(function(configuration) {
			for (name in overrides) {
				param = overrides[name];
				value = getUrlParameter(param);
				if (value) {
					configuration[name] = value;
				}
			}

			if (!configuration.path) {
				configuration.path = '/';
			}

			private.configuration = configuration;
			return configuration;
		});
	}

	database.open()
		.then(getConfiguration)
		.then(function(conf) {
			return Promise.all([
				database.path.get(conf.language, conf.path),
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
