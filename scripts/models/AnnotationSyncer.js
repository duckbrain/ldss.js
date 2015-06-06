function AnnotationModel(database) {
	var that = this;

	var getFilteredOptions = {
		lang: "eng",
		clang: "eng",
		guid: "all",
		type: "journal%2Creference",
		tag: "",
		start: "",
		facets: "",
		searchPhrase: "",
		searchFields: "",
		before: "",
		since: "",
		numberToReturn: "1000"
	}
	var annotationExample = {
		"id": "7b21e68a-da5c-4e7d-8d21-96e6bf17cca2",
		"uri": "/scriptures/bofm/alma/37",
		"paras": [{
			"uri": "/scriptures/bofm/alma/37.37",
			"style": "hl-u-red",
			"offsetStart": 7,
			"offsetEnd": 7
		}],
		"note": "Little things, safety",
		"source": "Android Gospel Library | App: 2.5.0.24 | OS: 18",
		"device": "android",
		"type": "Highlight",
		"typeKey": "highlight",
		"lastUpdated": "1970/01/01",
		"modified": "1970/01/01",
		"modifiedInMilliseconds": "8.7209768E7",
		"fulldate": "1/1/1970",
		"highlightText": "all",
		"highlightClass": "hl-u-red",
		"targetTitle": "Alma 37:37",
		"targetAuthor": null,
		"targetCitation": "Book of Mormon, Alma 37:37"
	}

	function login(username, password) {

	}

	function formatFromWeb(webAnnotation) {
		
	}

	function getRemote() {
		var uri = 'https://www.lds.org/study-tools/ajax/highlight/getFiltered?guid=all';
		database.downloader.download(uri).then(function (data) {
			return data.response.annotations;
		});
	}

	function overwriteLocalWithRemote(remote) {
		var db = database.server.annotations;

		return db.clear().then(function() {
			db.add(remote);
		});
	}

	function sync(local, remote) {

	}

}

if (typeof module != 'undefined') {
	module.exports = AnnotationModel;
}
