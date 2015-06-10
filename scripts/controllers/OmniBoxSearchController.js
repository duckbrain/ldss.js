/**
 * Hooks into Chrome's omnibox API and uses a SearchModel to return results
 * Documentation for the API is at https://developer.chrome.com/extensions/omnibox#event-onInputStarted
 * For reference, https://github.com/Duckbrain/lds-scriptures/commit/0f6b9b65f23485c7b54392829b9db5ffc3970391#diff-78
 * @param {SearchModel} model
 */
function OmniBoxSearchController(database) {
	var that = this,
		model, searchText;

	function setSugestion(suggestions) {
		var suggestion = suggestions[0];
		if (suggestion && suggestion.path == searchText) {
			console.log(suggestion);
			chrome.omnibox.setDefaultSuggestion({ description: suggestions[0].description });
		}
		return suggestions;
	}

	function onInputChanged(text, suggest) {
		model.recommend(text).then(suggest);
	}

	function onInputEntered(text, disposition) {
		searchText = text.toLowerCase()
		model.search(text).then(function (node) {
			console.log('searched for ', node);
			//TODO: Open a new tab
		});
	}

	function init(languageId) {
		model = new SearchModel(database, languageId);
		chrome.omnibox.onInputChanged.addListener(onInputChanged);
		chrome.omnibox.onInputEntered.addListener(onInputEntered);
	}

	that.init = init;
}