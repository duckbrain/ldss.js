
/**
 * Supplies a function to parse a scripture reference path. Depends on the Browser DOM.
 * @class PathParser
 */
function PathParser() {
	var parser = document.createElement('a');

	function parse(uri) {
		var result = { path: '/', verses: [], selectedVerse: 0, verseString: '', languageCode: 'eng' };
		var search = '';
		parser.href = uri;

		// Try to parse the selected verse from the hash
		if (0 < parser.hash.length) {
			result.selectedVerse = parseInt(parser.hash.substring(1));
			if (isNaN(result.selectedVerse)) {
				result.selectedVerse = 0;
			}
		}

		// Parse the main components to narrow down later.
		if ('www.lds.org' == parser.hostname) {
			// Parse LDS.org path
			result.path = parser.pathname;
			if (1 < parser.search.length) {
				search = parser.search.substring(1);
			}
		} else {
			// Parse LDS Scriptures Path
			var searchComponents = parser.search.split('?');
			if (2 == searchComponents.length) {
				if (searchComponents[1].indexOf('/') == 0) {
					result.path = searchComponents[1];
				} else {
					search = searchComponents[1];
				}
			} else if (2 < searchComponents.length) {
				result.path = searchComponents[1];
				search = searchComponents[2];
			}
		}

		// Parse the verses off the path.
		var pathComponents = result.path.split('.');
		result.path = pathComponents.shift();
		result.verseString = pathComponents.join('.');
		pathComponents.forEach(function(comp) {
			result.verses.push(parseInt(comp));
		});

		// Parse any details that may be in the query.
		result.languageCode = parseQueryParam(search, 'lang', result.languageCode);

		parser.search;   // => "?search=test"
		parser.hash;     // => "#hash"
		parser.host;     // => "example.com:3000"

		return result;
	}

	function parseQueryParam(search, name, defaultValue) {
		name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec('?' + search);
    return results === null ? defaultValue : decodeURIComponent(results[1].replace(/\+/g, " "))
	}

	this.parse = parse;


		/*function parseUri(path) {
			var components = path.split('?');
			var data = {};

			if (components.length > 2) {
				filename = components.shift();
			}
			if (components.length > 1) {
				//Parse query
				components.pop().split('&').forEach(function(param) {
					var index = param.indexOf('=');
					var name = param.substring(0, index);
					var value = param.substring(index + 1);
					if (name == 'lang') {
						data.languageCode = value;
					} else if (name == 'bookmark') {
						data.bookmarkId = value;
					}
				});
			}
			// The rest is the path
			data.path = components.join('?');

			// TODO: Parse out dot (.) seperated verses from the path.

			return data;
		}*/
}
