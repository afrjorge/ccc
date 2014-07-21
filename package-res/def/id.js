var nextGlobalId  = 1,
    nextIdByScope = {};

def.nextId = function(scope) {
    if(scope) {
        var nextId = def.getOwn(nextIdByScope, scope) || 1;
        nextIdByScope[scope] = nextId + 1;
        return nextId;
    }

    return nextGlobalId++;
};
