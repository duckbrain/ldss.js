(function () {
	//var model, view, controller;
	model = new DatabaseQuery(new ChromeMessageProvider());
	view = new DomView();
	view.getI18nMessage = new ChromeI18nModel().getMessage;
	controller = new ReadController(model, view);

	controller.start();

})();

function log(debug) {
	console.log(debug);
	return debug;
}
