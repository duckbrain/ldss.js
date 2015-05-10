function LDSZBookInstaller(db, book) {
	var that = this;
	var nodes, references, transaction, nodesOS, helpers;

	function install(sqlitedb) {
		var result, css, refs;
		nodes = {};
		references = {};

		try {
			result = sqlitedb.exec(
				'SELECT id, parent_id, title, subtitle, ' +
				'short_title, uri, content, \'\' AS refs ' +
				'FROM node'
			);
			css = sqlitedb.exec('SELECT css, _file FROM css');
			refs = sqlitedb.exec('SELECT node_id, ref_name, ref, link_name FROM ref');
		} catch (ex) {
			throw "Malformed database from the zbook";
		}

		if (refs.length) {
			buildReferences(refs[0].values);
		}
		if (css.length) {
			book.details.css = css[0].values[0][0];
		}

		return new Promise(function (fulfill, reject) {
			transaction = db.transaction(['nodes'], 'readwrite');
			nodesOS = transaction.objectStore('nodes');
			helpers = new LDSInstallerHelpers(nodesOS);

			addAll(result[0].values, function () {
				findTree();
				findRelations(book);
				updateVersion();
				helpers.update(book, fulfill);
			})

			transaction.onsuccess = fulfill;
			transaction.onerror = reject;
		});
	}

	function buildReferences(refs) {
		var i, ref;

		for (i = 0; i < refs.length; i++) {
			ref = refs[i];
			if (!(ref[0] in references)) {
				references[ref[0]] = [];
			}
			references[ref[0]].push(
				'<div id="f_' + ref[1] + '">' +
				'<label>' + ref[1] + ' ' + ref[3] + '</label> ' + ref[2] +
				'</div>');
		}

		for (i in references) {
			references[i] = references[i].join('\n');
		}
	}

	function updateVersion() {
		book.details.downloadedVersion = book.details.catalogVersion;
	}

	function uninstall() {
		//TODO
	}

	function addAll(rows, callback) {
		helpers.all(rows.map(function (glNode) {
			var glId, item;
			glId = glNode[0];
			item = formatNode(glNode);
			item.details.references = references[glId]
			var request = nodesOS.add(item);
			request.onsuccess = function (e) {
				item.id = e.target.result
				nodes[glId] = item;
			};
			return request;
		}), callback);
	}

	function findTree() {
		var node, parent, i;

		book.children = [];

		for (i in nodes) {
			node = nodes[i];
			parent = nodes[node.parent];
			if (parent) {
				node.parent = parent;
				parent.children.push(node);
			} else {
				node.parent = book;
				book.children.push(node);
			}
		}
	}

	function findRelations(node) {
		if (node.type == 'node') {
			node.heiarchy = node.parent.heiarchy.concat([node]);
			node.next = helpers.findSibling(+1, node);
			node.previous = helpers.findSibling(-1, node);
		}
		for (var i = 0; i < node.children.length; i++) {
			findRelations(node.children[i]);
		}
	}

	function formatNode(row) {
		return {
			languageId: book.languageId,
			parent: row[1],
			path: row[5],
			next: null,
			previous: null,
			children: [],
			name: row[2],
			type: 'node',
			media: [],
			heiarchy: [],
			details: {
				bookId: book.id,
				content: row[6],
				references: row[7],
				shortTitle: row[4],
				subtitle: row[3]
			}
		};
	}

	that.install = install;
}

if (typeof module != 'undefined') {
	module.exports = LDSZBookInstaller;
}