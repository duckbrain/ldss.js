function Downloader() {

    // If Node.js, include jQuery with AJAX support
    if (typeof require == 'function') {
        var jQuery = require('jquery');
        var XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;

        jQuery.support.cors = true;
        jQuery.ajaxSettings.xhr = function() {
            return new XMLHttpRequest();
        };
    }

    this.download = function(params) {
        return jQuery.ajax(params);
    }
}

if (typeof module != 'undefined') {
    module.exports = Downloader;
}