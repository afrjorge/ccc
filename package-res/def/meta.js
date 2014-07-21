def.meta = function def_meta(o, meta) {
    var m;
    if(o) {
        m = o.__meta__;

        if(arguments.length < 2) return m;

        if(!m) def.setNonEnum(o, '__meta__', (m = {}));

        if(meta) def.copyOwn(m, meta);
    }

    return o;
};