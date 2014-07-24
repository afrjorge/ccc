/** @private */
var A_slice  = Array.prototype.slice,
    A_empty  = [],
    O_proto  = Object.prototype,
    O_hasOwn = O_proto.hasOwnProperty,
    F_protoOrSelf = function(F) { return F.prototype || F; };


/**
 * qname, value[, space]
 *
 * Object.<string,*>[, space]
 * Array.<Object.<string,*>>[, space]
 *
 * @name def
 * @namespace The 'definition' library root namespace.
 * @variant namespace
 */

/**
 * TODO: Docuemnt this
 * @param {String|def.QualifiedName|object|array} [name] The qualified name to define,
 *  as a string or a qualified name instance.
 *
 * @param {String|object} value The definition value.
 * @param {String|object} [space] The base namespace object or name.
 */
function def(qname, value, space) {
    if(qname && !(qname instanceof def.QualifiedName)) {
        var t = typeof qname;
        if(t === 'object') {
            for(var p in qname) def_1(p, qname[p], /*space*/value);
            return def;
        }

        if(t === 'array') {
            for(var p in qname) def_1(qname[p], /*space*/value);
            return def;
        }
    }

    // t is empty, or t === string, or t is a qualifield name
    def_1(qname, value, space);
    return value;
}

function def_1(qname, value, space) {
    qname = def.qualName(qname);
    space = def.space(qname.namespace, space);
    if(qname.name) {
        // TODO: log definition overwrite
        //if(O_hasOwn.call(space, name))
        //throw def.error.operationInvalid("Name '{0}' is already defined in namespace.", [name]);
        space[qname.name] = value;

        // functions included
        // replaces the name if already there, which implies that defining a value
        // on two names, will result in the second "gaining" the name.
        if(value instanceof Object) def.qualNameOf(value, qname);
    }
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