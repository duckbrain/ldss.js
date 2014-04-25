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

String.prototype.occurrences = function (subString, allowOverlapping) {

    var string = this; subString+="";
    if(subString.length<=0) return string.length+1;

    var n=0, pos=0;
    var step=(allowOverlapping)?(1):(subString.length);

    while(true){
        pos=string.indexOf(subString,pos);
        if(pos>=0){ n++; pos+=step; } else break;
    }
    return(n);
};

var def = function(self, field, value) {
	//Returns true or false for if the field is defined or not on the object,
	//If value is passed, it will set that only if not defined.
	var defined = field in self;
	if (!defined && typeof(value) != 'undefined')
		self[field] = value;
	return defined;
};