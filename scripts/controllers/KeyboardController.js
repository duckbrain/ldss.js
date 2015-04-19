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
			render.onPageLinkClicked({
				target: $(element)
			});
		}
	}

	model.actions = {
		nextVerse: function () {},
		previousVerse: function () {},
		nextChapter: makeOnLinkClick('.next a'),
		previousChapter: makeOnLinkClick('.previous a'),
		upLevel: makeOnLinkClick('.up-level a'),
		bookmark: function () {},
		search: function () {},
		autoscroll: function () {},
		numberChanged: function (number) {
			number -= model.minNumber;

			var element = $.id(number) || $('.children>*:nth-child(' + number + ')');

			render.scrollTo(element);
			render.highlightVerses([number]);
			$.addClass(element, 'selected');
		},
		numberAccepted: function (number) {
			number -= model.minNumber;
			render.onPageLinkClicked({
				target: $('.children>*:nth-child(' + number + ') a')
			});
		}
	};

	that.listen = listen;
}