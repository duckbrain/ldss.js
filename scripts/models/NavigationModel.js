function NavigationModel(database) {
  var that = {
    path: '/',
    language_code: 'eng',
    verses: [],
    scrollTo: 0
  };

  /**
   * Takes a string from location.search or one similarly formatted and breaks it up into it's individual components.
   * It stores these values in the object.
   * A search string may look something like this: "/path/to/something/3.1.2-6.9?lang=eng#11"
   * @param  {string} href a url string formatted for the index page.
   */
  function load(href) {
    var query, hash;
    href = href.substring(href.indexOf('?') + 1);
    query = href.substring(href.indexOf('?') + 1);
    hash = query.substring(query.lastIndexOf('#') + 1);

  }

  function render() {

  }

  function navigate() {

  }

  that.load = load;
  that.render = render;
  that.navigate = navigate;

  return that;
}
