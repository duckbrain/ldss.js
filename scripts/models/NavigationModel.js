function NavigationModel(database) {
  var that, render;

  that = {
    // set by load
    file: 'index.html',
    path: '/',
    verses: null,
    scrollTo: 0,
    languageCode: null,
    // set by navigate
    node: null,
    // set by initialize
    language: null,
    settings: null,
    getI18nMessage: function(v) {
      return v;
    }
  };
  render = new RenderModel(that);
  render.initialize();
  that.render = render;

  database.download.progress = function(message) {
    render(statusNode(message)).then();
  }

  function checkDownloads(node) {
    if (!node) {
      database.download.downloadCatalog(that.language.id).then(function() {
        return database.node.getPath(that.language.id, '/').then(navigate);
      });
      return statusNode('downloading catalog');
    } else if (node.type == 'book' && !node.details.downloadedVersion) {
      database.download.downloadBook(node.id).then(function() {
        return database.node.get(node.id).then(navigate);
      });
      return statusNode('downloading book');
    }
    return node;
  }

  /**
   * Resets the verses and scroll position in preperation to load a new page.
   */
  function resetNavigation(node) {
    that.node = node;
    that.path = node.path;
    that.verses = null;
    that.scrollTo = 0;
    return node;
  }

  /**
   * Loads an node by id and navigates to it
   * @param {integer} id node.id
   */
  function navigateId(id) {
    return database.node.get(id)
      .then(function(node) {
        if (!node) {
          // Just go back to the catalog if the node is not found, instead of redownloading the catalog.
          return database.node.getPath(that.language.id, '/');
        } else {
          return node;
        }
      })
      .then(checkDownloads)
      .then(resetNavigation)
      .then(navigate);
  }

  /**
   * Parses the path and verse elements of the supplied path and navigates to that node.
   * @param {string} path A path from a node's content. The path is not fully qualified.
   */
  function navigatePath(path) {
    loadPathnameAndVerses(path);
    return navigateLoaded()
      .then(resetNavigation);
  }

  /**
   * Navigates to a path that has been loaded through loadPath()
   */
  function navigateLoaded() {
    return database.node.getPath(that.language.id, that.path)
      .then(function(node) {
        if (!node && that.path.length > 1) {
          // Traverse up the path if it does not exist.
          var pathParts = that.path.split('/');
          pathParts.pop();
          that.path = pathParts.join('/');
          return navigateLoaded();
        } else {
          return Promise.resolve(checkDownloads(node)).then(navigate);
        }
      });
  }

  function navigate(node) {
    render.closeRefrencePanel();
    return render(node).then(function() {
      if (node.type != 'status') {
        history.pushState(node, node.name, getFullPath());
      }
      return node;
    });
  }

  function statusNode(status) {
    return {
      type: 'status',
      status: status
    };
  }

  function getFullPath() {
    var fullPath = that.verses ? [that.path].concat(that.verses).join('.') : that.path;
    var query = that.language ? '?lang=' + that.language.code_three : '';
    return that.file + '?' + fullPath + query;
  }

  function getUrlParameter(name, search) {
    search = (typeof search == 'string') ? search : location.search;
    return decodeURIComponent((new RegExp('[?|&]' + name + '=' +
          '([^&;]+?)(&|#|;|$)').exec(location.search) || [, ""])[1]
        .replace(/\+/g, '%20')) ||
      null
  }

  function loadPathnameAndVerses(path) {
    var parts = path.split('.');
    that.path = parts[0];
    that.verses = parts[1] || null;
    //TODO Parse verses and store them in an array.
  }

  function loadPath(href) {
    var path, query, hash, parts;

    parts = href.split('?');

    // Get file, path, and verses
    that.file = parts[0];
    loadPathnameAndVerses(parts[1] || '/');

    // Get the language code
    query = parts[2] || '';
    that.languageCode = getUrlParameter('lang', query);

    // Get the scrolled to verse
    hash = href.substring(href.lastIndexOf('#') + 1);
    href = parseInt(href);
    that.scrollTo = isNaN(href) ? null : href;

    console.log(that);
  }

  /**
   * Initializes everything dependant on the settings. Can be called after page load to update changes to the settings.
   * @return {Promise} A promise when the initialization is done. Just returns the NavigationModel.
   */
  function initialize() {
    return database.settings.getAll().then(function(settings) {
      var languageGetter;
      that.settings = settings;

      return Promise.all([
        (that.languageCode ? database.language.getByLdsCode(that.languageCode) : database.language.get(
          settings.language))
        .then(function(language) {
          that.language = language;
          that.languageCode = language.code_three;
        }),
        database.theme.get(settings.theme).then(function(theme) {
          return render.loadTheme(theme);
        })
      ]).then(function() {
        return that;
      });
    });
  }

  that.loadPath = loadPath;
  that.render = render;
  that.navigate = navigate;
  that.navigateId = navigateId;
  that.navigatePath = navigatePath;
  that.navigateLoaded = navigateLoaded;
  that.initialize = initialize;

  window.addEventListener('popstate', function() {
    //TODO: Handle errors
    render(history.state);
  });

  return that;
}
