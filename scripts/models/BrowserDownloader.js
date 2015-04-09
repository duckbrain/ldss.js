function BrowserDownloader() {
}

BrowserDownloader.prototype = {
    download: function download(params) {
        if (typeof params == 'string') {
            params = { url : params };
        }

        // Source modified from MDN documentation on promises
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise
        var method = params.method || 'GET'
        var url = params.url
        var args = params.data;

        return new Promise(function(resolve, reject) {

            // Instantiates the XMLHttpRequest
            var client = new XMLHttpRequest();
            var uri = '';
            if (args != undefined) {
                for (key in args) {
                    uri += encodeURIComponent(key) + '=' +
                            encodeURIComponent(escape(args[key])) + '&';
                }
                client.open(method, url + '?' + uri.slice(0, -1), true);
            } else {
                client.open(method, url, true);
            }
            //client.setRequestHeader("Content-type",
            //        "application/x-www-form-urlencoded");
            //client.setRequestHeader("Cache-Control", "no-cache");
            client.onreadystatechange = function() {
                if (this.readyState == 4) {
                    if (this.status == 200) {
                        resolve(this.response);
                    } else {
                        reject({
                            "error": this.statusText
                        });
                    }
                }
            };
            client.send(uri);
        });
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