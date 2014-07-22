def.methods = def_methods;
def.method  = def_method;
def.abstractMethod = def.fail.notImplemented;

function def_methods(proto, mixins, ka) {
    proto = F_protoOrSelf(proto);

    var baseProto  = def.protoOf(proto), // Hoping a proper prototype chain exists.
        rootProto  = def.rootProtoOf(proto),
        enumerable = def.get(ka, 'enumerable', true);

    def.array.each(mixins, function(mixin) {
        def.each(F_protoOrSelf(mixin), function(v, p) {
            def_method_(proto, p, v, baseProto, rootProto, enumerable);
        });
    });

    return def;
}

function def_method(proto, p, v, ka) {
    var enumerable = def.get(ka, 'enumerable', true);
    return def_method_(proto, p, v, def.protoOf(proto), def.rootProtoOf(proto), enumerable);
}

/** @ignore */
function def_method_(proto, p, v, baseProto, rootProto, enumerable) {
    if(v !== undefined && baseProto[p] !== v) {
        // Don't let overwrite 'constructor' of prototype
        switch(p) { case 'base': case 'constructor': return; }

        var m;
        if(v && (m = def.fun.as(v))) {
            v = def.overrides(m, def_inheritedMethod(proto, p), rootProto);
            if(enumerable)
                proto[p] = v;
            else
                def.setNonEnum(proto, p, v);
        } else {
            // Can use native object value directly.
            mixinProp(proto, p, v, /*protectNativeValue*/def.identity);
        }
    }
    return def;
}