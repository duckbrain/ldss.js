if (typeof require == 'function') {
    require('./Downloader.js');
}

function LDSContentProvider() {
    var downloader = new Downloader();
    this.download = downloader.download;
}

LDSContentProvider.prototype = {
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
    }
}

if (typeof module != 'undefined') {
    module.exports = LDSContentProvider;
}