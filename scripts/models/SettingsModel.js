/**
 * Provides a way to access settings and provides a wrapper on various ways to
 * received updates on when those settings are updated.
 *
 * @param server
 *            An instance of the db.js server that the settings are to be stored
 *            in.
 * @param messageProvider
 *            An instance of an object that has two functions, listen(callback),
 *            and send(title, message). Listen should add a function to a list
 *            of callbacks that are fired when send is called. Send should
 *            simple pass its two parameters to each callback. This provider may
 *            be implemented to send the messages between the browser and the
 *            server or between open tabs. If not provided, a default one that
 *            passes the values straight through will be generated.
 */
function SettingsModel(database, messageProvider) {
	var that = this;
	that.database = database;

	that.callbacks = {};

	that.messagePrefix = "duck.jonathan.lds-scriptures.settings-";

	//
	// Simple default messageProvider that forwards off a single message back.
	//
	that.messageProvider = messageProvider || {
		listen: function listen(callback) {
			that.messageProvider.send = callback;
		},
		send: null
	};

	that.messageProvider.listen(function(title, message) {
		for (var name in that.callbacks) {
			if (that.messagePrefix + name == title) {
				// Setting found loop through the callbacks.
				var callbacks = that.callbacks[name];
				for (var i = 0; i < callbacks.length; i++) {
					callbacks[i](message.newValue, message.oldValue);
				}
			}
		}
	});
}

SettingsModel.prototype = {

	/**
	 * Gets an object that contains all of the default settings. These settings
	 * will be automatically accessed if the settings don't contain a value.
	 *
	 * @returns Promise
	 */
	getDefaults: function getDefaults() {
		return Promise.resolve({
			selectedLanguage: 1,
		});
	},

	/**
	 * Gets an object that contains all of the settings.
	 *
	 * @returns Promise
	 */
	getAll: function getAll() {
		var that = this;
		return that.getDefaults().then(
			function(defaults) {
				return that.database.server.settings.query('id').only(0).execute().then(
					function onSuccess(settings) {
						settings = settings[0];
						// Find default settings, that are not yet
						// defined
						for (var name in settings) {
							defaults[name] = settings[name];
						}
						delete defaults['id'];
						return defaults;
					},
					function onError(ex) {
						return that.database.server.settings.update({
							id: 0
						}).then(that.getDefaults);
					});
			});
	},

	/**
	 * Updates any number of settings from the named values passed.
	 *
	 * @param values
	 *            An object of named values to update
	 * @returns Promise
	 */
	update: function update(values) {

		var that = this;

		return that.getAll().then(function(settings) {

			// Trigger all of the changed values

			for (var name in values) {
				if (typeof values[name] != 'function') {
					that.trigger(name, values[name], settings[name]);
				}
			}

			return that.database.server.settings.query().all().modify(values).execute();

		});
	},

	/**
	 * Gets a single value
	 *
	 * @param name
	 *            The name of the value
	 * @returns Promise
	 */
	get: function get(name) {
		return this.getAll().then(function(settings) {
			return settings[name];
		});
	},

	/**
	 * Updates a single value
	 *
	 * @param name
	 *            The name of the value
	 * @param value
	 *            The new value
	 * @returns Promise
	 */
	set: function set(name, value) {
		var values = {};
		values[name] = value;
		return this.update(values);
	},

	/**
	 * Subscribes to changes made to an named setting
	 *
	 * @param name
	 *            The name of the setting
	 * @param callback
	 *            A function (newValue, oldValue) that will be called when the
	 *            value is updated
	 */
	subscribe: function subscribe(name, callback) {
		if (!this.callbacks[name]) {
			this.callbacks[name] = [];
		}
		this.callbacks[name].push(callback);
	},

	/**
	 * Unsubscribes any functions that match. (Only those subscribed on this
	 * tab.)
	 *
	 * @param callback
	 *            Callback function to unregister
	 */
	unsubscribe: function unsubscribe(callback) {
		for (var name in this.callbacks) {
			var callbacks = this.callbacks[name];
			for (var i = 0; i < callbacks.length; i++) {
				if (callbacks[i] == callback) {
					delete callbacks[i];
				}
			}
		}
	},

	/**
	 * Unsubscribes all callbacks for the setting with the given name
	 *
	 * @param name
	 *            Name of the setting
	 */
	unsubscribeAll: function unsubscribeAll(name) {
		delete this.callbacks[name];
	},

	/**
	 * Triggers the message to the messageProvider that should be handled as
	 * subscribed on construction. This function is automatically triggered
	 * whenever an setting value is updated.
	 *
	 * @param name
	 *            Name of the setting
	 * @param newValue
	 *            The new value of the setting. It is not verified, and the
	 *            event will use it.
	 * @param oldValue
	 *            The old value of the setting.
	 */
	trigger: function trigger(name, newValue, oldValue) {
		this.messageProvider.send(this.messagePrefix + name, {
			newValue: newValue,
			oldValue: oldValue
		});
	}
};
