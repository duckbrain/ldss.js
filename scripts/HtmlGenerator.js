function HtmlGenerator(conf, i18n) {
	var that = {};

	function href(target) {
		return 'index.html?q=' + target.path + '&lang=' + conf.language;
	}
	
	function getName(target) {
		return target.name;
	}

	function a(target, displayName) {

		displayName = displayName ? i18n(displayName) : (target && target.name);

		if (target) {
			return '<a href="' + that.href(target) + '" data-path="' + target.id +
				'"> ' + displayName + ' </a>'
		} else {
			return '<a>' + displayName + '</a>'
		}
	}

	function list(before, after) {
	
		if (typeof before != 'function') {
			var beforeVal = before;
			before = function() { return beforeVal; }
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
		if (item.id) {
			return '<option value="' + item.id + '">';
		} else {
			return '<option>';
		}
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