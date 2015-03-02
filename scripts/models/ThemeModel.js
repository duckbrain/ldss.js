function ThemeModel(database) {
    var that = this;
    var builtIn = {
        'default': {
            name: 'default',
            displayName: 'Default'
        },
        'midnight': {
            name: 'midnight'
        }
    };

    function reset() {
        return database.server.themes.clear();
    }

    function add(theme) {
        theme.builtIn = false;
        return database.server.themes.add(theme);
    }

    function destoy(themeId) {
        return database.server.themes['delete'](themeId);
    }

    function get(themeId) {
        if (Number.isNaN(parseInt(themeId))) {
            return getBuiltIn(themeId);
        } else {
            return database.server.themes.get(themeId) 
        }
    }

    function getAll() {
        return Promise.all(
                [ database.server.themes.query().all().execute(),
                        getAllBuiltIn() ]).then(function(e) {
            return e[1].concat(e[0]);
        });
    }

    function update(theme) {
        return database.server.themes.update(theme);
    }

    function getBuiltIn(name) {
        var t = builtIn[name];
        return Promise.all(
                [ database.downloader
                        .download('themes/' + name + '/style.less'),
                        database.downloader.download('themes/' + name +
                                '/template.ejs'),
                        database.downloader.download('themes/' + name +
                                '/script.js') ]).then(function(e) {
            return {
                id: t.name,
                name: t.displayName || t.name,
                builtIn: true, // this will be false for custom ones
                style: e[0],
                template: e[1],
                script: e[2],
                libraries: t.libraries || [ 'scripts/links.js' ],
            };
        })

    }

    function getAllBuiltIn() {
        var transactions = [ ];
        for ( var name in builtIn) {
            if (builtIn.hasOwnProperty(name)) {
                transactions.push(getBuiltIn(name));
            }
        }
        return Promise.all(transactions);
    }

    that.add = add;
    that['delete'] = destoy;
    that.get = get;
    that.reset = reset;
    that.getAll = getAll;
}

if (typeof module != 'undefined') {
    module.exports = ThemeModel;
}
