/*
 * This script is intended to allow scripts to be used as Node.js modules and browser-side JavaScript includes.
 */


window.require = function require(path) {
    for(var name in window) {
        var index = path.indexOf(name + '.js');
        if (index > -1 && index == path.length - name.length - 3) {
            return window[name];
        }
    }
}

module = { exports: {} }