/**
 * Provides a way to access settings and provides a wrapper on various ways to
 * received updates on when those settings are updated.
 *
 * @param server
 *            An instance of the db.js server where the settings will be stored.
 */
function SettingsModel(database) {
	var that = this;
	var callbacks = {};
	var defaults = {
		language: 1,
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
			hideAnnotations: false, //Anotations are not yet implemented
		},
	};

	function getDefaults() {
		return Promise.resolve(defaults);
	}

	function getAll() {
		return getDefaults().then(function(defaults) {
			return getRaw().then(function(settings) {
				// Find default settings, that are not yet defined
				for (var name in settings) {
					defaults[name] = settings[name];
				}
				delete defaults['id'];
				return defaults;
			});
		});
	}

	function update(values) {
		return getAll().then(function(settings) {
			settings = settings || {};

			for (var name in values) {
				settings[name] = values[name];
			}

			return setRaw(settings);
		});
	}

	function get(name) {
		return getAll().then(function(settings) {
			return settings[name];
		});
	}

	function set(name, value) {
		var values = {};
		values[name] = value;
		return update(values);
	}

	function getRaw() {
		return database.server.settings.get(0);
	}

	function setRaw(values) {
		values.id = 0;
		return database.server.settings.update(values);
	}

	function revert(name) {
		return getRaw().then(function(values) {
			delete values[name];
			return values;
		}).then(setRaw);
	}

	that.get = get;
	that.set = set;
	that.update = update;
	that.revert = revert;
	that.getAll = getAll;
	that.getDefaults = getDefaults;
	that.getRaw = getRaw;
}

if (typeof module != 'undefined') {
	module.exports = SettingsModel;
}
