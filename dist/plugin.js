"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const runner_1 = require("./runner");
exports.default = (name, fn) => {
    let reg = null;
    if (Object(name) !== name) {
        reg = Object.create(null);
        reg[name] = fn;
    }
    else {
        reg = name;
    }
    Object.keys(reg).forEach(key => {
        runner_1.default.prototype[key] = reg[key];
    });
};
//# sourceMappingURL=plugin.js.map