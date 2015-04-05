(function() {

  database = new DatabaseModel();
  database.download = new DatabaseQuery().download;

  if (!String.prototype.endsWith) {
    String.prototype.endsWith = function(searchString, position) {
      var subjectString = this.toString();
      if (position === undefined || position > subjectString.length) {
        position = subjectString.length;
      }
      position -= searchString.length;
      var lastIndex = subjectString.indexOf(searchString, position);
      return lastIndex !== -1 && lastIndex === position;
    };
  }

  var private = {
    debug: window.debug || true,
    // An object that contains all of the information, outside the database and
    // the theme, on how to display the page
    configuration: null,
    // An interchangable theme that will generate the final HTML and provides
    // CSS and JavaScript to help the page
    theme: null,
    // The database object of the path to display
    page: null,
    // An EJS template from the theme to generate the HTML with.
    template: null,
    historyCaused: false,
    elements: {
      body: document.body,
      content: document.getElementById('main-content'),
      refrences: null
    }
  };
  window.private = private;

  function displayPage(info) {
    if (!private.historyCaused) {
      if (info) {
        history.pushState(info, info.name, "index.html?" + info.path);
      }
    }
    var conf = private.configuration;
    var ele = private.elements;

    console.log(info);
    private.page = info;
    ele.content.innerHTML = private.template.render({
      page: {
        configuration: conf,
        path: info,
        getI18nMessage: getI18nMessage,
        languages: private.languages,
        generator: new HtmlGenerator(conf, getI18nMessage)
      }
    });
    attachLinks('a[data-path]', onLinkClicked);
    attachLinks('.content a[href]', onRefrenceClicked);
    attachLinks('.refrences-close', onRefrenceClosedClicked);
    attachLinks('.refrences a[href]', onFootnoteClicked);
    ele.refrences = document.querySelector('.refrences')

    return info;
  }

  function attachLinks(query, handler) {
    var links = document.querySelectorAll(query);
    for (var i = 0; i < links.length; i++) {
      links[i].addEventListener('click', function(e) {
        e.preventDefault();
        handler(e);
        return false;
      });
    }
  }

  function onLinkClicked(e) {
    var id = parseInt(e.target.dataset.path);
    database.path.get(id).then(displayPage);
  }

  function onRefrenceClicked(e) {
    var body = document.body;
    var refrence = e.target.hash.substring(1);
    var priorRefrences = document.querySelectorAll('.refrences .selected');
    var refrenceDiv = document.getElementById(refrence);
    if (!body.className.match(/(?:^|\s)refrences-open(?!\S)/g)) {
      body.className += ' refrences-open';
    }
    refrenceDiv.className = 'selected';
    for (var i = 0; i < priorRefrences.length; i++) {
      priorRefrences[i].className = '';
    }
    private.elements.refrences.scrollTop = refrenceDiv.offsetTop;
  }

  function onFootnoteClicked(e) {
    getConfiguration(e.target.pathname).then(function(conf) {
      return database.path.getPath(conf.language, conf.path).then(displayPage);
    });
  }

  function onRefrenceClosedClicked(e) {
    var body = document.body;
    body.className = body.className.replace(/(?:^|\s)refrences-open(?!\S)/g, '');
  }

  function onLanguageSelected(e) {

  }

  function loadTheme(theme) {
    console.log("Theme: ", theme)
    private.theme = theme;
    private.template = new EJS({
      text: private.theme.template
    });
    less.render(theme.style, {
      globalVars: private.configuration
    }).then(function(output) {
      document.getElementById('custom-css').innerHTML = output.css;
    });
  }

  function getUrlParameter(name, search) {
    search = (typeof search == 'string') ? search : location.search;
    return decodeURIComponent((new RegExp('[?|&]' + name + '=' +
          '([^&;]+?)(&|#|;|$)').exec(location.search) || [, ""])[1]
        .replace(/\+/g, '%20')) ||
      null
  }

  window.addEventListener('popstate', function() {
    private.historyCaused = true;
    displayPage(history.state);
    private.historyCaused = false;
  });

  function getI18nMessage(name, params) {
    var message = chrome.i18n.getMessage(name, params);
    if (!message) {
      return name;
    }
    return message;
  }

  function getConfiguration(search) {
    search = (typeof search == 'string') ? search : location.search.substring(1);
    var param = getUrlParameter;
    return Promise.all([database.settings.getAll(),
        database.language.getAll()
      ])
      .then(function(e) {
        var path, conf;

        conf = e[0];
        if (search.lastIndexOf('?') != -1) {
          path = search.substring(0, search.lastIndexOf('?')).split('.');
          search = search.substring(search.lastIndexOf('?'))
        } else {
          path = search.split('.');
          search = '';
        }
        conf.path = path[0];
        conf.verses = path;
        conf.verses.shift(1);
        conf.language = parseInt(param('lang', search)) || conf.language;
        //if (conf.path.indexOf('/', conf.path.length - 1) !== -1) {
        //  conf.path = conf.path.substring(0, conf.path.length - 1);
        //}
        //conf.reference = param('ref') || null;
        //TODO: Parse the refrences

        private.configuration = conf;
        private.languages = e[1];
        return conf;
      });
  }

  function startPage() {
    return database.open()
      .then(getConfiguration)
      .then(function(conf) {
        return Promise.all([
          database.path.getPath(conf.language, conf.path),
          database.theme.get(conf.theme)
        ]);
      }).then(function(e) {
        var lang = private.configuration.language;
        // TODO: Verify the theme loaded correctly, then default to "default"
        loadTheme(e[1]);

        var path = e[0];
        if (!path) {
          return database.path.getPath(lang, '/').then(function(catalogRoot) {
            if (!catalogRoot) {
              //The catalog has not been downloaded. Lets do it.
              return database.download.downloadCatalog(lang).then(startPage);
            } else {
              //TODO: A book probably neeeds to be downloaded. Tell the user
              alert("It looks like your book is not downloaded. We'll take to you the catalog to sort things out.");
              
            }
          });
        } else {
          return displayPage(e[0]);
        }
      });
  }

  startPage();

  if (private.debug) {
    window.debug = private;
    window.database = database;
    window.log = function log(e) {
      console.log(e);
      return e;
    };
  }
})();
