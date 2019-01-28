"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const clone_1 = require("clone");
const child_process_1 = require("child_process");
const batch_1 = require("./batch");
const world_1 = require("./world");
const expectations_1 = require("./expectations");
const middlewares_1 = require("./middlewares");
const result_1 = require("./result");
const respond_1 = require("./respond");
class Runner {
    constructor(options) {
        if (!(this instanceof Runner))
            return new Runner(options);
        options = options || {};
        this.options = options;
        this.batch = new batch_1.default();
        this.world = new world_1.default();
        this.expectations = [];
        this.prompts = [];
        this.responses = [];
        this.baseCmd = '';
        this.standardInput = null;
    }
    before(fn) {
        this.batch.addBefore(fn);
        return this;
    }
    after(fn) {
        this.batch.addAfter(fn);
        return this;
    }
    cwd(path) {
        this.world.cwd = path;
        return this;
    }
    base(cmd) {
        this.baseCmd = cmd;
        return this;
    }
    stdin(data) {
        this.standardInput = data || '';
        return this;
    }
    env(key, val) {
        this.world.env[key] = val;
        return this;
    }
    run(cmd, fn) {
        this.batch.main(this.execFn(this.baseCmd + cmd));
        console.log('who');
        if (fn)
            this.end(fn);
        return this;
    }
    timeout(ms) {
        this.world.timeout = ms;
        this.expect(expectations_1.default.time(ms));
        return this;
    }
    stdout(pattern) {
        this.expect(expectations_1.default.stdout(pattern));
        return this;
    }
    stderr(pattern) {
        this.expect(expectations_1.default.stderr(pattern));
        return this;
    }
    code(code) {
        this.expect(expectations_1.default.code(code));
        return this;
    }
    exist(path) {
        this.expect(expectations_1.default.exists(path));
        return this;
    }
    match(file, pattern) {
        this.expect(expectations_1.default.match(file, pattern));
        return this;
    }
    mkdir(path) {
        this.batch.add(middlewares_1.default.mkdir(path));
        return this;
    }
    exec(cmd, world) {
        world = world || this.world;
        this.batch.add(middlewares_1.default.exec(cmd, world));
        return this;
    }
    writeFile(path, data) {
        this.batch.add(middlewares_1.default.writeFile(path, data));
        return this;
    }
    rmdir(path) {
        this.batch.add(middlewares_1.default.rmdir(path));
        return this;
    }
    unlink(path) {
        this.batch.add(middlewares_1.default.unlink(path));
        return this;
    }
    on(pattern) {
        this.prompts.push(pattern);
        return this;
    }
    respond(response) {
        this.responses.push(response);
        return this;
    }
    end(fn) {
        if (!this.batch.hasMain()) {
            throw new Error('Please provide a command to run. Hint: `joker#run`');
        }
        this.batch.run(fn);
    }
    clone() {
        return clone_1.default(this, false);
    }
    expect(fn) {
        this.expectations.push(fn);
        return this;
    }
    execFn(cmd) {
        const self = this;
        const args = require('shell-quote').parse(cmd);
        const bin = args.shift(0);
        return fn => {
            if (cmd === '') {
                fn(undefined);
                return;
            }
            const child = child_process_1.spawn(bin, args, self.world);
            let stdout = '';
            let stderr = '';
            let err;
            if (self.standardInput != null) {
                child.stdin.end(self.standardInput);
            }
            if (self.world.timeout) {
                setTimeout(() => {
                    child.kill();
                    err = { killed: true };
                }, self.world.timeout);
            }
            respond_1.default.run(child.stdout, child.stdin, self.prompts, self.responses);
            child.stdout.on('data', data => {
                stdout += data;
            });
            child.stderr.on('data', data => {
                stderr += data;
            });
            child.on('close', (code) => {
                let error = null;
                const result = new result_1.default(cmd, code, self.options).parse(stdout, stderr, err);
                for (let i = 0, len = self.expectations.length; i < len; i++) {
                    error = self.expectations[i](result);
                    if (error)
                        break;
                }
                fn(error);
            });
        };
    }
}
exports.default = Runner;
//# sourceMappingURL=runner.js.map