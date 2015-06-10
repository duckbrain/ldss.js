//
// Temporary file for developing the new theme without EJS.
//

//(function() {
	var database = new DatabaseModel();
	database.options.getDefaults().then(function(options) {
		return database.theme.getBuiltIn('default').then(function(theme) {
			less.render(theme.style, {
				globalVars: options.themeOptions
			}).then(function (output) {
				document.getElementById('custom-css').innerHTML = output.css;
			});
		});
	});

//})();
