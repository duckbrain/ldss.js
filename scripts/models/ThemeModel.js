function ThemeModel(database) {
	var that = this;
	var builtIn = {
		'default': {
			stylesheet: 'themes/default/theme.less',
			includeDefault: false,
			defaultOptions: {
				background: '#ffffff',
				color: '#000000',
				accent: '#cccccc',
				highlight: '#ffff00',
				margins: '48',
				fontFamily: 'arial',
				fontSize: '12',
				hideFootnotes: false,
				hideAnnotations: false
			}
		}
		/*,
				'inverse': {
					stylesheet: 'themes/inverse/theme.less',
					includeDefault: true
				},
				'sepia': {
					stylesheet: 'themes/sepia/theme.less',
					includeDefault: true
				}*/
		//TODO: Gold plates
		//TODO: Bootstrap
	};

	that.getI18nMessage = function (name) {
		return name;
	};

	function reset() {
		return database.server.themes.clear();
	}

	function add(theme) {
		theme.builtIn = false;
		return database.server.themes.add(theme);
	}

	function destroy(id) {
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
			]).then(function (e) {
			return e[1].concat(e[0]);
		});
	}

	function update(theme) {
		return database.server.themes.update(theme);
	}

	function dl(path) {
		return path ? database.downloader.download(path) : Promise.resolve(null);
	}

	function getBuiltIn(name) {
		var t = builtIn[name];
		var promises;

		if (t.includeDefault) {
			var d = builtIn.default;
			promises = [
				dl(t.stylesheet),
				dl(d.stylesheet)
			];
		} else {
			promises = [
				dl(t.stylesheet),
				Promise.resolve('')
			];
		}

		return Promise.all(promises).then(function (e) {
			return {
				id: name,
				name: that.getI18nMessage(name),
				style: e[1] + '\n' + e[0]
			};
		});
	}

	function getAllBuiltIn() {
		return Promise.all(Object.getOwnPropertyNames(builtIn).map(getBuiltIn));
	}

	that.add = add;
	that.destroy = destroy;
	that.get = get;
	that.reset = reset;
	that.getAll = getAll;
	that.getBuiltIn = getBuiltIn;
}

if (typeof module != 'undefined') {
	module.exports = ThemeModel;
}
