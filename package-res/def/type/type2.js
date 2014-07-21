/**
 * Constructs a type with the specified name in the current namespace.
 *
 * @function
 * @param {string} [name] The new type name, relative to the base argument.
 * When unspecified, an anonymous type is created.
 * The type is not published in any namespace.
 *
 * @param {object} [baseType] The base type.
 * @param {object} [space] The namespace where to define a named type.
 * The default namespace is the current namespace.
 */
def.type = def.argumentsTypeBound([
    // name[, baseType[, space]] | baseType[, space] | space
    'string', 'function', 'object'
], function(name, baseCtor, space) {
    var TypeMeta;
    if(baseCtor)
        TypeMeta = def.fun.is(baseCtor) ? baseCtor.Meta : baseCtor.ctor.Meta;
    else
        TypeMeta = def_TypeMeta;

    var ctor = new TypeMeta({base: baseCtor || def_Object}).ctor;
    return def(name, ctor, space);
});
