function NodeModel(database) {
	var that = this;

	function get(id) {
		return database.server.nodes.get(id).then(getDetails);
	}

	function getPath(languageId, path) {
		return database.server.nodes.query('path')
			.only([languageId, path]).execute().then(database.helpers.single).then(getDetails);
	}

	function getDetails(node) {

		if (!node) {
			return null;
		}

		function getId(id) {
			if (!id) {
				return null;
			} else if (Array.isArray(id)) {
				return Promise.all(id.map(getId));
			} else {
				return database.server.nodes.get(id);
			}
		}

		return Promise.all([
			getId(node.parent),
			getId(node.next),
			getId(node.previous),
			getId(node.heiarchy),
			getId(node.children)
		]).then(function(a) {
			node.parent = a[0];
			node.next = a[1];
			node.previous = a[2];
			node.heiarchy = a[3];
			node.children = a[4];
			return node;
		});
	}

	function exists(languageId, path) {
		return getPath(languageId, path).then(function (item) {
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
		return new Promise(function (fullfil, reject) {
			var transaction = database.db.transaction(['nodes'], 'readwrite');
			var nodeOS = transaction.objectStore('nodes');
			var index = nodeOS.index('languageId');
			index.openCursor().onsuccess = function (event) {
				var cursor = event.target.result;
				if (cursor && cursor.key == languageId) {
					nodeOS.delete(cursor.value.id)
					cursor.continue();
				}
			}

			transaction.oncomplete = fullfil;
			transaction.onerror = reject;
		});
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
