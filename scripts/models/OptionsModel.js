/**
 * Provides a way to access Options and provides a wrapper on various ways to
 * received updates on when those Options are updated.
 *
 * @param server
 *            An instance of the db.js server where the Options will be stored.
 */
function OptionsModel(database) {
	var that = this;
	var callbacks = {};
	var defaults = {
		language: 1,

		// TODO: Move theme defaults to ThemeModel, so they can be different for each theme. Use these for user theme defaults.
		theme: 'default',
		'themeOptions': {
			background: '#ffffff',
			color: '#000000',
			accent: '#cccccc',
			highlight: '#ffff00',
			margins: '48',
			fontFamily: 'arial',
			fontSize: '12',
			hideFootnotes: false,
			hideAnnotations: false //Anotations are not yet implemented
		},
		keyboard: {
			nextVerse: 74,
			previousVerse: 75,
			nextChapter: 76,
			previousChapter: 72,
			upLevel: 85,
			bookmark: 81,
			search: 191,
			autoscroll: 88
		}
	};

	function getDefaults() {
		return Promise.resolve(defaults);
	}

	function getAll() {
		return getDefaults().then(function (defaults) {
			return getRaw().then(function (options) {
				// Find default options, that are not yet defined
				for (var name in options) {
					defaults[name] = options[name];
				}
				delete defaults['id'];
				return defaults;
			});
		});
	}

	function update(values) {
		return getAll().then(function (options) {
			options = options || {};

			for (var name in values) {
				options[name] = values[name];
			}

			return setRaw(options);
		});
	}

	function get(name) {
		return getAll().then(function (options) {
			return options[name];
		});
	}

	function set(name, value) {
		var values = {};
		values[name] = value;
		return update(values);
	}

	function getRaw() {
		return database.server.options.get(0).then(function (s) {
			return s || {};
		});
	}

	function setRaw(values) {
		values.id = 0;
		return database.server.options.update(values);
	}

	function revert(name) {
		return getRaw().then(function (values) {
			delete values[name];
			return values;
		}).then(setRaw);
	}

	that.get = get;
	that.set = set;
	that.update = update;
	that.revert = revert;
	that.getAll = getAll;
	that.revert = revert;
	that.getDefaults = getDefaults;
	that.getRaw = getRaw;
}

if (typeof module != 'undefined') {
	module.exports = OptionsModel;
}
