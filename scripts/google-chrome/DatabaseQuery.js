function DatabaseQuery(messageProvider) {
	var that = this;
	var request = messageProvider.send;
	var failed = {};

	function action(title, params) {
		var result = function () {
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

	function findSteps(base, steps) {
		for (var i = 0; i < steps.length; i++) {
			base = base[steps[i]];
		}
		return base;
	}


	function isFailed(result) {
		return result == failed;
	}

	function execute(database, action, params, steps) {
		var name, base, item, dbBase, result, args;

		steps = steps ? steps : [];
		base = findSteps(that, steps);

		// loop through all actions and find the match, then execute the function on the passed database object.
		for (name in base) {
			item = base[name];
			if (typeof item == 'function' && item.title == action) {
				dbBase = findSteps(database, steps);
				args = item.params.map(function (param) {
					return params[param];
				})
				return dbBase[name].apply(dbBase, args);
			} else if (typeof item == 'object') {
				steps.push(name);
				result = execute(database, action, params, steps)
				steps.pop();
				if (!isFailed(result)) {
					return result;
				}
			}
		}
		return failed;
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
			getByLdsCode: action('language-get-by-lds-code', ['code']),
			download: action('language-download', [])
		},
		node: {
			get: action('node-get-id', id),
			getPath: action('node-get', nodePath),
			exists: action('node-exists', nodePath),
			open: action('open', nodePath)
		},
		settings: {
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
		},
		execute: execute,
		isFailed: isFailed
	}

	return that;
}
