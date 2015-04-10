function NavigationModel(database) {
	var that, elements, $, db, template;

	$ = new dQuery();
	db = database.node;
	that = {
		file: 'index.html',
		path: '/',
		language: null,
		verses: [],
		node: null,
		scrollTo: 0,
		settings: null,
		getI18nMessage: function(v) {
			return v;
		}
	};


	//
	// Dealing with elements
	//

	function lookupElements() {
		elements = {
			document: window.document,
			body: window.document.body,
			customCSS: $('#custom-css'),
			content: $('#content'),
			refrences: $('.refrences')
		}
	}

	function onLinkClicked(e) {
		console.log(e);
		//TODO Handle all different types of links for navigation and footnotes.
	}

	function onRefrenceClosedClicked(e) {
		$.removeClass(elements.body, 'refrences-open');
	}

	function onLanguageSelected(e) {
		var id = parseInt(e.target.value);
		return database.language.get(id)
			.then(function(language) {
				that.language = language;
				return render(that.node);
			});
	}

	function render(node) {
		elements.document.title = getI18nMessage('app_title') + ' - ' + info.name;
		elements.content.innerHTML = template.render({
			page: {
				settings: that.settings
				node: node,
				languages: that.languages,
				generator: new HtmlGenerator(that.settings, that.getI18nMessage),
				loading: getI18nMessage(node.status)
			},
			_: that.getI18nMessage
		});
		lookupElements();
		$.attachLinks('.page-content a', onLinkClicked);
		$.attachLinks('.refrences-close', onRefrenceClosedClicked);

		//TODO: Check for verses and scroll to there instead
		//TODO: Find the offset of what is visible and scroll there.
		elements.body.scrollTop = 0;

		return Promise.resolve(node);
	}


	//
	// Dealing with navigation logic and downloading
	//

	function navigatePath(path) {
		// TODO: Traverse up the path if it does not exist.
		db.getPath(that.language.id, path).then(navigate);
	}

	function navigate(node) {
		if (!node) {
			node = {
				type: 'status',
				status: 'downloading catalog'
			}
		}
		switch (node.type) {
			case 'book':
				if (!node.details.downloadedVersion) {
					return database.download.downloadBook(node.id).then(function() {
						return db.get(node.id).then(navigate);
					});
				}
				break;
		}

		that.node = node;
		return render(node).then(function() {
			if (node.type != 'status') {
				history.pushState(node, node.name, getFullPath(node));
			}
			return node;
		});
	}

	function getFullPath(node, verses) {
		var fullPath = verses ? [node.path].concat(verses).join('.') : node.path;
		var query = this.language ? '?lang=' + this.language.code_three : '';
		return this.file + '?' + fullPath + query;
	}

	function load(href) {
		var query, hash;
		href = href.substring(href.indexOf('?') + 1);
		query = href.substring(href.indexOf('?') + 1);
		hash = query.substring(query.lastIndexOf('#') + 1);

	}

	function loadTheme(theme) {
		console.log("Theme: ", theme)
		template = new EJS({
			text: theme.template
		});
		less.render(theme.style, {
			globalVars: that.settings.themeOptions
		}).then(function(output) {
			elements.customCSS.innerHTML = output.css;
		});
	}

	function initialize() {

	}

	that.load = load;
	that.render = render;
	that.navigate = navigate;

	window.addEventListener('popstate', function() {
		render(history.state);
	});

	return that;
}
