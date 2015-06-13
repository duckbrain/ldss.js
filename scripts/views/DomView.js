function DomView() {
	var that = this;
	var filename, theme;
	var invokeNodeChangedWithPath, invokeNodeChangedWithId, invokeOptionsChanged, invokeLanguageChanged;
	var currentState = {
		node: null,
		scrollPosition: 0,
		referencePosition: null,
		message: {
			spinning: false,
			message: "loading"
		},
		focusedVerses: [1, 2, 4],
		annotations: []
	}

	that.init = function init() {
		var pathData = new PathParser().parse(location.href);
		invokeLanguageChanged(pathData.languageCode);
		invokeNodeChangedWithPath(pathData.path);

		$(onDocumentLoad);
	}

	function onDocumentLoad() {
		addPanelHandler('languages');
		addPanelHandler('options');
	}

	function addPanelHandler(name) {
		var className = 'toolbar-panel-open';
		var panel = $('.panel-' + name);
		var button = $('.button-' + name);
		button.click(function () {
			closePanels('.panel-' + name);
			panel.toggleClass(className);
			button.toggleClass('button-pressed', panel.hasClass(className));
		});
	}

	function closePanels(exception) {
		$('.toolbar-panel-open:not(' + exception + ')').removeClass('toolbar-panel-open');
		$('.toolbar-panel-button').removeClass('button-pressed');
	}

	function makeClassToggle(element, className, setValue) {
		element = $(element);
		return function () {
			element.toggleClass(className, setValue);
		};
	}

	that.getState = function getState() {
		return state;
	}

	that.setState = function setState(state) {
		state.node = state.node || null;
		state.scrollPosition = state.scrollPosition || 0;
		state.message = state.message || null;
		state.focusedVerses = state.focusedVerses || [];
		state.annotations = state.annotations || [];

		setNode(state.node);

		currentState = state;
	}

	that.setOptions = function setOptions(o) {
		//TODO: Set view on options
	}

	that.setLanguage = function setLanguage(language) {
		$('.panel-languages .button.selected').removeClass('selected');
		if (language) {
			$('.panel-languages .button[data-code=' + language.code_three + ']').addClass('selected');
		}
	}

	that.setLanguages = function setLanguages(languages, displayEnglishNames) {
		var panel = $('.panel-languages');

		panel.empty();

		languages.forEach(function (language) {
			var displayName = language.name;
			if (displayEnglishNames && language.name != language.eng_name && language.name.indexOf('(') == -1) {
				displayName += ' (' + language.eng_name + ')'
			}

			panel.append('<a class="button" data-code="' + language.code_three + '">' + displayName + '</a>')
		});

		panel.find('.button').click(onLanguageClick);
	}

	function onLanguageClick(e) {
		var code = $(e.target).data('code');
		invokeLanguageChanged(code);
		closePanels();
	}

	that.setTheme = function setTheme(theme) {
		if (theme.css) {
			document.getElementById('custom-css').innerHTML = theme.css;
		}
	}

	function scrollToVerse(number) {}

	function setNodeLink(element, node) {
		if (node) {
			$(element).data('id', node.id).removeClass('disabled');
		} else {
			$(element).data('id', '').addClass('disabled');
		}
	}

	that.setNode = function setNode(node) {
		$('.content-children').empty();

		if (node) {
			setNodeLink('.button-previous', node.previous);
			setNodeLink('.button-next', node.next);
			setNodeLink('.button-up', node.parent);
			$('.content-body').html(node.details || node.details.content);
		} else {
			setNodeLink('.button-previous, .button-next, .button-up', null);
			$('.content-body').html('');
		}
	}

	function setScroll(position) {

	}

	that.subscribeNodeChangeWithPath = function subscribeNodeChangeWithPath(callback) {
		invokeNodeChangedWithPath = callback;
	}

	that.subscribeNodeChangeWithId = function subscribeNodeChangeWithId(callback) {
		invokeNodeChangedWithId = callback;
	}

	that.subscribeOptionsChange = function subscribeOptionsChange(callback) {
		invokeOptionsChanged = callback;
	}

	that.subscribeLanguageChange = function subscribeLanguageChange(callback) {
		invokeLanguageChanged = callback;
	}
}
