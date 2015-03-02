(function() {

    database = new DatabaseModel()
    var private = {
        debug: window.debug || true,
        theme: null,
        page: null,
        template: null,
        contentElement: document.getElementById('main-content')
    };

    function displayPage(info) {
        console.log(info);
        private.page = info;
        private.contentElement.innerHTML = private.template.render({
            lang: getUrlParameter('lang'),
            info: info,
            _: getI18nMessage
        });
        attachLinks('a[data-info]', onLinkClicked);
        return info;
        //return prefetch(info);
    }
    
    function attachLinks(query, handler) {
        var links = document.querySelectorAll(query);
        for (var i = 0; i < links.length; i++) {
            links[i].addEventListener('click', handler);
        }
    }
    
    function onLinkClicked(e) {
        console.log(e);
        var info = JSON.parse(e.target.dataset.info);
        database.path.getDetails(info).then(displayPage);
        console.log(info);
        
        e.preventDefault();
        return false;
    }
    
    function onRefrenceClicked(e) {
        
    }

    function prefetch(info) {
        
        function clean(i) {
            if (!i) {
                return i;
            }
            delete i['content'];
            delete i['refrences'];
            if (i.children && i.heiarchy) {
                i.children = i.children.map(clean);
                i.heiarchy = i.heiarchy.map(clean);
                i.next = clean(i.next);
                i.previous = clean(i.previous);
                i.up = clean(i.up);
            }
            return i;
        }
        
        function mapDetails(array) {
            if (!array) {
                return Promise.resolve(array);
            }
            return Promise.all(array.map(function(e) {
                return database.path.getDetails(e).then(clean);
            }));

        }
        
        return Promise.all([
                            database.path.getDetails(info.previous).then(clean),
                            database.path.getDetails(info.next).then(clean),
                            mapDetails(info.children),
                            mapDetails(info.heiarchy)
                ]).then(function(e) {
                    info.previous = e[0];
                    info.next = e[1];
                    info.children = e[2];
                    info.heiarchy = e[3];
                    return info;
                });
    }

    function loadTheme(theme) {
        private.theme = theme;
        private.template = new EJS({
            text: private.theme.template
        });
    }

    function getUrlParameter(name) {
        return decodeURIComponent((new RegExp('[?|&]' + name + '=' +
                '([^&;]+?)(&|#|;|$)').exec(location.search) || [ , "" ])[1]
                .replace(/\+/g, '%20')) ||
                null
    }

    function getPathInfo() {
        return {
            query: getUrlParameter('q') || '/',
            lang: getUrlParameter('lang'),
            ref: getUrlParameter('ref')
        }
    }

    function getI18nMessage(name, params) {
        var message = chrome.i18n.getMessage(name, params);
        if (!message) {
            return name;
        }
        return message;
    }

    var pathInfo = getPathInfo();
    database.open().then(
            function() {
                return Promise.all([ pathInfo.lang ? database.language
                        .getByLdsCode(pathInfo.lang) : database.settings
                        .getLanguage().then(database.language.get),
                        database.settings.getAll() ]);
            }).then(
            function(e) {
                var language = e[0];
                var settings = e[1];
                return Promise.all([ database.path.get(language.id,
                        pathInfo.query).then(database.path.getDetails),
                        database.theme.get(settings.theme) ]);
            }).then(function(e) {
        loadTheme(e[1]);
        return displayPage(e[0]);
    });

    if (private.debug) {
        window.debug = private;
        window.database = database;
        private.displayPage = displayPage;
        private.getPathInfo = getPathInfo;
        window.log = function log(e) {
            console.log(e);
            return e;
        };
    }

    window.displayPage = displayPage;
})();
