
def.TypeMeta = def_TypeMeta;

// Use cases
// * The Abstract class -> base = null, Ctor = null
// * A class derived from Abstract -> base != null, Ctor = null
// * External Ctor -> base = null, Ctor != null
// (base)
// (baseCtor)
// (base,     null, Type)
// (baseCtor, null, Type)
// (null,     Ctor)
// (null,     Ctor, Type)
// (null,     null, Type)

// base => !Ctor
// Ctor => !base

function def_TypeMeta(ka) {
    var base = def.get(ka, 'base'),
        Type = def.get(ka, 'Type'),
        BaseType,
        ctor;

    if(base) {
        if(def.fun.is(base))
            base = type_privProp(base) || def.fail.argumentInvalid('base');
        else if(!(base instanceof def_TypeMeta))
            throw def.error.argumentInvalid("base", "Not a constructor function or a def.TypeMeta instance.");

        BaseType = base.Type;
    } else {
        ctor = def.get(ka, 'ctor');
        BaseType = def_Type;
    }

    // Let Type === BaseType to pass-through if specified.
    if(!Type)
        Type = def_Type_subClass(BaseType);
    else if(Type !== BaseType && !(Type.prototype instanceof BaseType))
        throw def.error.argumentInvalid("Type", "Is not a subclass of the base constructor type.");

    if(Type.ctor) throw def.error.argumentInvalid("Type", "Constructor type already has a constructor.");

    this.external = !!ctor;
    this.baseMeta = base || null;
    this.root  = base ? base.root : this;
    this.init  = base ? base.init : null;
    this.post  = base ? base.post : null;
    this.steps = undefined;
    this.Type  = Type;
    this.ctor  = ctor = this.initConstructor(ctor || this.createConstructor());
    Type.ctor  = ctor;
}

def.methods(def_TypeMeta, /** @lends def.TypeMeta# */{
    closed: function() { return !!this.steps; },

    close: function() {
        if(!this.steps) this.closeCore((this.steps = []));
        return this;
    },

    closeCore: function(steps) {
        this.addPostSteps(steps);
        this.addInitSteps(steps);
    },

    addPostSteps: function(steps) {
        if(this.post) steps.push(this.post);
    },

    addInitSteps: function(steps) {
        if(this.init) steps.push(this.init);
    },

    createConstructor: function() {
        var S = 1,
            meta = this,
            steps = [function initClass() {
                meta.close();
                steps = meta.steps; // replace
                S = steps.length;
                return true; // reset iteration!
            }];

        function Class() {
            var i = S;
            while(i--) if(steps[i].apply(this, arguments) === true) i = S;
        }

        return Class;
    },

    initConstructor: function(ctor) {
        // Must copy inherited properties as well.
        def.copy(ctor, this.Type.prototype);

        type_privProp.init(ctor, this);

        if(this.baseMeta) def.inherits(ctor, this.baseMeta.close().ctor);

        ctor.Type = this.Type;
        ctor.Meta = this.constructor;

        return ctor;
    }
});
