(function () {
	//var model, view, controller;
	model = new DatabaseModel();
	model.contentProvider = new LocalContentProvider(model);
	view = new DomView();
	view.getI18nMessage = function getI18nMessage(name, params) {
		return name;
	}
	controller = new ReadController(model, view);
	controller.start().then();
})();
