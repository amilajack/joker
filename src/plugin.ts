import Runner from './runner';

/**
 * Primitive plugin support.
 *
 * It will add the supplied `fn to Runner's prototype.
 *
 * Examples:
 *
 * Register a single function, could be both middleware or expectation:
 * ```ts
 * joker.register('stdoutNotEqual', fn);
 * ```
 *
 * Later on this can be used as you would expect:
 * ```ts
 *  new Joker()
 *    .run('ls /tmp')
 *    .stdoutNotEqual('xxx')
 *    .end()
 * ```
 *
 * In case you want to register more than one function at once you may want to pass
 * an object:
 * ```ts
 *  joker.register({
 *    name: fn,
 *    otherName: fn2,
 *    etc: etc,
 *  });
 * ```
 *
 * The second example might come handy when developing plugins. Keep in mind that
 * the plugin system will most certainly change in future version (prior hitting 1.0.0).
 * The current implementation has some obvious problems like what plugin developers
 * will do if they happen to use the same function name. Any ideas and suggestions
 * are more than welcome.
 *
 * @param {String|Object} name
 * @param {Function} fn
 * @public
 */

interface Register {
  [x: string]: Function;
}

export default function Plugin(name: string | Register, fn?: Function) {
  let register: Register = {};

  if (typeof name === 'object' && !(name instanceof String)) {
    register = name;
  } else if (typeof name === 'string') {
    register = {
      [name]: fn || (() => {})
    };
  }

  Object.keys(register).forEach(key => {
    Runner.prototype[key] = register[key];
  });
}
