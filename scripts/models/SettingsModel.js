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

  /**
   * Gets an object that contains all of the default settings. These settings
   * will be automatically accessed if the settings don't contain a value.
   *
   * @returns Promise
   */
  that.getDefaults = function getDefaults() {
    return Promise.resolve(defaults);
  }

  /**
   * Gets an object that contains all of the settings.
   *
   * @returns Promise
   */
  that.getAll = function getAll() {
    return that.getDefaults().then(
      function(defaults) {
        return database.server.settings.get(0)
          .then(function onSuccess(settings) {
            // Find default settings, that are not yet
            // defined
            for (var name in settings) {
              defaults[name] = settings[name];
            }
            delete defaults['id'];
            return defaults;
          }, function onError(ex) {
            return database.server.settings.update({
              id: 0
            }).then(that.getDefaults);
          });
      });
  }

  /**
   * Updates any number of settings from the named values passed.
   *
   * @param values
   *            An object of named values to update
   * @returns Promise
   */
  that.update = function update(values) {
    return that.getAll().then(
      function(settings) {
        if (!settings) {
          settings = {};
        }

        for (var name in values) {
          settings[name] = values[name];
        }

        settings.id = 0;

        return database.server.settings.update(settings);

      });
  }

  /**
   * Gets a single value
   *
   * @param name
   *            The name of the value
   * @returns Promise
   */
  that.get = function get(name) {
    return that.getAll().then(function(settings) {
      return settings[name];
    });
  }

  /**
   * Updates a single value
   *
   * @param name
   *            The name of the value
   * @param value
   *            The new value
   * @returns Promise
   */
  that.set = function set(name, value) {
    var values = {};
    values[name] = value;
    return that.update(values);
  }
}

if (typeof module != 'undefined') {
  module.exports = SettingsModel;
}
