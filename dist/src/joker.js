"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(require("./runner"));
var runner_1 = require("./runner");
exports.default = runner_1.default;
var plugin_1 = require("./plugin");
exports.register = plugin_1.default;
var package_json_1 = require("../package.json");
exports.version = package_json_1.version;
//# sourceMappingURL=joker.js.map