function DatabaseQuery() {
	var that = this;
	var messageProvider = new ChromeMessageProvider();
	var request = messageProvider.send;

	function action(title, params) {
		var result = function() {
			var data = {};
			for (var i = 0; i < params.length; i++) {
				data[params[i]] = arguments[i];
			}
			return request(title, data);
		}
		result.title = title;
		result.params = params;
		return result;
	}

	function execute(database, action, params) {
		//TODO: loop through all actions and find the match, then execute the function on the passed database object.
	}

	var id = ['id'];
	var nodePath = ['languageId', 'path'];

	function nothing() {
		return Promise.resolve(that);
	}

	var that = {
		open: nothing,
		language: {
			get: action('language-get', id),
			getAll: action('language-get-all', id),
			getByCode: action('language-get-by-code', ['code']),
			download: action('language-download', [])
		},
		node: {
			get: action('node-get-id', id),
			getPath: action('node-get', nodePath),
			exists: action('node-exists', nodePath),
			open: action('open', nodePath)
		},
		setting: {
			get: action('setting-get', ['name']),
			getAll: action('setting-get-all', []),
			getDefaults: action('setting-get-defaults', []),
			set: action('setting-set', ['name', 'value']),
			update: action('setting-update', ['values'])
		},
		download: {
			downloadCatalog: action('download-catalog', ['languageId']),
			downloadBook: action('download-book', ['bookId'])
		},
		theme: {
			get: action('theme-get', id)
		}
	}

	return that;
}
