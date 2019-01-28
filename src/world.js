var clone = require('clone');
function World(env, cwd) {
    this.env = env || clone(process.env);
    this.cwd = cwd;
    this.timeout = null;
}
module.exports = World;
//# sourceMappingURL=world.js.map