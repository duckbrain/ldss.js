function DomView() {
	var that = this;
	var filename, theme;
	var invokeNodeChangedWithPath, invokeNodeChangedWithId, invokeOptionsChanged, invokeLanguageChanged;
	var currentState = {
		node: null,
		scrollPosition: 0,
		referencePosition: null,
		message: {
			spinning: false,
			message: "loading"
		},
		focusedVerses: [1, 2, 4],
		annotations: []
	}

	that.init = function init() {
		var pathData = new PathParser().parse(location.href);
		invokeLanguageChanged(pathData.languageCode);
		invokeNodeChangedWithPath(pathData.path);

		$(onDocumentLoad);
	}

	function onDocumentLoad() {
		addPanelHandler('languages');
		addPanelHandler('options');
		addPanelHandler('downloads');
		$('.button-previous, .button-next, .button-up').click(onNodeWithIdClick);
	}

	function addPanelHandler(name) {
		var className = 'toolbar-panel-open';
		var panel = $('.panel-' + name);
		var button = $('.button-' + name);
		button.click(function () {
			closePanels('.panel-' + name);
			panel.toggleClass(className);
			button.toggleClass('button-pressed', panel.hasClass(className));
		});
	}

	function closePanels(exception) {
		$('.toolbar-panel-open:not(' + exception + ')').removeClass('toolbar-panel-open');
		$('.toolbar-panel-button').removeClass('button-pressed');
	}

	function makeClassToggle(element, className, setValue) {
		element = $(element);
		return function () {
			element.toggleClass(className, setValue);
		};
	}

	that.setOptions = function setOptions(o) {
		//TODO: Set view on options
	}

	that.setLanguage = function setLanguage(language) {
		$('.panel-languages .button.selected').removeClass('selected');
		if (language) {
			$('.panel-languages .button[data-code=' + language.code_three + ']').addClass('selected');
		}
	}

	that.setLanguages = function setLanguages(languages, displayEnglishNames) {
		var panel = $('.panel-languages');

		panel.empty();

		languages.forEach(function (language) {
			var displayName = language.name;
			if (displayEnglishNames && language.name != language.eng_name && language.name.indexOf('(') == -1) {
				displayName += ' (' + language.eng_name + ')'
			}

			panel.append('<a class="button" data-code="' + language.code_three + '">' + displayName + '</a>')
		});

		panel.find('.button').click(onLanguageClick);
	}

	function onLanguageClick(e) {
		var code = $(e.target).data('code');
		invokeLanguageChanged(code);
		closePanels();
	}

	that.setTheme = function setTheme(theme) {
		if (theme.css) {
			document.getElementById('custom-css').innerHTML = theme.css;
		}
	}

	function scrollToVerse(number) {}

	function setNodeLink(element, node) {
		if (node) {
			$(element).attr('disabled', false).data('id', node.id);
		} else {
			$(element).attr('disabled', true).data('id', '');
		}
	}

	that.setNode = function setNode(node) {
		window.node = node;

		var childrenElement =  $('.content-children').empty();
		var heiarchyElement = $('.toolbar-heiarchy').empty();

		if (node) {
			setNodeLink('.button-previous', node.previous);
			setNodeLink('.button-next', node.next);
			setNodeLink('.button-up', node.parent);
			$('.content-body').html(node.details && node.details.content || '');
			childrenElement.empty();
			node.children.forEach(function(child) {
				var content = '', downloaded = true;
				if (child.type == 'node' && child.details.content) {
					var length = 400;
					content = child.details.content;
					content = content.replace(/\<h1.+\<\/h1\>/ig, ''); // Remove h1
					content = content.replace(/class="titleNumber"\>.*[0-9]+\<\/p\>/ig, '></p>'); // Remove Chapter number
					content = content.replace(/(<([^>]+)>)/ig, ''); // Remove all HTML tags
					content = content.length > length ? content.substring(0, length) : content;
					content = '<p>' + content + '</p>';
				} else if (child.details && child.details.image) {
					content = '<img src="'+ child.details.image + '" />';
				}
				if (child.type == 'book') {
					downloaded = !!child.details.downloadedVersion;
				}

				childrenElement.append('<a class="button content-child '
						+ (downloaded ? 'downloaded' : 'not-downloaded') + '" '
					+ 'data-type="' + child.type + '" '
					+ 'data-id="' + child.id + '" '
					+ 'data-downloaded="' + downloaded + '">'
						+ '<i class="icon icon-' + child.type + '"></i>'
						+ '<h3 class="content-child-name">' + child.name + '</h3>'
						+ content
					+ '</a>');
			});
			childrenElement.find('.content-child').click(onNodeWithIdClick);

			node.heiarchy.forEach(function(ancestor) {
				heiarchyElement.append('<a class="button toolbar-button"'
					+ 'data-id="' + ancestor.id + '">'
						+ '<i class="icon icon-' + ancestor.type + '"></i>'
						+ '<span class="label">' + ancestor.name + '</span>'
					+ '</a>');
			});
			heiarchyElement.find('.button').click(onNodeWithIdClick);
		} else {
			setNodeLink('.button-previous, .button-next, .button-up', null);
			$('.content-body').html('');
		}
	}

	this.setDownloads = function setDownloads(queue) {
		var element = $('.panel-downloads').empty();
		queue.forEach(function(download) {
			element.append('<div>' + download.title + '</div>')
		})
	}

	this.setMessage = function setMessage(message) {
		console.log(message);
	}

	function onNodeWithIdClick(e) {
		var id = parseInt($(e.currentTarget).data('id'));
		invokeNodeChangedWithId(id);
	}

	function setScroll(position) {

	}

	that.subscribeNodeChangeWithPath = function subscribeNodeChangeWithPath(callback) {
		invokeNodeChangedWithPath = callback;
	}

	that.subscribeNodeChangeWithId = function subscribeNodeChangeWithId(callback) {
		invokeNodeChangedWithId = callback;
	}

	that.subscribeOptionsChange = function subscribeOptionsChange(callback) {
		invokeOptionsChanged = callback;
	}

	that.subscribeLanguageChange = function subscribeLanguageChange(callback) {
		invokeLanguageChanged = callback;
	}
}
