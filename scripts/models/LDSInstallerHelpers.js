function LDSInstallerHelpers(db) {
	var that = {};

	function findSibling(direction, item) {
		var index, siblings;

		if (item.parent) {
			siblings = item.parent.children
			index = siblings.indexOf(item);

			if (siblings[index + direction]) {
				return siblings[index + direction];
			} else {
				//TODO Traverse to find better sibling
				return null;
			}
		} else {
			return null;
		}
	}

	function update(item) {
		var children = item.children;
		item.heiarchy = summary(item.heiarchy);
		item.next = summary(item.next);
		item.preivous = summary(item.previous);
		item.children = summary(item.children);
		return Promise.all([
			db.update(item),
			children.map(update)
		]);
	}

	function summary(item) {
		if (!item) {
			return null;
		} else if (Array.isArray(item)) {
			return item.map(summary);
		} else {
			return {
				id: item.id,
				name: item.name,
				path: item.path,
				type: item.type
			};
		}
	}

	that.findSibling = findSibling;
	that.update = update;

	return that;
}
