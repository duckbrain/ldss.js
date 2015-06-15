function ReadController(model, view) {
	var language = { id: 1, code_three: "eng" };
	var options, theme;
	var node = null;

	function start() {
		view.subscribeNodeChangeWithPath(setNodeByPath);
		view.subscribeNodeChangeWithId(setNodeById);
		view.subscribeLanguageChange(setLanguageByLdsCode);

		model.download.subscribeQueueChanged(setDownloads);
		model.download.subscribeStatusChanged(setDownloadStatus);

		return model.open()
			.then(initializeDatabase)
			.then(populateInitialView);
	}

	function initializeDatabase() {
		return model.language.getAll().then(function languages() {
			if (languages.length == 0) {
				return model.language.download;
			}
		});
	}

	function populateInitialView() {
		view.init();

		return Promise.all([
			model.language.getAll().then(view.setLanguages)
			.then(model.options.getAll)
			.then(function(options) {
				setOptions(options);
				model.theme.get(options.theme).then(setTheme);
				model.language.get(options.language).then(view.setLanguage);
				setNodeByPath('/');
			})
		]);
	}

	function setOptions(o) {
		options = o;
		view.setOptions(o);
		renderTheme();
	}

	function setTheme(t) {
		theme = t;
		renderTheme();
	}

	function setDownloads() {
		view.setDownloads(model.download.getQueue());
	}

	function setDownloadStatus() {

	}

	function renderTheme() {
		if (theme && options) {
			less.render(theme.style, {
				globalVars: options.themeOptions || theme.defaultOptions
			}).then(function (output) {
				theme.css = output.css;
				view.setTheme(theme)
			});
		}
	}

	function setNodeByPath(path) {
		if (path) {
			model.node.getPath(language.id, path).then(setNode);
		} else {
			setNode(null);
		}
	}

	function setNodeById(id) {
		if (id) {
			model.node.get(id).then(setNode);
		} else {
			setNode(null);
		}
	}

	function setNode(n) {
		node = n;

		if (!node) {
			view.setMessage({
				message: "Node not found"
			})
		} else if (node.type == 'book' && !node.details.downloadedVersion) {
			model.download.downloadBook(node).then(function() {
				if (model.download.getQueue().length == 0) {
					model.node.get(node.id).then(setNode).then(setDownloads);
					setDownloads();
				}
			});
			setDownloads();
		} else {
			view.setNode(n);
		}


	}

	function setLanguageByLdsCode(languageCode) {
		if (languageCode) {
			model.language.getByLdsCode(languageCode).then(function(lang) {
				language = lang;
				view.setLanguage(lang);
			});
		} else {
			language = null;
			view.setLanguage(null);
		}
	}

	this.start = start;
}
