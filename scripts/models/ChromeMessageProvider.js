function ChromeMessageProvider() {
	var listeners = [];
	var handlers = {};

	function messageReceived(request, sender, sendResponse) {
		var i, callback, response, handler;
		for (i = 0; i < listeners.length; i++) {
			listeners[i](request.title, request.message, sendResponse);
		}
		// Default to miss
		handler = handlers[request.title] || handlers['miss'];
		if (handler) {
			for (i = 0; i < handler.length; i++) {
				try {
					callback = handler[i];
					if (callback.isMiss) {
						response = callback({
							action: request.title,
							params: request.message
						}, sender);
					} else {
						response = callback(request.message, sender);
					}
					Promise.resolve(response).then(function onSuccess(e) {
						request.success = true;
						request.response = e;
						sendResponse(request);
					}, function onFailure(e) {
						request.success = false;
						request.response = e;
						sendResponse(request);
					});
				} catch (ex) {
					request.success = false;
					request.response = ex;
					sendResponse(request);
				}
			}
		} else {

		}
		return true;
	}

	this.listen = function listen(callback) {
		listeners.push(callback);
	};

	this.on = function on(event, callback) {
		callback.isMiss = event == 'miss';
		(handlers[event] || (handlers[event] = [])).push(callback);
	};

	this.send = function send(title, message) {
		return new Promise(function (fulfill, reject) {
			chrome.runtime.sendMessage({
				title: title,
				message: message
			}, function (e) {
				if (!e) {
					reject('No response');
					return;
				}
				if (e.success) {
					fulfill(e.response);
				} else {
					reject(e.response);
				}

			});
		});
	};

	chrome.runtime.onMessage.addListener(messageReceived);
}
