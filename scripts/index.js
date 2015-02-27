(function() {
    
    database = new DatabaseModel()
    var private = {
    	debug: window.debug || true,
        theme: null,
        page: null,
        template: null,
	contentElement: document.getElementById('content')
    };

    function displayPage(info) {
        private.page = info;
        private.contentElement.innerHTML = private.template.render({
            info: info
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
            query: getUrlParameter('q'),
            lang: getUrlParameter('lang'),
            ref: getUrlParameter('ref')
        }
    }

    var pathInfo = getPathInfo();
    database.open().then(
            function() {
                return pathInfo.lang ? database.language
                        .getByLdsCode(pathInfo.lang) : database.settings
                        .getLanguage().then(database.language.get)
            }).then(function(language) {
                return Promise.all([database.path.get(language.id, pathInfo.query).then(database.path.getDetails),
                                    database.theme.get(2)]);
    }).then(function(e) {
        loadTheme(e[1]);
        displayPage(e[0]);
    });

    if (debug) {
	window.debug = private;
        window.database = database;
        private.displayPage = displayPage;
        private.getPathInfo = getPathInfo;
        window.log = function log(e) {
            console.log(e);
            return e;
        };
    }
})();
