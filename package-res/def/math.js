
function mult10(value, exponent) {
    if(!exponent) return value;
    value = value.toString().split('e');
    return +(value[0] + 'e' + (value[1] ? (+value[1] + exponent) : exponent));
}

// Adapted from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/round
def.round10 = function(value, places) {
    if(!places) return Math.round(value);

    value = +value;

    // If the value is not a number or the exp is not an integer...
    if(isNaN(value) || !(typeof places === 'number' && places % 1 === 0)) return NaN;

    // Shift & round
    value = Math.round(mult10(value, places));

    // Shift back
    return mult10(value, -places);
};

def.mult10 = function(value, exponent) {
    return !exponent ? value : mult10(+value, exponent);
};
