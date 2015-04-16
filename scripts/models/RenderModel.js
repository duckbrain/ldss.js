function RenderModel(navigation) {
  var that, template, $, elements, openedReference, onStateChanged;
  $ = new dQuery();
  elements = null;
  openedReference = null;
  onStateChanged = new EventHandler();
  onStateChanged.getParam = getState;

  function initialize() {
    elements = {
      window: window,
      document: window.document,
      body: window.document.body,
      customCSS: $('#custom-css'),
      bookCss: $('#book-css'),
      content: $('#main-content')
    }
    elements.body.addEventListener('scroll', onStateChanged.fire);
  }

  function updateElements() {
    elements.references = $('.references');
  }


  function getState() {
    return {
      openedReference: openedReference,
      scrollPosition: elements.body.scrollTop
    };
  }

  function restoreState(state) {
    openReference(state.openedReference);
    elements.body.scrollTop = state.scrollPosition;
  }

  function resetState() {
    closeReferencePanel();
  }

  function onPageLinkClicked(e) {
    var id = e.target.dataset.id;
    navigation.navigateId(parseInt(id));
    //TODO Handle all different types of links for navigation and footnotes.
  }

  function onContentLinkClicked(e) {
    var path = e.target.pathname;

    if (e.target.tagName != 'A') {
      return;
    }

    if (path.indexOf('/f_') == 0) {
      openReference(path.substring(1));
    } else {
      navigation.navigatePath(path);
    }
  }

  function onReferenceClosedClicked(e) {
    e.stopPropagation();
    e.cancelBubble = true
    closeReferencePanel();
  }

  function onLanguageSelected(e) {
    var id = parseInt(e.target.value);
    return database.language.get(id)
      .then(function(language) {
        navigation.language = language;
        return render(navigation.node);
      });
  }

  function openReference(reference) {
    var referenceElement;

    if (!reference) {
      openedReference = null;
      $.removeClass(elements.body, 'references-open');
    } else {
      openedReference = reference;
      referenceElement = $.id(reference);
      $.queryAll('.references .selected', function(ele) {
        $.removeClass(ele, 'selected');
      });
      $.addClass(elements.body, 'references-open');
      $.addClass(referenceElement, 'selected');
      elements.references.scrollTop = referenceElement.offsetTop;
    }
    onStateChanged.fire();
  }

  function closeReferencePanel() {
    openReference(null);
  }

  function highlightVerses(verses) {
    for (var i = 0; i < verses.length; i++) {
      $.addClass($.id(verses[i]), 'selected');
    }
  }

  function render(node) {

    elements.bookCss.innerHTML = navigation.book ? navigation.book.details.css : '';

    elements.document.title = navigation.getI18nMessage('app_title') + ' - ' + node.name;
    elements.content.innerHTML = template.render({
      page: {
        settings: navigation.settings,
        node: node,
        languages: navigation.languages,
        generator: new HtmlGenerator(navigation, navigation.getI18nMessage),
        loading: navigation.getI18nMessage(node.status)
      },
      _: navigation.getI18nMessage
    });
    updateElements();
    $.attachLinks('.references-close', onReferenceClosedClicked);
    $.attachLinks('#main-content a[data-id]', onPageLinkClicked);
    $.attachLinks('.content a[href], .references a[href]:not(.references-close)', onContentLinkClicked);

    highlightVerses(navigation.versesParsed);
    if (navigation.versesParsed[0]) {
      var element = $.id(navigation.versesParsed[0]);
      elements.body.scrollTop = element.offsetTop - elements.window.outerHeight / 2 + element.clientHeight;
    } else {
      elements.body.scrollTop = 0;
    }

    return Promise.resolve(node);
  }

  function loadTheme(theme) {
    template = new EJS({
      text: theme.template
    });
    return less.render(theme.style, {
      globalVars: navigation.settings.themeOptions
    }).then(function(output) {
      elements.customCSS.innerHTML = output.css;
    });
  }

  that = render;
  that.loadTheme = loadTheme;
  that.initialize = initialize;
  that.getState = getState;
  that.restoreState = restoreState;
  that.resetState = resetState;
  that.onStateChanged = onStateChanged;

  return that;
}
