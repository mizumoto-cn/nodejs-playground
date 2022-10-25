var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
// in js we write
// const head = ([x]) => x;
// in typescript we write
var head = function (_a) {
    var x = _a[0];
    return x;
};
var tail = function (_a) {
    var xs = _a.slice(1);
    return xs;
};
var product = function (_a) {
    var x = _a[0], xs = _a.slice(1);
    if (x === undefined)
        return 1;
    return x * product(xs);
};
console.log(product([1, 2, 3, 4, 5]));
console.log(head([1, 2, 3, 4, 5]));
console.log(tail([1, 2, 3, 4, 5]));
var qsort = function (_a) {
    var x = _a[0], xs = _a.slice(1);
    //if (x === undefined) return []
    return __spreadArray(__spreadArray(__spreadArray([], qsort(xs.filter(function (y) { return y <= x; })), true), [
        x
    ], false), qsort(xs.filter(function (y) { return y > x; })), true);
};
console.log(qsort([1, 3, 5, 2, 4, 6]));
