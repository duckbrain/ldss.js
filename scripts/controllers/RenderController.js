function RenderController(navigation) {
	var that, template, $, elements, openedReference, onStateChanged, keyboard;
	$ = new dQuery();
	elements = null;
	openedReference = null;
	onStateChanged = new EventHandler();
	onStateChanged.getParam = getState;

	var firstInit = false;

	function init() {
		elements = {
			window: window,
			document: window.document,
			body: window.document.body,
			customCSS: $('#custom-css'),
			bookCss: $('#book-css'),
			content: $('#main-content')
		}
		elements.body.addEventListener('scroll', onStateChanged.fire);
		keyboard.listen(elements.document);
	}

	function updateElements() {
		elements.references = $('.references');
	}


	function getState() {
		return {
			openedReference: openedReference,
			scrollPosition: elements.body.scrollTop
		};
	}

	function restoreState(state) {
		openReference(state.openedReference);
		elements.body.scrollTop = state.scrollPosition;
	}

	function resetState() {
		closeReferencePanel();
	}

	function onPageLinkClicked(e) {
		if (!e.currentTarget) {
			return;
		}

		e.currentTarget.disabled = true;
		var id = e.currentTarget.dataset.id;
		if (!isNaN(id)) {
			navigation.navigateId(parseInt(id));
		}
		//TODO Handle all different types of links for navigation and footnotes.
	}

	function onContentLinkClicked(e) {
		var path = e.currentTarget.pathname;

		if (e.currentTarget.tagName != 'A') {
			return;
		}

		if (path.indexOf('/f_') == 0) {
			openReference(path.substring(1));
		} else {
			navigation.navigatePath(path);
		}
	}

	function onReferenceClosedClicked(e) {
		e.stopPropagation();
		e.cancelBubble = true
		closeReferencePanel();
	}

	function onLanguageSelected(e) {
		var id = parseInt(e.currentTarget.value);
		return database.language.get(id)
			.then(function (language) {
				navigation.language = language;
				return render(navigation.node);
			});
	}

	function openReference(reference) {
		var referenceElement;

		if (!reference) {
			openedReference = null;
			$.removeClass(elements.body, 'references-open');
		} else {
			openedReference = reference;
			referenceElement = $.id(reference);
			$.queryAll('.references .selected', function (ele) {
				$.removeClass(ele, 'selected');
			});
			$.addClass(elements.body, 'references-open');
			$.addClass(referenceElement, 'selected');
			elements.references.scrollTop = referenceElement.offsetTop;
		}
		onStateChanged.fire();
	}

	function scrollTo(element) {
		if (element) {
			elements.body.scrollTop = element.offsetTop - element.clientHeight / 2 // - elements.window.outerHeight / 2 + element.clientHeight;
		} else {
			elements.body.scrollTop = 0;
		}
	}

	function closeReferencePanel() {
		openReference(null);
	}

	function highlightVerses(verses) {
		$.removeClass('.page-content .selected', 'selected');
		$.addClass(verses.map($.id), 'selected');
	}

	function render(node) {

		elements.bookCss.innerHTML = navigation.book ? navigation.book.details.css : '';

		elements.document.title = node.name + ' - ' + navigation.getI18nMessage('app_title');
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
		updateElements();
		$.attachLinks('.references-close', onReferenceClosedClicked);
		$.attachLinks('#main-content a[data-id]', onPageLinkClicked);
		$.attachLinks('.content a[href], .references a[href]:not(.references-close)', onContentLinkClicked);

		highlightVerses(navigation.versesParsed);

		// Scroll to the appropriate position
		scrollTo(navigation.versesParsed[0] ? $.id(navigation.versesParsed[0]) : null);

		database.keyboard.selectedNumber = 0;
		database.keyboard.minNumber = 0;
		database.keyboard.maxNumber = $.queryAll('.verse, .children a').length;

		return Promise.resolve(node);
	}

	function loadTheme(theme) {
		template = new EJS({
			text: theme.template
		});
		return less.render(theme.style, {
			globalVars: navigation.settings.themeOptions
		}).then(function (output) {
			elements.customCSS.innerHTML = output.css;
		});
	}

	that = render;
	keyboard = new KeyboardController(database, that);
	that.loadTheme = loadTheme;
	that.init = init;
	that.getState = getState;
	that.restoreState = restoreState;
	that.resetState = resetState;
	that.onStateChanged = onStateChanged;
	that.scrollTo = scrollTo;
	that.highlightVerses = highlightVerses;
	that.onPageLinkClicked = onPageLinkClicked;
	that.onContentLinkClicked = onContentLinkClicked;

	return that;
}