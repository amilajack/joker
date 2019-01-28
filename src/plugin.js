var Runner = require('./runner');
module.exports = function (name, fn) {
    var reg = null;
    if (Object(name) !== name) {
        reg = Object.create(null);
        reg[name] = fn;
    }
    else {
        reg = name;
    }
    Object.keys(reg).forEach(function (key) {
        Runner.prototype[key] = reg[key];
    });
};
//# sourceMappingURL=plugin.js.map