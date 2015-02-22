function PathModel(database) {
    this.database = database;
}

PathModel.prototype = {
    exists: function exists(path) {
        return this.get(path).then(function onSuccess(pathObj) {
            return pathObj && true;
        }, function onError(){
            return false;
        })
    },
    
    get: function get(path) {
        return Promise.reject("Not implemented");
    }
}