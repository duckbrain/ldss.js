function LDSZBookInstaller(db, book) {
	var that = this;
	var nodes, references;
	var helpers = new LDSInstallerHelpers(db);

	function progress(message) {
		return function(data) {
			// Temporarily disabled, will probably remove.
			//that.progress(message);
			return data;
		}
	}

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
			throw "Malformed database";
		}

		buildReferences(refs[0].values);
		book.details.css = css[0].values[0][0];

		return addAll(result[0].values)
			.then(progress('ids assigned'))
			.then(findTree)
			.then(findRelations)
			.then(progress('relations determined'))
			.then(updateVersion)
			.then(helpers.update)
			.then(cleanup);
		// TODO: After updated, it should look for the book or nodes that have 1 child and no content. Those items should
		// be updated to have thier child's name and content, but the names on refrences should not be updated. The child
		// can then be deleted.
	}

	function cleanup() {
		result = null;
		css = null;
		refs = null;
		nodes = null;
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
		return book;
	}

	function uninstall() {
		//TODO
	}

	function addAll(rows) {
		return Promise.all(rows.map(add));
	}

	function add(glNode) {
		var glId, item;
		glId = glNode[0];
		item = formatNode(glNode);
		item.details.refrences = references[glId]

		return db.add(item).then(function(item) {
			item = item[0]; // Item comes back as an array with one item
			nodes[glId] = item;
		});
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

		return book;
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
		return node;
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
				refrences: row[7],
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
