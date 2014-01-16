// This file contains functions to access all settings for the program
// It also provides a document_onload function for the options page to
// set the GUI to what the settings are.
//
// Will probably be completly redone for release.

//
// GUI
//
function document_onload() {
    //Mode
    var mode = GetMode();
    if (mode == Mode.Old)
        document.getElementById("oldmode").checked = true;
    if (mode == Mode.New)
        document.getElementById("newmode").checked = true;
    //Styles
    document.getElementById("basicstyle").checked = GetStyleMode('Simple');
    document.getElementById("premadestyle").checked = GetStyleMode('CSSFile');
    document.getElementById("customcss").checked = GetStyleMode('CustomCSS');
	
    document.getElementById("textcolor").color.fromString(GetTextColor());
    document.getElementById("linkcolor").color.fromString(GetLinkColor());
    document.getElementById("textsize").value = GetTextSize();
    document.getElementById("titlesize").value = GetTitleSize();
    document.getElementById("subtitlesize").value = GetSubtitleSize();
    document.getElementById("backgroundcolor").color.fromString(GetBackgroundColor());
    document.getElementById("backgroundimage").value = GetBackgroundImage();
    document.getElementById("csstext").value = GetCustomCSS();
    document.getElementById("premadestylechoice").selectedIndex = GetCSSFileIndex();
    document.getElementById("toolbartextcolor").color.fromString(GetToolbarTextColor());
    document.getElementById("toolbarlinkcolor").color.fromString(GetToolbarLinkColor());
    document.getElementById("toolbarbackgroundcolor").color.fromString(GetToolbarBackgroundColor());
    document.getElementById("shortcuts").checked = GetShortcuts();
    StyleModeSet();
}

//
// Mode
//
function GetMode() {
    var r = localStorage.getItem("mode");
    if (r == undefined || r == null)
        return 2;
    else
        return parseInt(r);
}
function SetMode(mode) {
    localStorage.setItem("mode", mode);
}
Mode = {
    "None": 0,
    "Old": 1,
    "New": 2
};

//
// Style
//
function StyleChanged() {
    chrome.extension.sendRequest('style');
}
function GetOldNotified() {
    return localStorage.getItem('oldnotified') == 'true';
}

function GetStyleTag(mode) {
    if (mode == 'CSSFile') {
        var el = document.createElement('link');
        el.type = 'text/css';
        el.rel = 'stylesheet';
        el.href = GetCSSFile();
        return el;
    }
    else if (mode == 'CustomCSS') {
        var styleElement = document.createElement("style");
        var cssCode = GetCustomCSS();
        styleElement.type = "text/css";
        if (styleElement.styleSheet)
            styleElement.styleSheet.cssText = cssCode;
        else
            styleElement.appendChild(document.createTextNode(cssCode));
        return styleElement;
    }
    else {
        var styleElement = document.createElement("style");
        var cssCode = 'body {\n\
						color:#' + GetTextColor() + ';\n\
						font-size:' + GetTextSize() + 'pt;\n';
        var bgimage = GetBackgroundImage();
        if (bgimage != null && bgimage != '')
            cssCode = cssCode + 'background-image:url(\'' + GetBackgroundImage() + '\');\n';
        else
            cssCode = cssCode + 'background-color:#' + GetBackgroundColor() + ';\n';
        cssCode = cssCode + '	 }\n\
					h1 {\n\
						font-size:' + GetTitleSize() + 'pt;\n\
					}\n\
					h2 {\n\
						font-size:' + GetSubtitleSize() + 'pt;\n\
					}\n\
					a:link {\n\
						color:' + GetLinkColor() + ';\n\
					}\n\
					a:visited {\n\
						color:' + GetLinkColor() + ';\n\
					}\n\
					#controlbar {\n\
						color: ' + GetToolbarTextColor() + ';\n\
						position: fixed;\n\
						top: 0px;\n\
						left: 0px;\n\
						right: 0px;\n\
						background: ' + GetToolbarBackgroundColor() + ';\n\
						border-bottom: 1.5px solid black;\n\
						opacity: 0;\n\
						-webkit-transition: opacity 0.2s linear;\n\
					}\n\
					.navlink:link { color:' + GetToolbarLinkColor() + '; }\n\
					.navlink:visited { color:' + GetToolbarLinkColor() + '; }';
        styleElement.type = "text/css";
        if (styleElement.styleSheet)
            styleElement.styleSheet.cssText = cssCode;
        else
            styleElement.appendChild(document.createTextNode(cssCode));
        return styleElement;
    }
}

function StyleModeSet() {
    enabled('font', false);
    enabled('textcolor', GetStyleMode('Simple'));
    enabled('titlesize', GetStyleMode('Simple'));
    enabled('subtitlesize', GetStyleMode('Simple'));
    enabled('textsize', GetStyleMode('Simple'));
    enabled('premadestylechoice', GetStyleMode('CSSFile'));
    enabled('backgroundcolor', GetStyleMode('Simple'));
    enabled('backgroundimage', GetStyleMode('Simple'));
    enabled('csstext', GetStyleMode('CustomCSS'));
    StyleChanged();
}
function GetStyleMode(mode) {
    var r = localStorage.getItem("style.mode." + mode);
    if (r == undefined || r == null)
        return false;
    else
        return r == 'true' ||  r == 'True' || r == 'Yes' || r == 'yes';
}
function SetStyleMode(mode, on) {
    localStorage.setItem("style.mode." + mode, on);
    StyleModeSet();
}

function GetTextColor() {
    var r = localStorage.getItem("style.textcolor");
    if (r == undefined || r == null)
        return "000000";
    else
        return r;
}
function SetTextColor(color) {
    localStorage.setItem("style.textcolor", color);
    StyleChanged();
}

function GetLinkColor() {
    var r = localStorage.getItem("style.linkcolor");
    if (r == undefined || r == null)
        return "0000FF";
    else
        return r;
}
function SetLinkColor(color) {
    localStorage.setItem("style.linkcolor", color);
    StyleChanged();
}

function GetBackgroundColor() {
    var r = localStorage.getItem("style.backgroundcolor");
    if (r == undefined || r == null)
        return "FFFFFF";
    else
        return r;
}
function SetBackgroundColor(color) {
    localStorage.setItem("style.backgroundcolor", color);
    StyleChanged();
}

function GetToolbarTextColor() {
    var r = localStorage.getItem("style.toolbar.textcolor");
    if (r == undefined || r == null)
        return "000000";
    else
    return r;
    }
    function SetToolbarTextColor(color) {
    localStorage.setItem("style.toolbar.textcolor", color); StyleChanged();
    }

    function GetToolbarLinkColor() {
    var r = localStorage.getItem("style.toolbar.linkcolor");
    if (r == undefined || r == null)
    return "0000FF";
    else
    return r;
    }
    function SetToolbarLinkColor(color) {
    localStorage.setItem("style.toolbar.linkcolor", color); StyleChanged();
    }

    function GetToolbarBackgroundColor() {
    var r = localStorage.getItem("style.toolbar.backgroundcolor");
    if (r == undefined || r == null)
    return "lightgray";
    else
    return r;
    }
    function SetToolbarBackgroundColor(color) {
    localStorage.setItem("style.toolbar.backgroundcolor", color); StyleChanged();
    }

    function GetTitleSize() {
    var r = localStorage.getItem("style.titlesize");
    if (r == undefined || r == null)
    return 24;
    else
    return parseInt(r);
    }
    function SetTitleSize(size) {
    localStorage.setItem("style.titlesize", size); StyleChanged();
    }

    function GetSubtitleSize() {
    var r = localStorage.getItem("style.subtitlesize");
    if (r == undefined || r == null)
    return 18;
    else
    return parseInt(r);
    }
    function SetSubtitleSize(size) {
    localStorage.setItem("style.subtitlesize", size); StyleChanged();
    }

    function GetTextSize() {
    var r = localStorage.getItem("style.textsize");
    if (r == undefined || r == null)
    return 12;
    else
    return parseInt(r);
    }
    function SetTextSize(size) {
    localStorage.setItem("style.textsize", size); StyleChanged();
    }

    function GetBackgroundImage() {
    var r = localStorage.getItem("style.backgroundimage");
    if (r == undefined || r == null)
    return "";
    else
    return r;
    }
    function SetBackgroundImage(url)  {
    localStorage.setItem("style.backgroundimage", url); StyleChanged();
    }

    function GetCustomCSS() {
    var r = localStorage.getItem("style.customcss");
    if (r == undefined || r == null)
    return "";
    else
    return r;
    }
    function SetCustomCSS(css) {
    localStorage.setItem("style.customcss", css); StyleChanged();
    }

    function GetCSSFile() {
    var r = localStorage.getItem("style.cssfile");
    if (r == undefined || r == null)
    return "/styles/default.css";
    else
    return r;
    }
    function SetCSSFile(file) {
    localStorage.setItem("style.cssfile", file); StyleChanged();
    }
    function GetCSSFileIndex() {
    var r = localStorage.getItem("style.cssfileindex");
    if (r == undefined || r == null)
    return 0;
    else
    return parseInt(r);
    }
    function SetCSSFileIndex(index) {
    localStorage.setItem("style.cssfileindex", index); StyleChanged();
    }

    function GetShortcuts() {
    var r = localStorage.getItem("shortcuts.enabled");
    if (r == undefined || r == null)
    return true;
    else
    return r == 'true';
    }
    function SetShortcuts(enabled) {
    localStorage.setItem("shortcuts.enabled", enabled);
    }

    function GetAutobookmark() {
    var r = localStorage.getItem("bookmarks.automatic");
    if (r == undefined || r == null)
    return false;
    else
    return r == 'true';
    }
    function SetAutobookmark(enabled) {
    localStorage.setItem("bookmarks.automatic", enabled);
    }

    function enabled(id, e) {
    if (!e)
    document.getElementById(id).disabled = true;
    else
    document.getElementById(id).disabled = false;
    }

    //
    //Synced
    //
    function Backup()
    {
		
    }

    function Restore()
    {
	
    }
