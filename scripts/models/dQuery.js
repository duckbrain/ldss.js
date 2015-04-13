function dQuery() {
  var that;
  var document = window.document;

  function $(query) {
    return document.querySelector(query);
  }

  function $a(query, callback) {
    var results = document.querySelectorAll(query);
    if (callback) {
      for (var i = 0; i < results.length; i++) {
        callback(results[i], i);
      }
    }
    return results;
  }

  function id(id) {
    return document.getElementById(id);
  }

  function attachLinks(query, handler) {
    $a(query, function(link) {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        handler(e);
        return false;
      });
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

  that = $;
  that.query = $;
  that.queryAll = $a;
  that.id = id;
  that.attachLinks = attachLinks;
  that.addClass = addClass;
  that.removeClass = removeClass;
  return that;
}
