//
// Temporary file for developing the new theme without EJS.
//

//(function() {
	var database = new DatabaseModel();
	database.settings.getDefaults().then(function(settings) {
		return database.theme.getBuiltIn('default').then(function(theme) {
			less.render(theme.style, {
				globalVars: settings.themeOptions
			}).then(function (output) {
				document.getElementById('custom-css').innerHTML = output.css;
			});
		});
	});

//})();
