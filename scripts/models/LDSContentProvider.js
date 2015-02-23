if (typeof require == 'function') {
    var Downloader = require('./Downloader.js');
    var pako = require('./../dependencies/pako.js');
    var SQL = require('./../dependencies/sql.js');
}

function LDSContentProvider(downloader) {
    this.downloader = downloader;
}

LDSContentProvider.prototype = {
    download: function download(params) {
        return this.downloader.download(params);
    },
    
    getAction: function(action, data) {
        data = data || {};
        data.action = action;
        data.format = 'json';

        return this.download({
            url: 'http://tech.lds.org/glweb',
            data: data
        });
    },

    getLanguages: function() {
        return this.getAction('languages.query');
    },
    getCatalog: function(languageId) {
        return this.getAction('catalog.query', {
            languageid: languageId,
            platformid: 1
        });
    },
    
    getBook: function getBook(url) {
        return this.downloader.downloadBinary(url).then(pako.inflate).then(function(sqlite3blob) {
            return new SQL.Database(sqlite3blob);
        });
    }
};

if (typeof module != 'undefined') {
    module.exports = LDSContentProvider;
}