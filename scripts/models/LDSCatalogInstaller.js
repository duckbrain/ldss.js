/**
 * Takes a catalog object downloaded from LDS.org and installs it into the paths
 * objectStore.
 * @param {DatabaseModel} database Database model for inter-class communication.
 */
function LDSCatalogInstaller(db, languageId) {
	var that = this;
	var helpers = new LDSInstallerHelpers(db);
	var baseImageUrl;
	var paths = {};
	var namedPaths = {
		"1": "/scriptures",
		"45756": "/topics/jesus-christ",
		"574": "/manual/teachings-of-presidents",
		"1205": "/media-library/video",
		"45347": "/church/share",
		"15": "/topics/family",
		"45648": "/broadcasts/worldwide-devotional-for-young-adults",
		"6": "/callings/melchizedek-priesthood",
		"42683": "/topics/family-history",
		"8": "/topics/aaronic-priesthood",
		"19": "/callings/leadership-and-teaching",
		"11": "/callings/sunday-school",
		"45453": "/topics/pef-self-reliance",
		"510": "/manual/seminary",
		"511": "/manual/institute"
	}

	function install(root) {
		//
		// Add all of the items and have ID's assigned.
		//

		baseImageUrl = root.cover_art_base_url + '/';

		return db.clear(languageId)
			.then(function () {
				return add(root.catalog, formatCatalog, null)
					.then(helpers.update)
			});
	}

	function add(glItem, format, parent) {
		var item = format(glItem);
		paths[item.path] = item;

		return db.add(item).then(function (item) {
			var folderAdds, bookAdds;

			item = item[0]; // Item comes back as an array with one item

			if (parent) {
				item.parent = parent;
				item.heiarchy = parent.heiarchy.concat([item]);
				parent.children.push(item);
			} else {
				item.parent = null;
				item.heiarchy = [item];
			}

			if (item.type != 'book') { // Catalog or folder
				folderAdds = glItem.folders.map(function (glFolder) {
					return add(glFolder, formatFolder, item);
				});
				bookAdds = glItem.books.map(function (glBook) {
					return add(glBook, formatBook, item);
				});
				return Promise.all(folderAdds.concat(bookAdds)).then(function () {
					item.next = helpers.findSibling(+1, item);
					item.previous = helpers.findSibling(-1, item);
					return item;
				});
			} else { //It's a book!
				item.children = [];
				return item;
			}
		});
	}

	function formatBlank(item) {
		return {
			languageId: languageId,
			parent: null,
			path: item.path,
			next: null,
			previous: null,
			children: [],
			name: item.name,
			type: item.type,
			media: [],
			heiarchy: [],
			content: item.content || null,
			details: item.type == 'book' ? {
				url: item.url || null,
				css: null,
				downloadedVersion: null,
				catalogVersion: item.version || null,
				image: item.image || null,
			} : null
		};
	}

	function formatCatalog(item) {
		return formatBlank({
			path: '/',
			name: item.name,
			type: 'catalog'
		});
	}

	function formatFolder(item) {
		//TODO: Make a path name by looking at what the children have in common or the name. Ensure that the same path name
		//is not used more than once. If the generated name matches an existing one, fall back to the id number
		var path = namedPaths[item.legacyid];

		if (!path) {
			path = '/' + item.eng_name.toLowerCase().replace(/ /g, "-");
		}

		return formatBlank({
			path: path,
			name: item.name,
			type: 'folder'
		});
	}

	function formatBook(item) {
		return formatBlank({
			path: item.gl_uri,
			name: item.name,
			type: 'book',
			content: item.description,
			url: item.url,
			version: item.datemodified,
			image: baseImageUrl + item.cover_art.replace("{0}", "")
		})
	}

	that.install = install;
}

if (typeof module != 'undefined') {
	module.exports = LDSCatalogInstaller;
}
