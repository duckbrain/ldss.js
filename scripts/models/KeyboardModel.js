function KeyboardModel(database) {
	var that = this;
	that.selectedNumber = 0;

	var profiles = {
		classic: {
			nextVerse: 110,
			previousVerse: 98,
			nextChapter: 122,
			previousChapter: 97,
			upLevel: 113,
			bookmark: 117,
			search: 115,
			autoscroll: 120
		},
		standard: {
			nextVerse: 74,
			previousVerse: 98,
			nextChapter: 122,
			previousChapter: 97,
			upLevel: 113,
			bookmark: 117,
			search: 115,
			autoscroll: 120
		},
	}

	function init() {
		return database.settings.get('keyboard').then(function (profile) {
			that.profile = profile;
		});
	}

	function onKeyPress(code) {

		if (that.profile.nextVerse == code && that.selectedNumber < that.maxNumber) {
			that.actions.numberChanged(++that.selectedNumber);
			return;
		}
		if (that.profile.previousVerse == code && that.selectedNumber > that.minNumber) {
			that.actions.numberChanged(--that.selectedNumber);
			return;
		}

		for (var action in that.profile) {
			if (that.profile[action] === code) {
				that.actions[action]();
				return;
			}
		}

		if (code >= 48 && code <= 57) {
			onNumberPress(code - 48);
			return;
		}

		if (code == 13 && that.selectedNumber > that.minNumber) {
			that.actions.numberAccepted(that.selectedNumber);
		}

		console.log('keycode: ', code);
	}

	function onNumberPress(num) {
		that.selectedNumber = that.selectedNumber * 10 + num;
		while (that.selectedNumber > that.maxNumber) {
			var t = that.selectedNumber + '';
			t = t.substring(1);
			that.selectedNumber = parseInt(t);
		}
		if (isNaN(that.selectedNumber)) {
			that.selectedNumber = 0;
		}
		console.log('num: ', that.selectedNumber);
		that.actions.numberChanged(that.selectedNumber);
	}

	function getProfiles() {
		return Object.getOwnPropertyNames(profiles);
	}

	function getProfileDescription(name) {
		return profiles[name];
	}

	function setMaxNumber(max) {
		maxNumber = max;
		digitCount = max.toString().length;
	}

	that.actions = {
		nextVerse: function () {},
		previousVerse: function () {},
		nextChapter: function () {},
		previousChapter: function () {},
		upLevel: function () {},
		bookmark: function () {},
		search: function () {},
		autoscroll: function () {},
		numberChanged: function (number) {},
		numberAccepted: function (number) {}
	};
	that.maxNumber = 0;
	that.minNumber = 0;
	that.getProfiles = getProfiles;
	that.getProfileDescription = getProfileDescription;
	that.onKeyPress = onKeyPress;
	that.init = init;
	that.load = init;
}

if (typeof module != 'undefined') {
	module.exports = KeyboardModel;
}