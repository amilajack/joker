"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Batch {
    constructor() {
        this.before = [];
        this.afterBefore = [];
        this.after = [];
        this.beforeAfter = [];
        this.fn = null;
    }
    addBefore(fn) {
        this.before.push(fn);
    }
    addAfter(fn) {
        this.after.push(fn);
    }
    add(fn) {
        (this.hasMain() ? this.beforeAfter : this.afterBefore).push(fn);
    }
    main(fn) {
        this.fn = fn;
    }
    hasMain() {
        return !!this.fn;
    }
    run(fn) {
        let err = null;
        const main = this.fn;
        let batch = this.before.slice(0).concat(this.afterBefore);
        console.log('batch');
        batch.push(next => {
            main(e => {
                err = e;
                next();
            });
        });
        batch = batch.concat(this.beforeAfter).concat(this.after);
        batch.push(() => {
            fn(err);
        });
        function next() {
            const fn = batch.shift();
            if (!fn)
                return;
            if (fn.length)
                return fn(next);
            fn();
            next();
        }
        next();
    }
}
exports.default = Batch;
//# sourceMappingURL=batch.js.map