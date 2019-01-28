"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const fs_1 = require("fs");
function mkdir(path) {
    return next => {
        fs_1.default.mkdir(path, done(next));
    };
}
exports.mkdir = mkdir;
function writeFile(path, data) {
    return next => {
        fs_1.default.writeFile(path, data, done(next));
    };
}
exports.writeFile = writeFile;
function rmdir(path) {
    return next => {
        fs_1.default.rmdir(path, done(next));
    };
}
exports.rmdir = rmdir;
function unlink(path) {
    return next => {
        fs_1.default.unlink(path, done(next));
    };
}
exports.unlink = unlink;
function exec(cmd, world) {
    return next => {
        child_process_1.default.exec(cmd, world, next);
    };
}
exports.exec = exec;
function done(next) {
    return err => {
        if (err)
            throw err;
        next();
    };
}
//# sourceMappingURL=middlewares.js.map