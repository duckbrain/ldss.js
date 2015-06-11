function DomView() {
	var that = this;
	var filename, theme, options, languages;
	var invokeNodeChangedWithPath, invokeNodeChangedWithId, invokeOptionsChanged, invokeLanguageChanged;
	var currentState = {
		node: null,
		scrollPosition: 0,
		referencePosition: null,
		message: {
			spinning: false,
			message: "loading"
		},
		language: {
			name: "eng",
			id: 1
		},
		focusedVerses: [1, 2, 4],
		annotations: [ ]
	}

	that.init = function init() {
		//TODO: invokeNodeChangedWithPath, with data parsed off the URL.

		var pathData = parseUri(location.href);
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
		var panel = $('.toolbar-panel-' + name);
		var button = $('.toolbar-button-' + name);
		button.click(function() {
			$('.' + className + ':not(.toolbar-panel-' + name + ')').removeClass(className);
			$('.toolbar-panel-button').removeClass('toolbar-button-pressed');
			panel.toggleClass(className);
			button.toggleClass('toolbar-button-pressed', panel.hasClass(className));
		});
	}

	function makeClassToggle(element, className, setValue) {
		element = $(element);
		return function() {
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
		state.language = state.language || currentState.language;
		state.focusedVerses = state.focusedVerses || [];
		state.annotations = state.annotations || [];

		setNode(state.node);

		currentState = state;
	}

	that.getOptions = function getOptions() {
		return options;
	}

	that.setOptions = function setOptions(o) {
		options = o;
		renderTheme();
	}

	that.getLanguages = function getLanguages() {

	}

	that.setLanguages = function setLanguages(l) {
		languages = l;
		//$('.toolbar-panel-languages').clear();
		//<li class="language-item"><a href="#eng">English</a></li>

		languages.forEach(function(language) {

		});
	}

	that.getTheme = function getTheme() {
		return theme;
	}

	that.setTheme = function setTheme(t) {
		theme = t;
		renderTheme();
	}

	function renderTheme() {
		if (theme && options) {
			less.render(theme.style, {
				globalVars: options.themeOptions
			}).then(function (output) {
				document.getElementById('custom-css').innerHTML = output.css;
			});
		}
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

	function scrollToVerse(number) {}

	function getHref(node) {
		if (node) {
			return filename + '?q=' + node.path
		} else {
			return '';
		}
	}

	function setNode(node) {
		$.attr('.toolbar-button-previous', 'href', getHref(node && node.previous.path));
		$.attr('.toolbar-button-next', 'href', getHref(node && node.next.path));
		$.attr('.toolbar-button-up', 'href', getHref(node && node.parent.path));
	}

	function setScroll(position) {

	}

	function parseUri(path) {
		var components = path.split('?');
		var data = {};

		if (components.length > 2) {
			filename = components.shift();
		}
		if (components.length > 1) {
			//Parse query
			components.pop().split('&').forEach(function(param) {
				var index = param.indexOf('=');
				var name = param.substring(0, index);
				var value = param.substring(index + 1);
				if (name == 'lang') {
					data.languageCode = value;
				} else if (name == 'bookmark') {
					data.bookmarkId = value;
				}
			});
		}
		// The rest is the path
		data.path = components.join('?');

		// TODO: Parse out dot (.) seperated verses from the path.

		return data;
	}
}
