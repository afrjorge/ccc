
/*
    Type -> TypePrivate

    Public only methods
    Forward to Private object
*/

var type_privProp = the_priv_key.property();

// The class of constructors.
// Defines the methods that all constructor functions have.
// This is a similar feature to that of "inheritable static methods".
def('Type', def_Type);

function def_Type(Ctor, baseType, keyArgs) {

    this.baseType = baseType || null;

    var Type = this.constructor;
    if(Type.Ctor) throw def.error.operationInvalid("Type already has an associated Constructor.");
    if(Ctor && Ctor.Type) throw def.error.argumentInvalid("Ctor", "Constructor already has an associated Type.");

    // Convenience property
    this.Type = Type;

    // Singleton instance (stored in Ctor)
    //type_privProp.init(Type, this);

    this.external = !!Ctor;
    this.rootType = baseType ? baseType.rootType : this;

    this._init = baseType ? baseType._init : null;
    this._post = baseType ? baseType._post : null;
    this.steps = undefined;

    Ctor = this._initConstructor(Ctor || this._createConstructor());

    this.Ctor = // convenience (could be obtained through this.Type.Ctor)
    Type.Ctor = Ctor; // def.setNonEnum(
}

// Type/Static interface - inherited by every sub-type.
def.copyOwn(def_Type, /** @lends def.Type */{
    methods: def_TypeStatic_methods,

    add:     def.meta(function() { return def_TypeStatic_methods.apply(this, arguments); }, {configurable: false}),
    inst:    def.meta(function() { return this.Ctor; }, {configurable: false}),
    subType: def.meta(function(SubType, typeConfig, typeKeyArgs) {
        var Type = this,
            Ctor = Type.Ctor,
            // Singleton instance
            type = (Ctor && type_privProp(Ctor)) ||
                def.fail.operationInvalid("Type is not yet instantiated.");

        def.inherits(SubType, Type);

        // Inherit almost all static public stuff from Type
        def.copyx(SubType, Type, {
            where: function(o, p) {
                return def.hasOwn(o, p) &&
                    (p.charAt(0) !== '_') &&
                    (p !== 'Ctor') &&
                    (p !== 'BaseType');
            }
        });

        SubType.BaseType = Type;

        // Instantiate the type
        new SubType(/*Ctor*/null, /*baseType*/type, /*ka*/typeKeyArgs);

        if(typeConfig) def.configure(SubType, typeConfig);

        return SubType;
    }, {configurable: false}),
    extend: def.meta(function(typeConfig, typeKeyArgs) {
        var Type = this;

        function SubType() { return Type.apply(this, arguments); }

        def.fun.wraps(SubType, Type);

        return Type.subType(SubType, typeConfig, typeKeyArgs);
    }, {configurable: false})
});

function def_TypeStatic_methods(mixins, ka) {
    var Ctor = this.Ctor;
    if(Ctor) type_privProp(Ctor)._assertOpened();

    // Update proto, for inherited classes.
    // NOTE: method properties must be enumerable,
    // otherwise, later, def_Type#_initConstructor
    // won't be able to copy these to the Ctor.
    def.methods(this, mixins, ka);

    // Sync associated constructor.
    if(Ctor) def_TypeStatic_syncCtor.call(this, Ctor, mixins);

    return this;
}

function def_TypeStatic_syncCtor(Ctor, mixins) {
    var TypeProto = this.prototype;

    def.array.each(mixins, function(mixin) {
        def.each(F_protoOrSelf(mixin), function(v, p) {
            // Do not copy private methods.
            // These are kept in Type# only.
            if(!def.isPropPrivate(p)) {
                v = TypeProto[p];
                if(def.fun.is(v))
                    def_TypeStatic_exportMethod(Ctor, p, v);
                else
                    Ctor[p] = v;
            }
        });
    });
}

function def_TypeStatic_exportMethod(to, p, m) {
    function exportedTypeMethod() {
        var type = type_privProp(/*Ctor*/this);
        //  ^ step over ^
        //
        //  v step into v
        var result = m.apply(type, arguments);
        return result === type ? this : result;
    }

    to[p] = def.fun.wraps(exportedTypeMethod, m);
}

// Instance interface
def_Type.add(/** @lends def.Type# */{
    closed: function() {
        return !!this.steps;
    },

    close: function() {
        if(!this.steps) this._closeCore((this.steps = []));
        return this;
    },

    _assertOpened: function() {
        if(this.closed()) throw def.error.operationInvalid("Type is closed.");
    },

    _closeCore: function(steps) {
        this._addPostSteps(steps);
        this._addInitSteps(steps);
    },

    _createConstructor: function() {
        var S = 1,
            type = this,
            steps = [function initClass() {
                steps = type.close().steps; // replace
                S = steps.length;
                return true; // reset iteration!
            }];

        function Class() {
            var i = S;
            while(i--) if(steps[i].apply(this, arguments) === true) i = S;
        }

        return Class;
    },

    _initConstructor: function(Ctor) {
        // Must copy inherited properties as well.
        def_TypeStatic_syncCtor.call(this.Type, Ctor, this.Type);

        type_privProp.init(Ctor, this);

        if(this.baseType) def.inherits(Ctor, this.baseType.close().Ctor);

        Ctor.Type = this.Type;

        return Ctor;
    },

    _addPostSteps: function(steps) {
        if(this._post) steps.push(this._post);
    },

    _addInitSteps: function(steps) {
        if(this._init) steps.push(this._init);
    },

    init: function(init) {
        if(!init) throw def.error.argumentRequired('init');

        this._assertOpened();

        this._init = def.overrides(init, this._init, this.rootType.Ctor.prototype);

        return this;
    },

    postInit: function(postInit) {
        if(!postInit) throw def.error.argumentRequired('postInit');

        this._assertOpened();

        this._post = def.overrides(postInit, this._post, this.rootType.Ctor.prototype);

        return this;
    },

    type: def.meta(function() {
        return this.Type;
    }, {configurable: true}),

    add: def.meta(function(mixin, ka) {
        return def.methods(this.Ctor, mixin, ka), this;
    }, {configurable: false}),

    methods: function(mixin, ka) {
        return def.methods(this.Ctor, mixin, ka), this;
    },

    configure: function(config) {
        return def.configure.generic(this, config), this;
    },

    // Creates a sub-type of this one and instantiates it.
    extend: def.meta(function(instConfig, typeKeyArgs) {
        var SubCtor = this.Type.extend(/*typeConfig*/null, typeKeyArgs).Ctor;
        return SubCtor.configure(instConfig);
    }, {configurable: false})
});