function ThemeModel(database) {
	var that = this;
	var dl = database.downloader.download;
	var builtIn = {
		'default': {
			template: 'themes/default/template.ejs',
			stylesheet: 'themes/default/style.less',
			script: null, //optional
			includeDefault: false
		},
		'inverse': {
			stylesheet: 'themes/inverse/style.less',
			includeDefault: true
		}
		'sepia': {
			stylesheet: 'themes/sepia/style.less',
			includeDefault: true,
			themeOptions: {
				//TODO: Sepia
			}
		}
		//TODO: Gold plates
		//TODO: Bootstrap
	};

	that.getI18nMessage = function(name) { 
		return name;
  };

	function reset() {
		return database.server.themes.clear();
	}

	function add(theme) {
		theme.builtIn = false;
		return database.server.themes.add(theme);
	}

	function destoy(id) {
		return database.server.themes['delete'](id);
	}

	function get(id) {
		if (Number.isNaN(parseInt(id))) {
			return getBuiltIn(id);
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
		var promises;

		if (t.includeDefault) {
			var d = builtIn.default;
			promises = [
				dl(t.stylesheet),
				dl(d.template), 
				Promise.resolve(null),
				dl(d.stylesheet)
			];
		} else {
			promises = [
				dl(t.stylesheet),
				dl(t.template), 
				(t.script ? dl(t.script) : Promise.resolve(null)),
				Promise.resolve('')
			];
		}

		return Promise.all(promises).then(function(e) {
			return {
				id: name,
				name: that.getI18nMessage(name),
				style: e[3] + '\n' + e[0],
				template: e[1],
				script: e[2]
			};
		});
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
