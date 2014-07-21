def.inherits = def_inherits;

function def_inherits(Type, Base) {
    // Operator instanceof works even if the constructor property is not fixed.
    // However, if the constructor is not fixed,
    // all instances of a given class hierarchy, whatever its class,
    // will evaluate the constructor property as being the root class of the class hierarchy.
    // To later allow walking up the prototype chain, even in browsers that don't support
    // Object.getPrototypeOf or __proto__, we place a __proto__ property in the new
    // Type.prototype, pointing to the base prototype. See def.protoOf.
    if(Base) {
        var baseProto = Base.prototype,
            proto = Type.prototype = Object.create(baseProto);

        def.setNonEnum(proto, 'constructor', Type);
        if(!('__proto__' in proto)) def.setNonEnum(proto, '__proto__', baseProto);
    }

    return Type;
}