/**
 * @name DatabaseModel
 * @class
 *
 * @param {LDSContentProvider} contentProvider
 */
function DatabaseModel(contentProvider) {
	var that = this;

	that.server = null;
	that.connection = {
		server: 'duck.jonathan.lds-scriptures',
		version: 16,
		schema: {
			languages: {
				key: {
					keyPath: 'id'
				},
				indexes: {
					code: {
						unique: true
					},
					code_three: {}
				}
			},
			settings: {
				key: {
					keyPath: 'id'
				},
				indexes: {
					id: {}
				}
			},
			themes: {
				key: {
					keyPath: 'id',
					autoIncrement: true
				},
			},
			/**
			 * Represents the root catalog for any given language
			 */
			nodes: {
				key: {
					keyPath: 'id',
					autoIncrement: true
				},
				indexes: {
					languageId: {},
					path: {
						key: ['languageId', 'path'],
						unique: false
					}
				}
			}
		}
	}

	that.contentProvider = contentProvider;
	that.helpers = DatabaseModel.helpers;

	function tryLoadModel(name, className) {
		// TODO: Use require if in Node.js

		// class name is passed, or made by appending "Model" to the name
		var $class = window[className || name + "Model"];
		// property name is the name with the first letter lower-case.
		var propertyName = name.charAt(0).toLowerCase() + name.slice(1);
		if ($class) {
			that[propertyName] = new $class(that);
		}
	}

	tryLoadModel('Settings');
	tryLoadModel('Language');
	tryLoadModel('Node');
	tryLoadModel('Theme');
	tryLoadModel('Download');
	tryLoadModel('Keyboard');
	tryLoadModel('Downloader', 'BrowserDownloader');
	tryLoadModel('ContentProvider', 'LDSContentProvider');

	that.open = function open() {
		return db.open(that.connection).then(function (server) {
			that.server = server;

			// Calls the initialize function on all models that have it.
			return Promise.all(Object.getOwnPropertyNames(that).filter(function (model) {
				return that[model] && 'initialize' in that[model];
			}).map(function (model) {
				return that[model].initialize();
			})).then(function () {
				return server;
			});
		});
	};

	that.close = function close() {
		return that.server.close().then(function () {
			that.server = null;
			return true;
		});
	};
}

DatabaseModel.helpers = {
	existsSingle: function existsSingle(promiseAttempt) {
		// TODO: Return a promise that returns true or false
	},
	single: function single(list) {
		// It is possible to have duplicates because installing is
		// not one IndexDBTransaction. When the installers are
		// rewritten, then this check can be re-enabled.
		//if (list.length > 1) {
		//	throw "single had more than one.";
		//}
		return list[0];
	},
	dataToIdArray: function dataToIdArray(array) {
		var newArray = [];
		for (var i = 0; i < array.length; i++) {
			newArray.push(array[i].id);
		}
		return newArray;
	}
}

function log(message) {
	console.log(message);
	return message;
}
DatabaseModel.log = log;


if (typeof module != 'undefined') {
	module.exports = DatabaseModel;
}