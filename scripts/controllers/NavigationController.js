function NavigationController(database) {
	var that, render;

	that = {
		// set by load
		file: 'index.html',
		path: '/',
		verses: null,
		scrollTo: 0,
		languageCode: null,
		// set by navigate
		node: null,
		book: null,
		// set by initialize
		language: null,
		settings: null,
		getI18nMessage: function (v) {
			return v;
		}
	};
	render = new RenderController(that);
	render.initialize();
	render.onStateChanged.add(updateState);
	that.render = render;

	database.download.progress = function (message) {
		navigate(statusNode(message)).then();
	}

	function updateState() {
		if (that.node) {
			history.replaceState(getState(), that.node.name, getFullPath());
			console.log(history.state);
		}
	}

	function getState() {
		return {
			path: that.path,
			node: that.node,
			verses: that.verses,
			versesParsed: that.versesParsed,
			scrollTo: that.scrollTo,
			file: that.file,
			book: that.book,
			language: that.language,
			renderState: render.getState()
		};
	}

	function restoreState(state) {
		for (var name in state) {
			that[name] = state[name];
		}

		if (state.node) {
			render(state.node).then(function () {
				render.restoreState(state.renderState);
			});
		} else {
			throw state;
		}
	}

	function checkDownloads(node) {
		if (!node) {
			database.download.downloadCatalog(that.language.id).then(function () {
				return database.node.getPath(that.language.id, '/')
					.then(resetNavigation)
					.then(navigate);
			});
			return statusNode('downloading catalog');
		} else if (node.type == 'book' && !node.details.downloadedVersion) {
			database.download.downloadBook(node.id).then(function () {
				return database.node.get(node.id)
					.then(resetNavigation)
					.then(navigate);
			});
			return statusNode('downloading book');
		}
		return node;
	}

	/**
	 * Resets the verses and scroll position in preperation to load a new page.
	 */
	function resetNavigation(node) {
		that.path = node.path;
		that.verses = null;
		that.versesParsed = [];
		that.scrollTo = 0;
		return node;
	}

	/**
	 * Loads an node by id and navigates to it
	 * @param {integer} id node.id
	 */
	function navigateId(id) {
		return database.node.get(id)
			.then(function (node) {
				if (!node) {
					// Just go back to the catalog if the node is not found, instead of redownloading the catalog.
					return database.node.getPath(that.language.id, '/');
				} else {
					return node;
				}
			})
			.then(checkDownloads)
			.then(resetNavigation)
			.then(navigate);
	}

	/**
	 * Parses the path and verse elements of the supplied path and navigates to that node.
	 * @param {string} path A path from a node's content. The path is not fully qualified.
	 */
	function navigatePath(path) {
		loadPathnameAndVerses(path);
		return navigateLoaded()
			.then(resetNavigation);
	}

	/**
	 * Navigates to a path that has been loaded through loadPath()
	 */
	function navigateLoaded() {
		return database.node.getPath(that.language.id, that.path)
			.then(function (node) {
				if (!node && that.path != '/') {
					var pathBackup = that.path;
					// Traverse up the path if it does not exist.
					var pathParts = that.path.split('/');
					pathParts.pop();
					that.path = pathParts.join('/');

					if (that.path.indexOf('/') != 0) {
						that.path = '/';
					}

					var result = navigateLoaded();
					that.path = pathBackup;
					return result;
				} else {
					return Promise.resolve(checkDownloads(node)).then(navigate);
				}
			});
	}

	function navigate(node) {
		var p;

		// Update the current state, so it can be gone back to
		updateState();
		render.resetState();

		// If it's a node and the current book does not have the same id as it's bookId
		if (node.type == 'node' && (!that.book || that.book.id != node.details.bookId)) {
			p = database.node.get(node.details.bookId).then(function (book) {
				that.book = book;
				return node;
			}).then(render);
		} else {
			that.book = node.type == 'book' ? node : null;
			p = render(node);
		}

		return p.then(function () {
			that.node = node;
			if (!that.node || that.node.type == 'status') {
				updateState();
			} else {
				history.pushState(getState(), node.name, getFullPath());
			}
			return node;
		});
	}

	function statusNode(status) {
		return {
			type: 'status',
			status: status
		};
	}

	function getFullPath() {
		var fullPath = that.verses ? [that.path].concat(that.verses).join('.') : that.path;
		var query = that.language ? '?lang=' + that.language.code_three : '';
		return that.file + '?' + fullPath + query;
	}

	function getUrlParameter(name, search) {
		search = (typeof search == 'string') ? search : location.search;
		return decodeURIComponent((new RegExp('[?|&]' + name + '=' +
					'([^&;]+?)(&|#|;|$)').exec(location.search) || [, ""])[1]
				.replace(/\+/g, '%20')) ||
			null
	}

	function loadPathnameAndVerses(path) {
		var parts, range, i, j, numbers;

		parts = path.split('.');
		that.path = parts[0];
		if (parts[1]) {
			parts.shift();
			that.verses = parts.join('.');
			parts = that.verses.replace(/\./g, ',').split(',');
			for (i = 0; i < parts.length; i++) {
				range = parts[i].split('-');
				if (range.length > 1) {
					numbers = [];
					for (j = range[0]; j <= range[1]; j++) {
						numbers.push(j);
					}
					range = [i, 1].concat(numbers);
				} else {
					range = [i, 1].concat(range);
				}
				j = range.length - 3;
				Array.prototype.splice.apply(parts, range);
				i += j;
			}
			that.versesParsed = parts;
			that.scrollTo = parts[0]
		} else {
			that.verses = null;
			that.versesParsed = [];
			that.scrollTo = 0;
		}
	}

	function loadPath(href) {
		var path, query, hash, parts;

		parts = href.split('?');

		// Get file, path, and verses
		that.file = parts[0];
		loadPathnameAndVerses(parts[1] || '/');

		// Get the language code
		query = parts[2] || '';
		that.languageCode = getUrlParameter('lang', query);

		// Get the scrolled to verse
		hash = href.substring(href.lastIndexOf('#') + 1);
		href = parseInt(href);
		that.scrollTo = isNaN(href) ? null : href;
	}

	/**
	 * Initializes everything dependant on the settings. Can be called after page load to update changes to the settings.
	 * @return {Promise} A promise when the initialization is done. Just returns the NavigationModel.
	 */
	function initialize() {
		return database.settings.getAll().then(function (settings) {
			var languageGetter;
			that.settings = settings;

			return Promise.all([
				(that.languageCode ? database.language.getByLdsCode(that.languageCode) : database.language.get(
					settings.language))
				.then(function (language) {
					that.language = language;
					that.languageCode = language.code_three;
				}),
				database.theme.get(settings.theme).then(function (theme) {
					return render.loadTheme(theme);
				})
			]).then(function () {
				return that;
			});
		});
	}

	that.loadPath = loadPath;
	that.render = render;
	that.navigate = navigate;
	that.navigateId = navigateId;
	that.navigatePath = navigatePath;
	that.navigateLoaded = navigateLoaded;
	that.initialize = initialize;

	window.addEventListener('popstate', function () {
		console.log(history.state);
		restoreState(history.state);
	});

	return that;
}
