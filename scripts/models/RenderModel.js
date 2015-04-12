function RenderModel(navigation) {
	var that, template, $, elements;
	$ = new dQuery();
	elements = null;

	function initialize() {
		elements = {
			document: window.document,
			body: window.document.body,
			customCSS: $('#custom-css'),
			bookCss: $('#book-css'),
			content: $('#main-content'),
			refrences: $('.refrences'),
		}
	}

	function onPageLinkClicked(e) {
		var id = e.target.dataset.id;
		navigation.navigateId(parseInt(id));
		//TODO Handle all different types of links for navigation and footnotes.
	}

	function onContentLinkClicked(e) {
		var path = e.target.pathname;

		if (path.indexOf('/f_') == 0) {
			console.log('ref', path);
			openRefrence(path.substring(1));
		} else {
			navigation.navigatePath(path);
		}
	}

	function onRefrenceClosedClicked(e) {
		e.stopPropagation();
		e.cancelBubble = true
		closeRefrencePanel();
	}

	function onLanguageSelected(e) {
		var id = parseInt(e.target.value);
		return database.language.get(id)
			.then(function(language) {
				navigation.language = language;
				return render(navigation.node);
			});
	}

	function openRefrence(reference) {
		var refrenceElement = elements.document.getElementById(reference);

		$.queryAll('.refrences .selected', function(ele) {
			$.removeClass(ele, 'selected');
		});
		$.addClass(elements.body, 'refrences-open');
		$.addClass(refrenceElement, 'selected');

		elements.refrences.scrollTop = refrenceElement.offsetTop;
	}

	function closeRefrencePanel() {
		$.removeClass(elements.body, 'refrences-open');
	}

	function render(node) {

		elements.bookCss.innerHTML = navigation.book ? navigation.book.details.css : '';

		elements.document.title = navigation.getI18nMessage('app_title') + ' - ' + node.name;
		elements.content.innerHTML = template.render({
			page: {
				settings: navigation.settings,
				node: node,
				languages: navigation.languages,
				generator: new HtmlGenerator(navigation, navigation.getI18nMessage),
				loading: navigation.getI18nMessage(node.status)
			},
			_: navigation.getI18nMessage
		});
		initialize();
		$.attachLinks('.refrences-close', onRefrenceClosedClicked);
		$.attachLinks('#main-content a[data-id]', onPageLinkClicked);
		$.attachLinks('.content a[href], .refrences a[href]:not(.refrences-close)', onContentLinkClicked);

		//TODO: Check for verses and scroll to there instead
		//TODO: Find the offset of what is visible and scroll there.
		elements.body.scrollTop = 0;

		return Promise.resolve(node);
	}

	function loadTheme(theme) {
		console.log("Theme: ", theme)
		template = new EJS({
			text: theme.template
		});
		return less.render(theme.style, {
			globalVars: navigation.settings.themeOptions
		}).then(function(output) {
			elements.customCSS.innerHTML = output.css;
		});
	}

	that = render;
	that.loadTheme = loadTheme;
	that.initialize = initialize;
	that.closeRefrencePanel = closeRefrencePanel;

	return that;
}
