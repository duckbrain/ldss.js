function DatabaseQuery() {
    
    var messageProvider = new ChromeMessageProvider();
    var request = messageProvider.send;

    function action(title, params) {
        return function() {
            var data = {};
            for (var i = 0; i < params.length; i++) {
                data[params[i]] = arguments[i];
            }
            return request(title, data);
        }
    }

    var id = [ 'id' ];
    var langId = [ 'languageId', 'id' ];
    var nodeId = [ 'languageId', 'bookId', 'id' ];

    return {
        book: {
            get: action('book-get', langId),
            getChildren: action('book-get-children', langId),
            download: action('book-download', langId)
        },
        catalog: {
            get: action('catalog-get', id),
            getChildren: action('catalog-get-children', id),
            download: action('catalog-download', id),
            exists: action('catalog-exists', id)
        },
        folder: {
            get: action('folder-get', langId),
            getChildren: action('folder-get-children', langId)
        },
        language: {
            get: action('language-get', id),
            getAll: action('language-get-all', id),
            getByCode: action('language-get-by-code', [ 'code' ]),
            download: action('language-download', [ ])
        },
        node: {
            get: action('node-get', nodeId),
            getChildren: action('node-get-children', nodeId),
        },
        path: {
            get: action('path-get', [ 'languageId', 'path' ]),
            getChildren: action('path-get-children', [ 'languageId', 'path' ]),
            exists: action('path-exists', [ 'languageId', 'path' ]),
            open: action('open', ['languageId', 'path'])
        },
        setting: {
            get: action('setting-get', [ 'name' ]),
            getAll: action('setting-get-all', [ ]),
            getDefaults: action('setting-get-defaults', [ ]),
            set: action('setting-set', [ 'name', 'value' ]),
            update: action('setting-update', [ 'values' ])
        }
    }
}