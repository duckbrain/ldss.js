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

	var id = ['id'];
	var langId = ['languageId', 'id'];
	var nodeId = ['languageId', 'bookId', 'id'];

	return {
		language: {
			get: action('language-get', id),
			getAll: action('language-get-all', id),
			getByCode: action('language-get-by-code', ['code']),
			download: action('language-download', [])
		},
		path: {
			get: action('path-get-id', id),
			getPath: action('path-get', ['languageId', 'path']),
			getChildren: action('path-get-children', ['languageId', 'path']),
			exists: action('path-exists', ['languageId', 'path']),
			open: action('open', ['languageId', 'path'])
		},
		setting: {
			get: action('setting-get', ['name']),
			getAll: action('setting-get-all', []),
			getDefaults: action('setting-get-defaults', []),
			set: action('setting-set', ['name', 'value']),
			update: action('setting-update', ['values'])
		},
		theme: {
			get: action('theme-get', id)
		}
	}
}
