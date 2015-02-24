function BrowserDownloader() {
}

BrowserDownloader.prototype = {
    download: function download(params) {
        // TODO: Replace with source on MDN and remove jQuery dependency 
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise
        return $.ajax(params);
    },

    downloadBinary: function(url) {
        return new Promise(function(fulfill, reject) {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', url);
            xhr.responseType = 'arraybuffer';

            xhr.onload = function(e) {
                var data = new Uint8Array(this.response);
                fulfill(data);
            }
            xhr.onerror = function(e) {
                console.log("Error", e);
                reject(e);
            };
            xhr.send();
        });
    }
}

if (typeof module != 'undefined') {
    module.exports = BrowserDownloader;
}