function ThemeModel(database) {
  var that = this;
  var builtIn = {
    'default': {
      template: 'themes/default/template.ejs',
      stylesheet: 'themes/default/style.less',
      script: null, //optional
    }
    //TODO: Midnight
    //TODO: Sepia
    //TODO: Gold plates
    //TODO: Bootstrap
  };

  function reset() {
    return database.server.themes.clear();
  }

  function add(theme) {
    theme.builtIn = false;
    return database.server.themes.add(theme);
  }

  function destoy(themeId) {
    return database.server.themes['delete'](themeId);
  }

  function get(themeId) {
    if (Number.isNaN(parseInt(themeId))) {
      return getBuiltIn(themeId);
    } else {
      return database.server.themes.get(themeId)
    }
  }

  function getAll() {
    return Promise.all(
      [database.server.themes.query().all().execute(),
        getAllBuiltIn()
      ]).then(function(e) {
      return e[1].concat(e[0]);
    });
  }

  function update(theme) {
    return database.server.themes.update(theme);
  }

  function getBuiltIn(name) {
    var t = builtIn[name];
    return Promise.all(
      [database.downloader.download(t.stylesheet),
        database.downloader.download(t.template),
        (t.script
          ? database.downloader.download(t.script)
          : Promise.resolve(null))
      ]).then(function(e) {
      return {
        id: name,
        name: name, //TODO: Get i18n name with "name" as base
        style: e[0],
        template: e[1],
        script: e[2]
      };
    })

  }

  function getAllBuiltIn() {
    return Promise.all(Object.getOwnPropertyNames(builtIn).map(getBuiltIn));
  }

  that.add = add;
  that['delete'] = destoy;
  that.get = get;
  that.reset = reset;
  that.getAll = getAll;
}

if (typeof module != 'undefined') {
  module.exports = ThemeModel;
}
