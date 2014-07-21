
var def_Object = new def_TypeMeta({Type: def_Type})
.close()
.ctor
.add({
    override: function(p, v) {
        return def_method_(this, p, v, def.protoOf(this), def_Object.prototype, /*enumerable*/true), this;
    },

    toString: function() { return "[object " + String(def.qualNameOf(def.classOf(this))) + "]"; }
}, {enumerable: false});

def('Object', def_Object); // def is current namespace
