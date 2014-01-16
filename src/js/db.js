if (typeof(lds) != 'object') var lds = {};
// This class provides access to the IndexedDB. It handles all the tables 
// that exists and provides methods to interact with them.
lds.DB = function(name, version, objectStores) {
	this.db = null;
	this.dbName = name;
	this.dbVersion = version; 

	// Defines the objectStores used in the indexedDB. If one has an 
	// updateDelete property of true, on a version update it will be deleted
	// and recreated, rather than just added if not there. Used if modified.
	this.objectStores = objectStores;
};
lds.DB.prototype = {
	onerrorData: function(info) {
		return function (e) {
			info.error = e;
			console.error(info);
		}
	},
	onerror: function(e) {
		console.error(e);
	},
	onopen: function() {},
	open: function() {
		var request = indexedDB.open(this.dbName, this.dbVersion);
		var self = this;
		
		if (this.db != null) {
			self.onopen();
			return;
		}
		
		request.onupgradeneeded = function(e) {
			var db = e.target.result;
			self.db = db;
			// Delete any old ones
			for (var i in db.objectStoreNames) {
				if (!db.objectStoreNames[i] in self.objectStores)
					db.deleteObjectStore(os);;
			}
			// Add new object stores
			for (var os in self.objectStores) {
				var store = self.objectStores[os];
				var dbstore;
				if (store.updateDelete) {
					delete store.updateDelete;
					if (db.objectStoreNames.contains(os))
						db.deleteObjectStore(os);
					dbstore = db.createObjectStore(os, store);
				} else {
					if (!db.objectStoreNames.contains(os))
						dbstore = db.createObjectStore(os, store);
				}
				if (typeof(store.index) == 'object') {
					for (var name in store.index) {
						dbstore.createIndex(name, store.index[name]);
					}
				}
			}
		};
		request.onsuccess = function(e) {
			self.db = e.target.result;
			self.onopen();
		}
		request.onerror = this.onerrorData({ name: this.dbName, version: this.dbVersion });
	},
	populateObject: function(object, storeName) {
		
	}
}
	
// Some cross-browser checking for future ports
window.indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB;
if ('webkitIndexedDB' in window) {
	window.IDBTransaction = window.webkitIDBTransaction;
	window.IDBKeyRange = window.webkitIDBKeyRange;
}