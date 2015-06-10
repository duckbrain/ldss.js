function DomView() {
	var that = this;
	var settings;
	var elements;
	var filename;
	var state = {
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

	function init() {
		filename = location.pathname;
	}

	function getState() {
		return state;
	}

	function setState(state) {
	}

	function getSettings() {
		return settings;
	}

	function setSettings(settings) {}

	function subscribeNodeChange(callback) {}

	function subscribeSettingsChange(callback) {}

	function subscribeLanguageChange(callback) {}

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
	}

	function setScroll(position) {

	}
}
