import * as stream from 'stream';

/**
 * Read interactive prompts on a stream and
 * write the associated response to another
 *
 * Largely borrowed from @jprichardson's module "node-suppose"
 * https://github.com/jprichardson/node-suppose/
 *
 * @param {Stream} Readable Stream to listen for prompts on.
 * @param {Stream} Writable Stream to write respones to.
 * @param {Array} An array of prompts {Regex|String}
 * @param {Array} An array of responses {String}
 * @private
 */

export function run(
  readable: stream.Readable,
  writable: stream.Writable,
  expects: (RegExp | string)[],
  responses: string[]
) {
  let needNew = true;
  let buffer = '';
  let match = false;
  let expect: RegExp | string | undefined = '';
  let response: RegExp | string | undefined = '';

  readable.on('data', data => {
    buffer += data.toString();
    if (needNew) {
      expect = expects.shift();
      response = responses.shift();
      needNew = false;
    }

    if (typeof expect === 'string') {
      match = buffer.lastIndexOf(expect) === buffer.length - expect.length;
    } else if (typeof expect === 'object') {
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
