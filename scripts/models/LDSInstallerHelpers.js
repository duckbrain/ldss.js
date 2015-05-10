function LDSInstallerHelpers(nodesOS) {
    var that = this;
    var updateContainer;
    
    function findSiblingLevel(direction, item, level) {
        var index, siblings, result;
        
        if (item.parent && item.parent.children) {
            siblings = item.parent.children
            index = siblings.indexOf(item);
            
            if (siblings[index + direction]) {
                return siblings[index + direction];
            } else {
                result = findSiblingLevel(direction, item.parent, level + 1);
                while (result && level >= 0) {
                    if (direction > 0) {
                        result = result.children[0]
                    } else {
                        result = result.children[result.children.length - 1];
                    }
                    level--;
                }
                return result;
            }
        } else {
            return null;
        }
    }
    
    function findSibling(direction, item) {
        return findSiblingLevel(direction, item, 0);
    }
    
    function updateChildren(item) {
        var i, dbItem, children, parent;
        
        dbItem = {
            id: item.id,
            type: item.type,
            languageId: item.languageId,
            path: item.path,
            children: summary(item.children),
            details: item.details,
            next: summary(item.next),
            previous: summary(item.previous),
            heiarchy: summary(item.heiarchy),
            details: item.details,
            media: item.media,
            parent: item.parent
        };
        
        children = item.children;
        parent = item.parent;

        // Shortcut through children with 1 child.
        for (i = 0; i < children.length; i++) {
            if (children[i].children.length == 1) {
                item.children[i].id = children[i].children[0].id;
                item.children[i].path = children[i].children[0].path;
            }
        }

        // Go back up the same way
        if (parent && parent.parent && parent.children && parent.children.length == 1) {
            parent.id = parent.parent.id;
            parent.path = parent.parent.path;
        }

        // Trim the heiarchy's names
        for (i = 1; i < item.heiarchy.length; i++) {
            fixName(item.heiarchy[i - 1], item.heiarchy[i]);
        }
        
        updateContainer.push(nodesOS.put(dbItem));
        children.forEach(updateChildren);
    }
    
    function update(item, callback) {
        updateContainer = [];
        updateChildren(item);
        all(updateContainer, callback);
        updateContainer = null;
    }
    
    function fixName(parent, item) {
        var newName;
        if (!parent || !item) {
            return;
        }
        if (item.name != parent.name && item.name.indexOf(parent.name) == 0) {
            newName = item.name.substring(parent.name.length).trim();
            item.name = newName;
        }
    }
    
    function all(entries, callback) {
        var requestCount = updateContainer.length;
        
        function createCheckDone(originalCallback) {
            return function(e) {
                if (originalCallback) {
                    originalCallback(e);
                }
                
                requestCount--;
                if (requestCount == 0) {
                    callback();
                }
            }
        }
        
        updateContainer.forEach(function(entry) {
            entry.onsuccess = createCheckDone(entry.onsuccess);
        });
    }
    
    function summary(item) {
        if (!item) {
            return null;
        } else if (Array.isArray(item)) {
            return item.map(summary);
        } else {
            return {
                id: item.id,
                name: item.name,
                path: item.path,
                type: item.type
            };
        }
    }
    
    that.findSibling = findSibling;
    that.update = update;
    that.all = all;
    
    return that;
}
