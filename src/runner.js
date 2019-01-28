var clone = require('clone');
var spawn = require('child_process').spawn;
var Batch = require('./batch');
var World = require('./world');
var expect = require('./expectations');
var middlewares = require('./middlewares');
var Result = require('./result');
var respond = require('./respond');
function Runner(options) {
    if (!(this instanceof Runner))
        return new Runner(options);
    options = options || {};
    this.options = options;
    this.batch = new Batch();
    this.world = new World();
    this.expectations = [];
    this.prompts = [];
    this.responses = [];
    this.baseCmd = '';
    this.standardInput = null;
}
Runner.prototype.before = function (fn) {
    this.batch.addBefore(fn);
    return this;
};
Runner.prototype.after = function (fn) {
    this.batch.addAfter(fn);
    return this;
};
Runner.prototype.cwd = function (path) {
    this.world.cwd = path;
    return this;
};
Runner.prototype.base = function (cmd) {
    this.baseCmd = cmd;
    return this;
};
Runner.prototype.stdin = function (data) {
    this.standardInput = data || '';
    return this;
};
Runner.prototype.env = function (key, val) {
    this.world.env[key] = val;
    return this;
};
Runner.prototype.run = function (cmd, fn) {
    this.batch.main(this.execFn(this.baseCmd + cmd));
    console.log('who');
    if (fn)
        this.end(fn);
    return this;
};
Runner.prototype.timeout = function (ms) {
    this.world.timeout = ms;
    this.expect(expect.time(ms));
    return this;
};
Runner.prototype.stdout = function (pattern) {
    this.expect(expect.stdout(pattern));
    return this;
};
Runner.prototype.stderr = function (pattern) {
    this.expect(expect.stderr(pattern));
    return this;
};
Runner.prototype.code = function (code) {
    this.expect(expect.code(code));
    return this;
};
Runner.prototype.exist = function (path) {
    this.expect(expect.exists(path));
    return this;
};
Runner.prototype.match = function (file, pattern) {
    this.expect(expect.match(file, pattern));
    return this;
};
Runner.prototype.mkdir = function (path) {
    this.batch.add(middlewares.mkdir(path));
    return this;
};
Runner.prototype.exec = function (cmd, world) {
    world = world || this.world;
    this.batch.add(middlewares.exec(cmd, world));
    return this;
};
Runner.prototype.writeFile = function (path, data) {
    this.batch.add(middlewares.writeFile(path, data));
    return this;
};
Runner.prototype.rmdir = function (path) {
    this.batch.add(middlewares.rmdir(path));
    return this;
};
Runner.prototype.unlink = function (path) {
    this.batch.add(middlewares.unlink(path));
    return this;
};
Runner.prototype.on = function (pattern) {
    this.prompts.push(pattern);
    return this;
};
Runner.prototype.respond = function (response) {
    this.responses.push(response);
    return this;
};
Runner.prototype.end = function (fn) {
    if (!this.batch.hasMain()) {
        throw new Error('Please provide a command to run. Hint: `joker#run`');
    }
    this.batch.run(fn);
};
Runner.prototype.clone = function () {
    return clone(this, false);
};
Runner.prototype.expect = function (fn) {
    this.expectations.push(fn);
    return this;
};
Runner.prototype.execFn = function (cmd) {
    var self = this;
    var args = require('shell-quote').parse(cmd);
    var bin = args.shift(0);
    return function (fn) {
        if (cmd === '') {
            fn(undefined);
            return;
        }
        var child = spawn(bin, args, self.world);
        var stdout = '';
        var stderr = '';
        var err;
        if (self.standardInput != null) {
            child.stdin.end(self.standardInput);
        }
        if (self.world.timeout) {
            setTimeout(function () {
                child.kill();
                err = { killed: true };
            }, self.world.timeout);
        }
        respond.run(child.stdout, child.stdin, self.prompts, self.responses);
        child.stdout.on('data', function (data) {
            stdout += data;
        });
        child.stderr.on('data', function (data) {
            stderr += data;
        });
        child.on('close', function (code) {
            var error = null;
            var result = new Result(cmd, code, self.options).parse(stdout, stderr, err);
            for (var i = 0, len = self.expectations.length; i < len; i++) {
                error = self.expectations[i](result);
                if (error)
                    break;
            }
            fn(error);
        });
    };
};
module.exports = Runner;
//# sourceMappingURL=runner.js.map