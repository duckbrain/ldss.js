function BookmarkModel() {
	var that = this;

	function generateGuid() {
		return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		    var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
		    return v.toString(16);
		});
	}

	function getAll() {

	}

	function get(id) {

	}

	function add(bookmark) {

	}

	function update(bookmark) {

	}

	function destroy(bookmark) {

	}

	that.getAll = getAll;
	that.get = get;
	that.add = add;
	that.update = update;
	that.destroy = destroy;
}

if (typeof module != 'undefined') {
	module.exports = BookmarkModel;
}
