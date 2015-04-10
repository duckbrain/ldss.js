function dQuery() {
  var that;

  function $(query) {
    return window.document.querySelector(query);
  }

  function attachLinks(query, handler) {
    $(query).forEach(function(link) {
      links.addEventListener('click', function(e) {
        e.preventDefault();
        handler(e);
        return false;
      });
    });
  }

  function escapeRegExp(str) {
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
  }

  function removeClass(element, class) {
    var regex = new RegExp('(?:^|\\s)' + escapeRegExp(class) + '(?!\\S)', 'g');
    element.className = element.className.replace(regex, '');
  }

  that = $;
  that.query = $;
  that.attachLinks = attachLinks;
  that.removeClass = removeClass;
}
