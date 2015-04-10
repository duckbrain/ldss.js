function NodeModel(database) {
	var that = this;

	function get(id) {
		return database.server.nodes.get(id);
	}

	function getPath(languageId, path) {
		return database.server.nodes.query('path')
			.only([languageId, path]).execute().then(database.helpers.single);
	}

	function exists(languageId, path) {
		return getPath(languageId, path).then(function(item) {
			return !!item;
		});
	}

	function add(item) {
		return database.server.nodes.add(item);
	}

	function update(item) {
		return database.server.nodes.update(item);
	}

	function clear(languageId) {
		//TODO: Limit to languageId
		return database.server.nodes.clear();
	}

	that.add = add;
	that.clear = clear;
	that.get = get;
	that.getPath = getPath;
	that.update = update;
	that.exists = exists;
}

if (typeof module != 'undefined') {
	module.exports = NodeModel;
}
