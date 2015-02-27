function ThemeModel(database) {
	var that = this;
	var builtIn = {
		-1: { name: 'default' 
			  
			},
		-2: { name: 'midnight' }
	}
	
	function add(theme) {
		return database.server.themes.add(theme);
	}
	
	function destoy(themeId) {
		return database.server.themes['delete'](themeId);
	}
	
	function get(themeId) {
		return database.server.themes.get(themeId)
	}
	
	function update(theme) {
		return database.server.themes.update(theme);
	}
	
	function getBuiltIn(id) {
		
		//TODO: Less and EJS engines
		// links.js will be a default javascript file to bind the links
		// If libraries is declared, it can include it.
		
		var name = builtIn[id].name;
		
		return Promise.all([
			database.downloader.get('themes/' + name + '/style.less'),
			database.downloader.get('themes/' + name + '/template.ejs'),
			database.downloader.get('themes/' + name + '/script.js')
		]).then(function(e) {
			return {
				id: -1,
				css: e[0],
				template: e[1],
				javascript: e[2],
				libraries: builtIn[id].libraries || [ 'scripts/links.js' ],
			};
		})
		
		
	}
	
    that.add = add;
    that['delete'] = destoy;
    that.get = get;
}

if (typeof module != 'undefined') {
    module.exports = ThemeModel;
}
