function KeyboardController(database) {
	var $ = new dQuery();
	var that = this;

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
		default: {

		},
		vim: {

		}
	}

	function initialize() {
		return get().then(function (profile) {
			that.profile = profile;
		});
	}

	function listen(document) {
		$(document, 'keydown', function (e) {
			for (var action in that.profile) {
				if (that.profile[action] === e.keyCode) {
					that.actions[action]();
					return;
				}
			}
		});
	}


	function get() {
		return database.settings.get('keyboard');
	}

	function set(profile) {
		that.profile = profile;
		return database.settings.set('keyboard', profile);
	}

	function getProfiles() {
		return Object.getOwnPropertyNames(profiles);
	}

	function setProfile(profile) {
		set(profiles[profile]);
	}


	that.actions = {};
	that.maxVerses;
	that.verseString = '';
}

if (typeof module != 'undefined') {
	module.exports = KeyboardModel;
}
