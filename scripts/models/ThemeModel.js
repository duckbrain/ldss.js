function ThemeModel(database) {
    var that = this;
    var builtIn = [ {
        name: 'default',
        displayName: 'Default'
    },/* {
        name: 'midnight'
    } */];

    function reset() {
        return database.server.themes.clear().then(function() {
            return Promise.all(builtIn.map(function(template, index) {
                return getBuiltIn(index);
            }));
        }).then(function(themes) {
            return Promise.all(themes.map(function(theme) {
                return add(theme);
            }));
        });
    }

    function add(theme) {
        return database.server.themes.add(theme);
    }

    function destoy(themeId) {
        return database.server.themes['delete'](themeId);
    }

    function get(themeId) {
        return database.server.themes.get(themeId)
    }

    function update(theme) {
        return database.server.themes.update(theme);
    }

    function getBuiltIn(id) {

        // TODO: Less and EJS engines
        // links.js will be a default javascript file to bind the links
        // If libraries is declared, it can include it.

        var t = builtIn[id];
        var name = t.name;

        return Promise.all(
                [ database.downloader.download('themes/' + name + '/style.less'),
                        database.downloader.download('themes/' + name +
                                '/template.ejs'),
                        database.downloader
                                .download('themes/' + name + '/script.js') ]).then(
                function(e) {
                    return {
                        name: t.displayName || t.name,
                        builtIn: t.name, // this will be false for custom ones
                        style: e[0],
                        template: e[1],
                        script: e[2],
                        libraries: t.libraries ||
                                [ 'scripts/links.js' ],
                    };
                })

    }

    that.add = add;
    that['delete'] = destoy;
    that.get = get;
    that.reset = reset;
}

if (typeof module != 'undefined') {
    module.exports = ThemeModel;
}
