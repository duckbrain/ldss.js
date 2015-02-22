function PathModel(database) {
    this.database = database;
}

PathModel.prototype = {
    exists: function exists(path) {
        return this.get(path).then(function onSuccess(pathObj) {
            return !!pathObj;
        }, function onError(){
            return false;
        })
    },
    
    get: function get(path) {
        return Promise.reject("Not implemented");
        
        var db = this.database;
        return new Promise(function (fulfill, reject) {
            //TODO Query each table and look for the path
        })
    }
}

if (typeof module != 'undefined') {
    module.exports = PathModel;
}