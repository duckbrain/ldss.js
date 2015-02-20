function log(line) {
    data.lastLog = line;
    console.log(line);
}

var database = new DatabaseModel();
var data = { database: database };

database.open().then(function (database) {
    data.languageModel = new LanguageModel(database);
    data.settingsModel = new SettingsModel(database, null);
    
    return data.settingsModel.getAll();
    
}).then(function(settings) {
    data.catalogModel = new CatalogModel(data.database, settings.selectedLanguage);
    return data.catalogModel.download().then(log);  
});