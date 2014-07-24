
def({
    funAndType: def_bipole_funAndType
}, 'bipole');

/**
 * Creates a <i>bipole</i> factory with an implementation consisting of
 * a public function instance and
 * a private type/class instance.
 *
 * @alias funAndType
 * @memberOf def.bipole
 * @param {function} Ctor The type/class constructor, used to create new private pole instances.
 * @param {string} defaultName The name of the instance method of <i>Ctor</i>
 * that receives the calls made directly to the public pole function instance.
 *
 * @return {function} The new bipole factory function.
 */
function def_bipole_funAndType(Ctor, defaultName) {

    var publisher, defaultMethod;

    function updateInterface() {
        var TypeProto = Ctor.prototype;

        publisher = def_bipole_publisher(TypeProto);

        defaultMethod = TypeProto[defaultName] ||
            def.fail.argumentInvalid('defaultName', "Method '{0}' is not defined in type.", [defaultName]);

        def.classify(TypeProto, funBipoleFactory);
    }

    updateInterface();

    return funBipoleFactory;

    function funBipoleFactory() {

        var privPole = def.make(Ctor, arguments);

        publisher(pubPole, privPole);

        return def.fun.wraps(pubPole, defaultMethod);

        function pubPole() {
            var r = defaultMethod.apply(privPole, arguments);
            return r === privPole ? pubPole : r;
        }
    }
}

function def_bipole_publisher(privInterface) {
    var filteredPrivInterface = [];

    def.ownKeys(privInterface).forEach(function(p) {
        if(def.isPropPrivate(p)) filteredPrivInterface.push({name: p, value: privInterface[p]});
    });

    return publisher;

    function publisher(pubPole, privPole) {
        privInterface.forEach(function(pair) {
            pubPole[pair.name] = def_bipole_publishedValue(pubPole, privPole, pair.value);
        });
    }
}

/**
 * Publishes the public parts of a private interface,
 * in a given public pole,
 * by redirecting public pole method calls to private pole method calls.
 *
 * @alias publish
 * @memberOf def.bipole
 * @param {Object} pubPole The public pole instance.
 * @param {Object} pubInterface The object where the public interface is published.
 * @param {Object} privPole The private pole instance.
 * @param {Object} privInterface The object whose own or inherited properties are the private interface.
 *
 * @return {Object} The public pole instance.

function def_bipole_publish(pubPole, pubInterface, privPole, privInterface) {
    def.each(privInterface, function(v, p) {
        if(!def.isPropPrivate(p))
            pubInterface[p] = def_bipole_publishedValue(pubPole, privPole, v);
    });

    return pubPole;
}
 */

function def_bipole_publishedValue(pubPole, privPole, v) {
    return def.fun.is(v)
        ? def_bipole_publishedMethod(pubPole, privPole, v)
        : v;
}

function def_bipole_publishedMethod(pubPole, privPole, m) {

    function publishedMethod() {
        var r = m.apply(privPole, arguments);
        return r === privPole ? pubPole : r;
    }

    return def.fun.wraps(publishedMethod, m);
}

