/**
 * A simple event system. Allows you to hook into Kontra lifecycle events or create your own, such as for [Plugins](api/plugin).
 *
 * ```js
 * import { on, off, emit } from 'kontra';
 *
 * function callback(a, b, c) {
 *   console.log({a, b, c});
 * });
 *
 * on('myEvent', callback);
 * emit('myEvent', 1, 2, 3);  //=> {a: 1, b: 2, c: 3}
 * off('myEvent', callback);
 * ```
 * @sectionName Events
 */

// expose for testing
export let callbacks = {};

/**
 * There are currently only three lifecycle events:
 * - `init` - Emitted after `kontra.init()` is called.
 * - `tick` - Emitted every frame of [GameLoop](api/gameLoop) before the loops `update()` and `render()` functions are called.
 * - `assetLoaded` - Emitted after an asset has fully loaded using the asset loader. The callback function is passed the asset and the url of the asset as parameters.
 * @sectionName Lifecycle Events
 */

/**
 * Register a callback for an event to be called whenever the event is emitted. The callback will be passed all arguments used in the `emit` call.
 * @function on
 *
 * @param {String} event - Name of the event.
 * @param {Function} callback - Function that will be called when the event is emitted.
 * @param {Boolean} [once=false] - If the callback should only be called the first time the event is emitted.
 */
export function on(event, callback, once = false) {
  callbacks[event] = callbacks[event] || [];
  callbacks[event].push({ fn: callback, once });
}

/**
 * Remove a callback for an event.
 * @function off
 *
 * @param {String} event - Name of the event.
 * @param {Function} callback - The function that was passed during registration.
 * @param {Boolean} [once=false] - If the callback was added as a one time function or not.
 */
export function off(event, callback, once = false) {
  callbacks[event] = (callbacks[event] || []).filter(
    ({ fn, once: _once }) => !(fn == callback && _once == once)
  );
}

/**
 * Call all callback functions for the event. All arguments will be passed to the callback functions.
 * @function emit
 *
 * @param {String} event - Name of the event.
 * @param {...*} args - Comma separated list of arguments passed to all callbacks.
 */
export function emit(event, ...args) {
  (callbacks[event] || []).map(({ fn, once }) => {
    fn(...args);
    if (once) {
      off(event, fn, once);
    }
  });
}

// expose for testing
export function _reset() {
  Object.keys(callbacks).map(key => {
    delete callbacks[key];
  });
}
