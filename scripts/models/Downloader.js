function Downloader() {

    // If Node.js, include jQuery with AJAX support
    if (typeof require == 'function') {
        var $ = require('jquery');
        var XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;

        $.support.cors = true;
        $.ajaxSettings.xhr = function() {
            return new XMLHttpRequest();
        };
    }

    this.download = $.ajax;
}

if (typeof module != 'undefined') {
    module.exports = Downloader;
}