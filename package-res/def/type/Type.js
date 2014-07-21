
var type_privProp = the_priv_key.property();

// The class of constructors.
// Defines the methods that all constructor functions have.
// This is a similar feature to that of "inheritable static methods".
def.Type = def_Type;

// As a function, creates a type from an external constructor
function def_Type(Ctor, config) {
    new def_TypeMeta({ctor: Ctor});
    return def.configure(Ctor, config);
}

function def_TypeStatic_methods(mixin, ka) {
    // Update proto, for inherited classes.
    // NOTE: method properties must be enumerable,
    // otherwise, later, def_TypeMeta#_initConstructor
    // won't be able to copy these to the ctor.
    def.methods(this, mixin, ka);

    // Sync associated constructor.
    var ctor = this.ctor;
    if(ctor) def.each(F_protoOrSelf(mixin), function(v, p) {
        ctor[p] = this[p];
    }, this.prototype);

    return this;
}

var def_TypeStatic = {
    methods: def_TypeStatic_methods,

    add:  def.meta(function() { return def_TypeStatic_methods.apply(this, arguments); }, {configurable: false}),
    inst: def.meta(function() { return this.ctor; }, {configurable: false})
};

def.copyOwn(def_Type, def_TypeStatic);

// Ctor is filled with Type#
// Ctor.add()  -> adds methods to Ctor#
// Type.add()  -> adds methods to Type# and to associated Ctor.
// Type.inst() -> Ctor

def_Type.add(/** @lends def.Type# */ {
    init: function(init) {
        if(!init) throw def.error.argumentRequired('init');

        var meta = def_Type_metaOpened(this);
        if(meta.external) throw def.error.invalidOperation("init cannot be used with an external constructor.");

        meta.init = def.overrides(init, meta.init, meta.root.ctor.prototype);

        return this;
    },

    postInit: function(postInit) {
        if(!postInit) throw def.error.argumentRequired('postInit');

        var meta = def_Type_metaOpened(this);
        if(meta.external) throw def.error.invalidOperation("postInit cannot be used with an external constructor.");

        meta.post = def.overrides(postInit, meta.post, meta.root.ctor.prototype);

        return this;
    },

    // Allow configuring the type.
    type: def.meta(function() {
        return type_privProp(this).Type;
    }, {configurable: true}),

    methods: function(mixin, ka) {
        return def.methods(this, mixin, ka), this;
    },

    mixin: def.meta(function(mixin, ka) {
        return def.methods(this, mixin, ka), this;
        }, {configurable: true}),

    mixins: function(mixins, ka) {
        for(var p in mixins) def.methods(this, mixins[p], ka);
        return this;
    },

    add: def.meta(function(mixin, ka) {
        return def.methods(this, mixin, ka), this;
    }, {configurable: false}),

    configure: function(config) {
        return def.configure.generic(this, config), this;
    },

    extend: def.meta(function(config) {
        var TypeMeta = this.Meta,
            subType = new TypeMeta({base: this}).ctor;

        return def.configure(subType, config);
    }, {configurable: false})
});

/** @ignore */
function def_Type_metaOpened(ctor) {
    var meta = type_privProp(ctor);
    if(meta.closed()) throw def.error.operationInvalid("Type is closed.");
    return meta;
}

/** @ignore */
function def_Type_subClass(baseType) {

    function CtorType() { }

    def.inherits(CtorType, baseType);

    def.copyOwn(CtorType, def_TypeStatic);

    return CtorType;
}