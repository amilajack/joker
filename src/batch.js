function Batch() {
    this.before = [];
    this.afterBefore = [];
    this.after = [];
    this.beforeAfter = [];
    this.fn = null;
}
Batch.prototype.addBefore = function (fn) {
    this.before.push(fn);
};
Batch.prototype.addAfter = function (fn) {
    this.after.push(fn);
};
Batch.prototype.add = function (fn) {
    (this.hasMain() ? this.beforeAfter : this.afterBefore).push(fn);
};
Batch.prototype.main = function (fn) {
    this.fn = fn;
};
Batch.prototype.hasMain = function () {
    return !!this.fn;
};
Batch.prototype.run = function (fn) {
    var err = null;
    var main = this.fn;
    var batch = this.before.slice(0).concat(this.afterBefore);
    console.log('batch');
    batch.push(function (next) {
        main(function (e) {
            err = e;
            next();
        });
    });
    batch = batch.concat(this.beforeAfter).concat(this.after);
    batch.push(function () {
        fn(err);
    });
    function next() {
        var fn = batch.shift();
        if (!fn)
            return;
        if (fn.length)
            return fn(next);
        fn();
        next();
    }
    next();
};
module.exports = Batch;
//# sourceMappingURL=batch.js.map