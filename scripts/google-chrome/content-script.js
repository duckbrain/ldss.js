// This is a Chrome content script. It is not run with the permissions
// of the extension. To do anything, it must tell the background page to
// do it.
// This page will insert an extra item to the tools on the Chruch
// website's scriptures. This item will take you directly to that
// scripture in the app. A similar button will take you from the app's
// hiding toolbar to the chruch web site. This will allow tight
// integration with the Church website scriptures.

(function() {
  console.log("Jonathan Duck's LDS Scriptures Content-Script started...");

  var database = new DatabaseQuery();
  var path = location.pathname;
  var href = chrome.extension.getURL("index.html") + '?' + path;
  var lang = null; //TODO: Get the lang from the get parameter

  function insertLink(allow) {
    if (!allow) {
      return;
    }

    var image = chrome.extension.getURL("img/icon_16.png");
    var tools = document.getElementById('secondary');
    if (tools == null)
      return;
    tools = tools.getElementsByClassName('tools')[0];
    if (tools == null)
      return;
    var newItem = document.createElement('li');
    var newLink = document.createElement('a');
    newLink.innerText = "LDS Scriptures";
    newLink.classList.add('gallery');
    newLink.classList.add('chrome-app-icon');
    newLink.href = href;
    newLink.onclick = function() {
      database.node.open(lang, href).then();
      return false;
    }
    newItem.appendChild(newLink);
    tools.appendChild(newItem);
  }

  database.node.exists(lang, path).then(insertLink);

})();
