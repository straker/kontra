import { on } from './events.js';

let callbacks = {};
let pressedKeys = {};

/**
 * Execute a function that corresponds to a keyboard key.
 * @private
 *
 * @param {KeyboardEvent} e
 */
function keydownEventHandler(e) {
  pressedKeys[e.key] = true;

  if (callbacks[e.key]) {
    callbacks[e.key](e);
  }
}

/**
 * Set the released key to not being pressed.
 * @private
 *
 * @param {KeyboardEvent} e
 */
function keyupEventHandler(e) {
  pressedKeys[e.key] = false;
}

/**
 * Reset pressed keys.
 * @private
 *
 * @param {KeyboardEvent} e
 */
function blurEventHandler(e) {
  pressedKeys = {};
}

export function initKeys() {
  addEventListener('keydown', keydownEventHandler);
  addEventListener('keyup', keyupEventHandler);
  addEventListener('blur', blurEventHandler);
}

/**
 * Register a function to be called on a key press.
 * @memberof kontra.keys
 *
 * @param {string|string[]} keys - key or keys to bind.
 */
export function bind(keys, callback) {
  // smaller than doing `Array.isArray(keys) ? keys : [keys]`
  [].concat(keys).map(function(key) {
    callbacks[key] = callback;
  });
}

/**
 * Remove the callback function for a key.
 * @memberof kontra.keys
 *
 * @param {string|string[]} keys - key or keys to unbind.
 */
export function unbind(keys, undefined) {
  [].concat(keys).map(function(key) {
    callbacks[key] = undefined;
  })
}

/**
 * Returns whether a key is pressed.
 * @memberof kontra.keys
 *
 * @param {string} key - Key to check for press.
 *
 * @returns {boolean}
 */
export function pressed(key) {
  return !!pressedKeys[key];
}