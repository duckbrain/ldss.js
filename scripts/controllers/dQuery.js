function dQuery() {
	var that;
	var document = window.document;

	/**
	 * Intended to get a list of elements from whatever it is passed.
	 * @param  {multiple} element An element, array, or string from which to get a list of elements.
	 * @return {DOMElement Array} Warning: This may not be a real array and may not have Array's prototype functions.
	 */
	function omni(element) {
		if (!element) {
			return [];
		} else if (typeof element == 'string') {
			return $a(element);
		} else if ('length' in element) {
			return element;
		} else {
			return [element]
		}
	}

	/**
	 * Returns a function where the first parameters is run through the omni function, then the passed action is called for each element in the array.
	 * @param {function} action A function to be converted into an omni function.
	 */
	function makeOmni(action) {
		return function (elements) {
			var e = omni(elements);
			for (var i = 0; i < e.length; i++) {
				arguments[0] = e[i];
				action.apply(e[i], arguments);
			}
			return e;
		}
	}

	function on(element, event, handler, allowDefault) {
		element.addEventListener(event, function (e) {
			if (!allowDefault) {
				e.preventDefault();
			}
			handler(e);
			return allowDefault;
		});
	}

	function makeEvent(event) {
		return function (element, handler, allowDefault) {
			return on(element, event, handler, allowDefault);
		}
	}

	/**
	 * Shorthand for document.querySelector(), but also the root element of the dQuery object.
	 */
	function $(query) {
		return document.querySelector(query);
	}

	/**
	 * Shorthand for document.querySelectorAll(), optionally can be called with a callback to execute on each element.
	 * @param  {string}   query
	 * @param  {Function} callback If provided, called for each element: callback(element, index)
	 * @return {DOMElement Array}
	 */
	function $a(query, callback) {
		var results = document.querySelectorAll(query);
		if (callback) {
			for (var i = 0; i < results.length; i++) {
				callback(results[i], i);
			}
		}
		return results;
	}

	/**
	 * Shorthand for document.getElementById()
	 */
	function id(id) {
		return document.getElementById(id);
	}

	function attachLinks(query, handler, allowDefault) {
		allowDefault = !!allowDefault;
		$a(query, function (link) {
			on(link, 'click', handler, allowDefault);
		});
	}

	function escapeRegExp(str) {
		return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
	}

	function addClass(element, className) {
		var regex = new RegExp('(?:^|\\s)' + escapeRegExp(className) + '(?!\\S)', 'g');
		if (element && !element.className.match(regex)) {
			element.className += ' ' + className;
		}
	}

	function removeClass(element, className) {
		var regex = new RegExp('(?:^|\\s)' + escapeRegExp(className) + '(?!\\S)', 'g');
		element.className = element.className.replace(regex, '');
	}

	function fireEvent(element, event) {
		if (document.createEvent) {
			// dispatch for firefox + others
			var evt = document.createEvent("HTMLEvents");
			evt.initEvent(event, true, true); // event type,bubbling,cancelable
			return !element.dispatchEvent(evt);
		} else {
			// dispatch for IE
			var evt = document.createEventObject();
			return element.fireEvent('on' + event, evt)
		}
	}

	that = $;
	that.query = $;
	that.queryAll = $a;
	that.id = id;
	that.attachLinks = attachLinks;
	that.addClass = makeOmni(addClass);
	that.removeClass = makeOmni(removeClass);
	that.fireEvent = makeOmni(fireEvent);

	that.on = makeOmni(on);
	that.click = makeOmni(makeEvent('click'));
	return that;
}