function SearchModel(database, languageId) {
	var that = this,
		scriptures;
	var maxRecommendations = 10;
	var i18nStrings = {
		'open': "Open",
		'search': "Search for"
	};

	if (!database) {
		throw "You must provide a database";
	}
	if (!languageId) {
		throw "You must provide a languageId";
	}

	// The scripture array contains only English.
	scriptures = {
		scriptures: [{
			name: 'Genesis',
			names: ['gen', 'genesis'],
			book: '/scriptures/ot',
			path: '/scriptures/ot/gen'
		}]
	};

	function init() {
		//TODO: Populate scriptures from JSON
	}

	function dispatch(query, options) {
		if (query.indexOf('/') == 0) {
			return options.path(query);
		} else {
			return Promise.all([
				options.scripture(query),
				options.search(query)
			]).then(function (e) {
				return e[0].concat(e[1]);
			})
		}
	}

	function recommend(query) {
		return dispatch(query, {
			path: recommendPath,
			scripture: recommendScripture,
			search: recommendSearch
		});
	}

	function recommendPath(query) {
		return new Promise(function (fullfil, reject) {
			var recommendations = [];
			var nodeOS = database.db.transaction('nodes').objectStore('nodes');
			nodeOS.onerror = reject;
			nodeOS.openCursor().onsuccess = function (event) {
				var cursor = event.target.result;
				var path = cursor ? cursor.value.path : null;
				if (cursor.value.languageId == languageId && path && recommendations.length < maxRecommendations) {
					if (path.indexOf(query) == 0) {
						recommendations.push({
							content: path,
							description: i18nStrings.open + ' "' + cursor.value.name + '" <match>' + query + "</match>" + path.substring(query.length)
						});
					}
					cursor.continue();
				} else {
					fullfil(recommendations);
				}
			}
		});
	}

	function recommendScripture(query) {
		return [];
	}

	function recommendSearch(query) {
		return [{
			content: query,
			description: i18nStrings.search + " <match>" + query + "</match>"
		}];
	}

	function search(query) {
		dispatch(query, {
			path: getPath,
			scripture: getScripture,
			search: getSearch
		})
	}

	function getPath(query) {
		return database.node.getByPath(languageId, query);
	}

	function getScripture(query) {
		//TODO: Return a single scripture from the scripture array.
	}

	function getSearch(query) {

	}

	that.init = init;
	that.recommend = recommend;
	that.search = search;
}