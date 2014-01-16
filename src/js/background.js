function backgroundInit() {
	addScript("../js/omnibox.js");
	addScript("../js/pagemaker.js");
	addScript("../js/bookmarks.js");
	addScript("../js/htmlbuilder.js");
	addScript("../js/i18n.js");
	addScript("../js/scriptureInfo.js");
}

function addScript(name) {
	document.write('<script type="text/javascript" scr="' + name + '"></script>');
}

backgroundInit();
