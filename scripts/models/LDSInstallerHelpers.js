function LDSInstallerHelpers(db) {
	var that = {};

	function findSiblingLevel(direction, item, level) {
		var index, siblings, result;

		if (item.parent && item.parent.children) {
			siblings = item.parent.children
			index = siblings.indexOf(item);

			if (siblings[index + direction]) {
				return siblings[index + direction];
			} else {
				result = findSiblingLevel(direction, item.parent, level + 1);
				while (result && isNaN(result) && level >= 0) {
					if (direction > 0) {
						result = result.children[0]
					} else {
						result = result.children[result.children.length - 1];
					}
					level--;
				}
				return result;
			}
		} else {
			return null;
		}
	}

	function findSibling(direction, item) {
		return findSiblingLevel(direction, item, 0);
	}

	function update(item) {
		var children, parent, i;

		children = item.children;
		parent = item.parent;

		item.heiarchy = item.heiarchy.map(summary);
		item.next = summary(item.next);
		item.previous = summary(item.previous);
		item.children = item.children.map(summary);
		item.parent = summary(parent);

		for (i = 0; i < children.length; i++) {
			if (children[i].children.length == 1) {
				item.children[i].id = children[i].children[0].id;
				item.children[i].path = children[i].children[0].path;
			}
		}

		if (parent && parent.children && parent.children.length == 1) {
			item.parent.id = parent.parent.id;
			item.parent.path = parent.parent.path;
		}

		for (i = 1; i < item.heiarchy.length; i++) {
			fixName(item.heiarchy[i - 1], item.heiarchy[i]);
		}

		return Promise.all([
			db.update(item),
			children.map(update)
		]);
	}

	function fixName(parent, item) {
		var newName;
		if (!parent || !item) {
			return;
		}
		if (item.name != parent.name && item.name.indexOf(parent.name) == 0) {
			newName = item.name.substring(parent.name.length).trim();
			item.name = newName;
		}
	}

	function summary (item) {
		return item ? item.id : null;
	}

	that.findSibling = findSibling;
	that.update = update;

	return that;
}
