function HtmlGenerator(navigation, i18n) {
	var that = {};

	function href(target) {
		if (!target) {
			return false;
		}
		switch (typeof target) {
			case 'string':
				return target;
			case 'object':
				if ('path' in target) {
					return 'index.html?' + target.path + '?lang=' + navigation.language.code_three;
				} else if ('code_three' in target) {
					return 'index.html?' + navigation.path + '?lang=' + target.code_three;
				} else {
					throw "Unknown object 'target'";
				}
			default:
				return target;
		}
	}

	function value(target) {
		switch (typeof target) {
			case 'string':
				return target;
			case 'object':
				if ('id' in target) {
					return target.id;
				} else if ('path' in target) {
					return target.path;
				} else if ('code_three' in target) {
					return target.code_three;
				} else {
					throw "Unknown object 'target'";
				}
			default:
				return target;
		}
	}

	function getName(target) {
		return target.name;
	}

	function a(target, displayName) {

		displayName = displayName ? i18n(displayName) : (target && target.name);

		var attr = [];

		if (target && 'type' in target) {
			attr.push('data-type="' + target.type + '"');
		}
		if (target && 'id' in target) {
			attr.push('data-id="' + target.id + '"');
		}
		if (that.href(target)) {
			attr.push('href="' + that.href(target) + '"');
		}

		return '<a ' + attr.join(' ') + '>' + displayName + ' </a>'
	}


	function list(before, after) {

		if (typeof before != 'function') {
			var beforeVal = before;
			before = function() {
				return beforeVal;
			}
		}

		var myList = function(item, template) {
			if (!template) {
				template = getName;
			}

			if (!item) {
				return '';
			} else if (Array.isArray(item)) {
				return item.map(function(i) {
					return myList(i, template);
				}).join('');
			} else {
				return before(item) + template(item) + after
			}
		}
		return myList;
	}

	function optionBefore(item) {
		var v = value(item);
		return v ? '<option value="' + v + '">' : '<option>';
	}

	function ul(item, template) {
		return '<ul>' + that.li(item, template) + '</ul>';
	}

	function select(item, template) {
		return '<select>' + that.option(item, template) + '</select>';
	}

	that.href = href;
	that.hrefAuto = href;
	that.a = a;
	that.li = list('<li>', '</li>');
	that.option = list(optionBefore, '</option>');
	that.list = list('', '');
	that.ul = ul;
	that.select = select;

	return that;
}
