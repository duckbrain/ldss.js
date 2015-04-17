// This is a node.js script to download all of the content for a given language (passed by id) and store them in a
// directory structure for use offline. Useful for debugging and the like.

var http = require('http');
var fs = require('fs');

var languages = {};
var queue = [];
var downloadCount = 0;

function usage() {
	//TODO
	console.log('Usage instructions go here');
}

function downloadQueue(filePath, url, callback) {
	queue.push({
		filePath: filePath,
		url: url,
		callback: callback
	});
	checkQueue();
}

function checkQueue() {
	var item = queue[0];

	if (!item || downloadCount > 5) {
		return;
	}

	downloadCount++;
	download(item.filePath, item.url, function () {
		console.log(downloadCount, queue.length, item.filePath);
		downloadCount--;
		for (var i = 0; i < queue.length; i++) {
			if (queue[i].filePath == item.filePath) {
				queue.splice(i, 1);
			}
			i--;
			checkQueue();
		}
		item.callback();
	})
}

function mkdir(folderPath, callback) {
	var parentPath = folderPath.substring(0, folderPath.lastIndexOf('/'));
	if (parentPath.length) {
		mkdir(parentPath, function () {
			fs.mkdir(folderPath, callback);
		})
	} else {
		fs.mkdir(folderPath, callback);
	}
}

function download(filePath, url, callback) {
	var folderPath = filePath.substring(0, filePath.lastIndexOf('/'));
	mkdir(folderPath, function () {
		var file = fs.createWriteStream(filePath);
		var request = http.get(url, function (response) {
			response.pipe(file);
			file.on('finish', function () {
				file.close(callback);
			})
		});
	});
}

function downloadLanguages() {
	var filePath = 'languages.json';
	var url = 'http://tech.lds.org/glweb/?action=languages.query&format=json'
	var langs = require('./' + filePath).languages;

	for (var i = 0; i < langs.length; i++) {
		var l = langs[i];
		languages[l.code_three] = l.id;
	}

	downloadQueue(filePath, url, function () {
		process.argv.filter(function (param) {
			return param in languages;
		}).forEach(downloadCatalog);
	});
}

function downloadCatalog(code) {
	var id = languages[code];
	var filePath = code + '/catalog.json';
	var url = 'http://tech.lds.org/glweb/?action=catalog.query&languageid=' + id + '&platformid=17&format=json';

	console.log('downloading', id, code, filePath, url);
	downloadQueue(filePath, url, function () {
		loadCatalog(code);
	});
}

function loadCatalog(id) {
	function loadBooks(folder) {
		folder.books.forEach(downloadBook);
		folder.folders.forEach(loadBooks);
	}

	function downloadBook(book) {
		var filePath = id + book.gl_uri + '.zbook';
		var url = book.url;
		downloadQueue(filePath, url, function () {});
	}

	var filePath = id + '/catalog.json';
	var catalog = JSON.parse(fs.readFileSync(filePath, 'utf8'));
	loadBooks(catalog.catalog);
}

downloadLanguages();
