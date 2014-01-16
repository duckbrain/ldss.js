lds.BookmarkManager = function() {
    this.matchedBookmark = null;
    this.foundBookmarks = [];
};
lds.BookmarkManager.prototype = {
    reloadBookmarks: function() {
        if (!chrome || !('bookmarks' in chrome)) {
            // Use a local setting for bookmarks
        } else {
            chrome.bookmarks.search(location.href, function (results) {
                if (results.length == 1) {
                    // This is the bookmark
                    this.matchedBookmark = results[0];
                    this.foundBookmarks = results;
                } else if (results.length) {
                    // Could be any one of these
                    this.foundBookmarks = results;
                }
                console.debug(results);
            })
        }
    },
    save: function(url) {
        if (!this.matchedBookmark)
            ;
        else if (!this.foundBookmarks.length)
            chrome.bookmarks.create({})
        else ; // Ask user which one
    }
}