"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Result {
    constructor(cmd, code, options = { colors: true, newlines: true }) {
        this.options = options;
        this.code = code;
        this.cmd = cmd;
    }
    parse(stdout, stderr, err) {
        this.err = err;
        this.code = err ? err.code : this.code;
        this.killed = err && err.killed;
        this.stdout = this.strip(stdout);
        this.stderr = this.strip(stderr);
        return this;
    }
    strip(str) {
        str = str.replace(/\r?\n$/, '');
        if (this.options.newlines === false) {
            str = str.replace(/\r?\n/g, '');
        }
        if (this.options.colors === false) {
            str = str.replace(/\x1B\[([0-9]{1,2}(;[0-9]{1,2})?)?[m|K]/g, '');
        }
        return str;
    }
}
exports.default = Result;
//# sourceMappingURL=result.js.map