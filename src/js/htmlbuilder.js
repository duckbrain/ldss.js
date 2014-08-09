if (typeof(lds) != 'object') var lds = {};
lds.HTMLBuilder = function() {
	this.html = '';
	this.unclosed = [];
	this.unpaired = ['input', 'img', 'br', 'hr', 'basefont', 'meta'];
	this.openHead = false;
	
	// Appends a new HTML element with the passed tag. Does not close
	// the header tag so that attributes can be added.
	this.append = function(tag) {
		this.closeTag();
		this.html += '<' + tag + ' ';
		this.openHead = true;
		this.unclosed.push(tag);
		return this;
	};
	
	// Appends a new HTML element that is a child of the previous one
	// if the previsous one is not unpaired, will cause the next append
	// operation to be equal to a child if passed null.
	this.child = function(tag) {
		this.closeHead();
		if (tag != null) {
			this.html += '<' + tag + ' ';
		}
		this.openHead = true;
		this.unclosed.push(tag);
		return this;
	};
	
	// Closes the head (if open) and sets the inner HTML of the element.
	this.text = function(text) {
		this.closeHead();
		this.html += text;
		return this;
	};
	
	// Adds an attribute the the current tag if open. 
	// Throws error otherwise.
	this.attr = function(name, data) {
		if (this.openHead) {
			if (typeof(name) == 'object') {
				data = name;
				for (var field in data) {
					this.attr(field, data[field]);
				}
				return this;
			} else if (typeof(name) != 'undefined')
				this.html += name + "=\"" + data + "\" ";
		} else {
			throw "Illegal Operation, Head not open";
		}
		return this;
	};
	
	// Returns true if the current unclosed tag is in the unpaired 
	// array and closes it. Otherwise returns false.
	this.checkUnpaired = function() {
		var tag = this.unclosed[this.unclosed.length - 1];
		for (var i in this.unpaired) {
			if (this.unpaired[i] == tag) {
				this.html += '/>';
				this.openHead = false;
				this.unclosed.pop();
				return true;
			}
		}
		return false;
	};
	
	// Closes the head if open
	this.closeHead = function() {
		if (this.checkUnpaired()) return this;
		
		if (this.openHead && this.unclosed[this.unclosed.length - 1] != null) {
			this.html += ">";
		}
		this.openHead = false;
		return this;
	};
	
	// Closes the last tag currently open.
	this.closeTag = function(count) {
		if (!this.checkUnpaired()) {
			this.closeHead();
			if (this.unclosed.length > 0)
				var tag = this.unclosed.pop();
				if (tag != null)
					this.html += '</' + tag + '>';
		}
		if (count)
			this.closeTag(count - 1);
		return this;
	}
	
	this.close = this.closeTag;
	
	// Ensures that all tags are properly closed and returns the html value
	this.getHTML = function() {
		while (this.unclosed.length > 0)
			this.closeTag();
		return this.html;
	};
	
	//
	// Elements
	//
	
	// Adds an <a> tag with an optional href and attr object as child
	this.a = function(href, attr) {
		this.child('a');
		if (href)
			this.attr('href', href)
		return this.attr(attr);
	}
	
	// Adds an <input> with type, optional value, and attr object as child
	this.input = function(type, value, attr) {
		this.child('input').attr('type', type)
		if (typeof(value) != 'undefined')
			this.attr('value', value)
		return this.attr(attr);
	}
	
	// Adds <ul> with optional attr as child
	this.ul = function(attr) {
		return this.child('ul').attr(attr);
	}
	
	// Adds <li> with optional attr as child
	this.li = function(attr) {
		return this.child('li').attr(attr);
	}
	
	// Adds <div> with optional attr as child
	this.div = function(attr) {
		return this.child('div').attr(attr);
	}
	
	//
	// Attributes
	//
	
	// Sets id of open head
	this.id = function(id) {
		return this.attr('id', id);
	}
	
	// Sets class of open head, if passed an array, will properly append them
	this.class = function() {
		var lists = [];
		for (var i = 0; i < arguments.length; ++i) {
			var arg = arguments[i];
			if (typeof(arg) == 'object' && 'join' in arg)
				arg = arg.join(' ');
			lists.push(arg);
		}
		return this.attr('class', lists.join(' '));
	}
	
	// Sets one or more data- attributes of open head. Can be passed 
	// name and value or an object of name-value pairs
	this.data = function(name, data) {
		if (typeof(name) == 'object') {
			data = name;
			for (var field in data) {
				this.attr('data-' + field, data[field]);
			}
			return this;
		} else
			return this.attr('data-' + name, data);
	};

	//
	// Font Awesome
	//
	this.fa = function(icon) {
		var lists = [];
		for (var i = 0; i < arguments.length; ++i) {
			var arg = arguments[i];
			if (typeof(arg) == 'object' && 'join' in arg)
				arg = arg.join(' ');
			lists.push('fa-' + arg);
		}
		return this.child('i').class('fa ' + lists.join(' ')).close();
	}
}
