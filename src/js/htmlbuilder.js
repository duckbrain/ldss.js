// This file provides a class that will allow you to build a string of HTML by adding
// the elements you want it to have and certain properties for them.

function HTMLBuilder()
{
    this._beginning = '';
    this._ending = '';
    this.addParent = function(tag, id, classes)
    {
        this._beginning += '<' + tag;
        if (id)
            this._beginning += ' id="' + id + '"';
        if (classes)
            this._beginning += ' class="' + classes + '"';
        this._beginning += '>';
        this._ending += '</' + tag + '>' + this._ending;
    };
    this.addChild = function(tag, id, classes, content, href)
    {
        this._beginning += '<' + tag;
        if (id)
            this._beginning += ' id="' + id + '"';
        if (classes)
            this._beginning += ' class="' + classes + '"';
        if (href)
            this._beginning += '><a href="' + href + '">' + content + '</a></' + tag + '>';
		else
        	this._beginning += '>' + content + '</' + tag + '>';
    };
    this.getHTML = function()
    {
        return this._beginning + this._ending;
    };
}