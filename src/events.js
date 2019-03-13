let callbacks = {};

/**
 * Register a callback for an event.
 *
 * @param {string} event - Name of the event
 * @param {function} callback - Function callback
 */
export function on(event, callback) {
  callbacks[event] = callbacks[event] || [];
  callbacks[event].push(callback);
}

/**
 * Remove a callback for an event.
 *
 * @param {string} event - Name of the event
 * @param {function} callback - Function callback
 */
export function off(event, callback) {
  let index;

  if (!callbacks[event] || (index = callbacks[event].indexOf(callback)) < 0) return;
  callbacks[event].splice(index, 1);
}

/**
 * Call all callback functions for the event.
 *
 * @param {string} event - Name of the event
 * @param {...*} args - Arguments passed to all callbacks
 */
export function emit(event, ...args) {
  if (!callbacks[event]) return;
  callbacks[event].map(fn => fn(...args));
}