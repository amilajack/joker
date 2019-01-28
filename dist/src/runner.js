"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const clone_1 = require("clone");
const child_process_1 = require("child_process");
const batch_1 = require("./batch");
const world_1 = require("./world");
const expect = require("./expectations");
const middlewares = require("./middlewares");
const result_1 = require("./result");
const respond = require("./respond");
class Runner {
    constructor(options) {
        if (!(this instanceof Runner))
            return new Runner(options);
        options = options || {};
        this.options = options;
        this.batch = new batch_1.default();
        this.world = new world_1.default(process.env, process.cwd());
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
        this.expect(expect.time(ms));
        return this;
    }
    stdout(pattern) {
        this.expect(expect.stdout(pattern));
        return this;
    }
    stderr(pattern) {
        this.expect(expect.stderr(pattern));
        return this;
    }
    code(code) {
        this.expect(expect.code(code));
        return this;
    }
    exist(path) {
        this.expect(expect.exists(path));
        return this;
    }
    match(file, pattern) {
        this.expect(expect.match(file, pattern));
        return this;
    }
    mkdir(path) {
        this.batch.add(middlewares.mkdir(path));
        return this;
    }
    exec(cmd, world) {
        world = world || this.world;
        this.batch.add(middlewares.exec(cmd, world));
        return this;
    }
    writeFile(path, data) {
        this.batch.add(middlewares.writeFile(path, data));
        return this;
    }
    rmdir(path) {
        this.batch.add(middlewares.rmdir(path));
        return this;
    }
    unlink(path) {
        this.batch.add(middlewares.unlink(path));
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
        const args = require('shell-quote').parse(cmd);
        const bin = args.shift(0);
        return (fn) => {
            if (cmd === '') {
                fn(undefined);
                return;
            }
            const child = child_process_1.spawn(bin, args, this.world);
            let stdout = '';
            let stderr = '';
            let err;
            if (this.standardInput != null) {
                child.stdin.end(this.standardInput);
            }
            if (this.world.timeout) {
                setTimeout(() => {
                    child.kill();
                    err = { killed: true };
                }, this.world.timeout);
            }
            respond.run(child.stdout, child.stdin, this.prompts, this.responses);
            child.stdout.on('data', (data) => {
                stdout += data;
            });
            child.stderr.on('data', (data) => {
                stderr += data;
            });
            child.on('close', (code) => {
                const result = new result_1.default(cmd, code, this.options).parse(stdout, stderr, err);
                let error = null;
                for (let i = 0, len = this.expectations.length; i < len; i++) {
                    error = this.expectations[i](result);
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