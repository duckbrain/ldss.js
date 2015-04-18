function KeyboardController(database, render) {
	var that = this;
	var $ = new dQuery();
	var model = database.keyboard;

	function listen(document) {
		document.addEventListener('keydown', function (e) {
			var code = e.keyCode;
			model.onKeyPress(e.keyCode);
		});
	}

	function makeOnLinkClick(element) {
		return function () {
			$.fireEvent(element, 'click');
		}
	}

	model.actions = {
		nextVerse: function () {},
		previousVerse: function () {},
		nextChapter: makeOnLinkClick('.next'),
		previousChapter: makeOnLinkClick('.previous'),
		upLevel: makeOnLinkClick('.up-level'),
		bookmark: function () {},
		search: function () {},
		autoscroll: function () {},
		numberChanged: function (number) {
			render.scrollTo($.id(number));
			render.highlightVerses([number]);
			$.addClass('.children>*:nth-child(' + number + ')', 'selected');
		},
		numberAccepted: function (number) {
			render.onPageLinkClicked({
				target: $('.children>*:nth-child(' + number + ') a')
			});
		}
	};

	that.listen = listen;
}