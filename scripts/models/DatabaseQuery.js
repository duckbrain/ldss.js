function DatabaseQuery(messageProvider) {
	var that = this;
	var request = messageProvider.send;
	var failed = {};
	var subscriptions = {};

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

	function subscription(title)
	{
		var handlers = [];
		subscriptions[title] = handlers;
		var result = function(callback) {
			handlers.push(callback);
		}
		result.title = title;
		messageProvider.on(title + '-event', function(params) {
			for (var i = 0; i < handlers.length; i++) {
				handlers[i](params);
			}
		});
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

		steps = steps || [];
		base = findSteps(that, steps);

		if (subscriptions[action]) {
			request(action + '-event', params);
			return;
		}

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

	function nothing() {
		return Promise.resolve(that);
	}

	var that = {
		open: nothing,
		language: {
			get: action('language-get', ['id']),
			getAll: action('language-get-all', ['id']),
			getByCode: action('language-get-by-code', ['code']),
			getByLdsCode: action('language-get-by-lds-code', ['code']),
			download: action('language-download', [])
		},
		node: {
			get: action('node-get-id', ['id']),
			getPath: action('node-get', ['languageId', 'path']),
			exists: action('node-exists', ['languageId', 'path']),
			open: action('open', ['languageId', 'path'])
		},
		options: {
			get: action('setting-get', ['name']),
			getAll: action('setting-get-all', []),
			getDefaults: action('setting-get-defaults', []),
			set: action('setting-set', ['name', 'value']),
			update: action('setting-update', ['values'])
		},
		download: {
			getQueue: action('download-queue'),
			downloadCatalog: action('download-catalog', ['languageId']),
			downloadBook: action('download-book', ['bookId']),
			downloadFolder: action('download-folder', ['folderId']),
			subscribeQueueChanged: subscription('download-subscribe-queue-changed'),
			subscribeStatusChanged: subscription('download-subscribe-status-changed')
		},
		theme: {
			get: action('theme-get', ['id'])
		},
		execute: execute,
		isFailed: isFailed
	}

	return that;
}
