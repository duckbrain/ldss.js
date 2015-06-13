function DownloadController(model, view) {
	var queue = [];

	function start() {
		view.subscribeDownloadCatalogRequested(downloadCatalog);
		view.subscribeDownloadBookRequested(downloadBook);

		//TODO: Check if downloads are needed.
	}

	function save() {

	}

	function load() {

	}

	function updateView() {
		view.setDownloadQueue(queue);
		view.setDownloadStatus(queue[0]);
	}

	function downloadBook(id) {
		return model.node.get(id).then(function (book) {
			if (!book || book.type != 'book') {
				throw new Exception('You must provide the ID of a book.')
			}

		});
	}

	function downloadCatalog(languageId) {

	}

	function downloadFinished() {
		queue.shift();
		if (0 < queue.length) {
			startNext();
		}
	}

	function startNext() {
		var info = queue[0];

	}

	this.start = start;
}
