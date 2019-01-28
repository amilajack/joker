"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function World(env, cwd) {
    this.env = env || Object.assign({}, process.env);
    this.cwd = cwd;
    this.timeout = null;
}
exports.default = World;
//# sourceMappingURL=world.js.map