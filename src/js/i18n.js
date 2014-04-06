if (!'lds' in window) lds = {};

lds.i18n = function(key)
{
    chrome.i18n.getMessage(key, 'es');
}

window.__ = lds.i18n;