function LDSContentProvider() {

}

LDSContentProvider.prototype = {
    getAction: function(action, data) {
        data = data || {};
        data.action = action;
        data.format = 'json';

        return $.ajax({
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