// This class creates an instance of the DB class to work with the indexedDB .
// It brings together the LDSDB class and the data model.
// Dependencies: db.js ldsdb.js datamodel.js options_model.js
lds.Catalog = function() {
	var self = this;
	self.db = new lds.LDSDB();
	self.downloadQueue = [];
	self.localURL = 'request.php?';
	
	if (location.protocol == "chrome-extension:")
		self.requestURL = 'http://tech.lds.org/glweb?format=json&';
	else
		self.requestURL = self.localURL;
	
	self.updateLanguages = function(callback) {
		$.getJSON(self.requestURL + 'action=languages.query', function(data) {
			var langs = [];
			for (var i = 0; i < data.count; i++) {
				var l = data.languages[i];
				langs.push({
					code: l.code,
					code_three: l.code_three,
					eng_name: l.eng_name,
					id: l.id,
					name: l.name
				});
			}
			var current = lds.dm.get('language_current');
			lds.dm.set('languages', langs);
			lds.dm.set('language_current', current);
			if (callback) callback();
		});
	};
	
	self.updateCatalog = function() {
		var langid = lds.dm.get('language_current');
		
		$.getJSON(self.requestURL + 'action=catalog.query&platformid=10&languageid=' + langid, function(data) {
			console.log(data.catalog);
			//TODO: Set the catalog data to something internally standard
			self.db.catalogInfo = data.catalog;
			self.db.populateCatalog();
		});
	};
	
	self.downloadBook = function() {
		var q = self.downloadQueue;
		var book;
		
		for (var i in q)
			if (!q[i].state) {
				book = q[i];
				index = i;
				book.status = 'downloading';
				book.state = 1;
			}
		
		if (!book) return;
		
		if (self.requestURL == self.localURL)
			book.url = self.requestURL + 'url=' + book.url;
		
		$.getJSON(book.url, function(data) {
			
			book.status = 'importing';
			book.state = 2;
			
			data.url = book.url;
			console.log(data);
			
			self.db.onrequestcomplete = function() {
						
				book.status = 'done';
				book.state = 3;
				q.splice(q.indexOf(book), 1);
				book.callback(book);
				if (q.length > 0)
					self.downloadBook();
			};
			
			data.id = book.id;
			
			self.db.bookContent = data;
			self.db.populateBook();
		});
	};
};

lds.catalog = new lds.Catalog();
lds.db = lds.catalog.db;
