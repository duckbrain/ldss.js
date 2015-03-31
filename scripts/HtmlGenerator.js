function HtmlGenerator(conf, i18n) {
	var that = {};

	function href(target) {
		return 'index.html?q=' + target.path + '&lang=' + conf.language;
	};

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
		var myList = function(item, template) {
			if (!item) {
				return '';
			} else if (Array.isArray(item)) {
				return item.map(function(i) {
					return myList(i, template);
				}).join('');
			} else {
				return before + template(item) + after
			}
		}
		return myList;
	}

	function ul(item, template) {
		return '<ul>' + that.li(item, template) + '</ul>';
	}

	that.href = href;
	that.hrefAuto = href;
	that.a = a;
	that.li = list('<li>', '</li>');
	that.option = list('<option>', '</option>');
	that.list = list('', '');
	that.ul = ul;

	return that;
}
