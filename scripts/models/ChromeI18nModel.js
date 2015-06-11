function ChromeI18nModel() {
	this.getMessage = function getI18nMessage(name, params) {
		if (typeof name != 'string') {
			return name;
		}
		return chrome.i18n.getMessage(name, params) || name;
	}
}
