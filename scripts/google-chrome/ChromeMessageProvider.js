function ChromeMessageProvider() {
    var listeners = [ ];
    var handlers = {};

    function messageReceived(request, sender, sendResponse) {
        var i;
        for (i = 0; i < listeners.length; i++) {
            listeners[i](request.title, request.message, sendResponse);
        }
        // Default to miss
        var handler = handlers[request.title] || handlers['miss'];
        if (handler) {
            for (i = 0; i < handler.length; i++) {
                try {
                    var response = handler[i](request.message, sender);
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
        (handlers[event] || (handlers[event] = [ ])).push(callback);
    };

    this.send = function send(title, message) {
        return new Promise(function(fulfill, reject) {
            chrome.runtime.sendMessage({
                title: title,
                message: message
            }, function(e) {
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
