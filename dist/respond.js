"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function run(readable, writable, expects, responses) {
    let needNew = true;
    let buffer = '';
    let match = false;
    let expect = '';
    let response = '';
    readable.on('data', data => {
        buffer += data.toString();
        if (needNew) {
            expect = expects.shift();
            response = responses.shift();
            needNew = false;
        }
        if (typeof expect === 'string') {
            match = buffer.lastIndexOf(expect) == buffer.length - expect.length;
        }
        else if (typeof expect === 'object') {
            match = buffer.match(expect) != null;
        }
        if (match) {
            needNew = true;
            writable.write(response);
            match = false;
            if (expects.length === 0 && responses.length === 0) {
                writable.end();
            }
        }
    });
}
exports.run = run;
//# sourceMappingURL=respond.js.map