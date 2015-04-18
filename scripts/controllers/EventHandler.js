function EventHandler() {
	var that, callbacks = [];

	function add(callback) {
		callbacks.push(callback);
	}

	function remove(callback) {
		//TODO
	}

	function fire() {
		for (var i = 0; i < callbacks.length; i++) {
			arguments = that.getParam ? [that.getParam.apply(this, arguments)] : arguments;
			callbacks[i].apply(this, arguments);
		}
	}

	that = fire;
	that.add = add;
	that.remove = remove;
	that.fire = fire;
	that.getParam = null;
	return that;
}
