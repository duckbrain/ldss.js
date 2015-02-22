function ChromeMessageProvider() {
	var listeners = [];
	var handlers = {};

	function messageReceived(request, sender, sendResponse) {
		var i;
		for (i = 0; i < listeners.length; i++) {
			listeners[i](request.title, request.message, sendResponse);
		}
		var handler = handlers[request.title];
		if (handler) {
			for (i = 0; i < handler.length; i++) {
				handler[i](request.message, sender, sendResponse);
			}
		}
		return true;
	}

	this.listen = function listen(callback) {
		listeners.push(callback);
	};

	this.on = function on(event, callback) {
		(handlers[event] || (handlers[event] = [])).push(callback);
	};

	this.send = function send(title, message) {
		return new Promise(function(fulfill, reject) {
			chrome.runtime.sendMessage({
				title: title,
				message: message
			}, fulfill);
		}).then();
	};

	chrome.runtime.onMessage.addListener(messageReceived);
}
