"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class World {
    constructor(env = process.env, cwd = process.cwd()) {
        this.env = env || Object.assign({}, process.env);
        this.cwd = cwd;
        this.timeout = null;
    }
}
exports.default = World;
//# sourceMappingURL=world.js.map