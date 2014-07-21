/** @private */
var A_slice  = Array.prototype.slice,
    O_proto  = Object.prototype,
    O_hasOwn = O_proto.hasOwnProperty,
    F_protoOrSelf = function(F) { return F.prototype || F; };


/**
 * @name def
 * @namespace The 'definition' library root namespace.
 */
function def(qName, value, space) {
    qName = def.qualName(qName);
    space = def.space(qName.namespace, space);
    if(qName.name) {
        // TODO: log definition overwrite
        //if(O_hasOwn.call(space, name))
        //throw def.error.operationInvalid("Name '{0}' is already defined in namespace.", [name]);

        space[qName.name] = value;

        // functions included
        // replaces the name if already there, which implies that defining a value
        // on two names, will result in the second "gaining" the name.
        if(value instanceof Object) def.qualNameOf(value, qName);
    }
    return value;
}

/**
 * The JavaScript global object.
 * @type {object}
 */
def.global = this;

def.copyOwn = function(a, b) {
    var to, from;
    if(arguments.length >= 2)
        to = (a || {}), from = b;
    else
        to = {}, from = a;

    for(var p in from) if(O_hasOwn.call(from, p)) to[p] = from[p];

    return to;
};