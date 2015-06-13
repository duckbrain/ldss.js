function NodeModel(database) {
	var that = this;
	var decorations;

	function init() {
		//TOOD Load decorations from JSON.
		decorations = {
			"/scriptures": {
				"image": "img/icon_128.png"
			},
			"/missionary": {
				"image": "http://media.ldscdn.org/images/media-library/missionary/badge-315547-mobile.jpg"
			},
			"/general-conference": {
				"image": "http://media.ldscdn.org/images/media-library/conference-events/general-conference/general-conference-2011-april-826117-mobile.jpg"
			},
			"/church/share": {
				"image": "http://media.ldscdn.org/images/media-library/member-missionary/member-missionary-work-576148-mobile.jpg"
			},
			"/liahona": {
				"image": "http://media.ldscdn.org/images/media-library/scriptures/liahona-760495-mobile.jpg"
			},
			"/topics/jesus-christ": {
				"image": "http://media.ldscdn.org/images/media-library/gospel-art/new-testament/christus-statue-1025369-mobile.jpg"
			},
			"/music": {
				"icon": "music"
			},
			"/videos": {
				"icon": "video"
			}
		};

		return Promise.resolve(null);
	}

	function get(id) {
		return database.server.nodes.get(id).then(getDetails);
	}

	function getPath(languageId, path) {
		if (!languageId || !path) {
			throw new Error("You must provide a languageId and a path");
		}

		return database.server.nodes.query('path')
			.only([languageId, path]).execute().then(database.helpers.single).then(getDetails);
	}

	function getDetails(node) {
		if (!node) {
			return null;
		}

		function getId(id) {
			return id ? database.server.nodes.get(id).then(decorate) : null;
		}

		return Promise.all([
			getId(node.parent),
			getId(node.next),
			getId(node.previous),
			Promise.all(node.heiarchy.map(getId)),
			Promise.all(node.children.map(getId)),
		]).then(function(a) {
			node.parent = a[0];
			node.next = a[1];
			node.previous = a[2];
			node.heiarchy = a[3];
			node.children = a[4];
			return decorate(node);
		});
	}

	function decorate(node) {
		if (!node) {
			return null;
		}

		var d = decorations[node.path];
		if (d) {
			if (!node.details) {
				node.details = {};
			}
			node.details.image = d.image || node.details.image;
			node.details.icon = d.icon || node.details.icon;
		}
		return node;
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

	that.init = init;
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
