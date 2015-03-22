function PathCacheModel(database, model) {
	var that = this;

	function updateCache(info) {
		return database.server.paths.update(info).then(database.helpers.single);
	}

	that.get = function get(languageId, path) {
		return database.server.paths.get([languageId, path]).then(function(info) {
			if (info) {
				return info;
			} else {
				return model.get(languageId, path).then(updateCache)
			}
		})
	};

	that.getDetails = function(info) {
		if (info.children) {
			return info;
		}

		return this.get(info.languageId, info.path).then(function(newInfo) {
			if (newInfo.children) {
				return newInfo;
			} else {
				return model.getDetails(info).then(updateCache);
			}
		});
	};
}
