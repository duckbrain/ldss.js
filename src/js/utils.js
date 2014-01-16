jQuery.fn.extend({
  check: function() {
    return this.each(function() { this.checked = true; this.indeterminate = false; });
  },
  uncheck: function() {
    return this.each(function() { this.checked = false; this.indeterminate = false; });
  },
  indeterminate: function() {
	return this.each(function() { this.indeterminate = true; this.checked = false; });
  },
  checked: function(val) {
	if (typeof(val) == 'undefined') {
		var checked = false;
		this.each(function() { checked = true; });
		return checked;
	} else 
		return this.each(function() { this.checked = val; })
  },
  enable: function() {
	return this.removeAttr('disabled');
  },
  disable: function() {
	return this.attr('disabled', true);
  }
});

var _parseInt = parseInt;
parseInt = function(v) {
	if (typeof(v) == 'object') {
		for (var i in v) {
			var c = _parseInt(v[i]);
			if (!isNaN(c))
				v[i] = c;
		}
		return v;
	} else
		return _parseInt(v);
}
