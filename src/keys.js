let callbacks = {};
let pressedKeys = {};

/**
 * Execute a function that corresponds to a keyboard key.
 *
 * @param {KeyboardEvent} evt
 */
function keydownEventHandler(evt) {
  pressedKeys[evt.key] = true;

  if (callbacks[evt.key]) {
    callbacks[evt.key](evt);
  }
}

/**
 * Set the released key to not being pressed.
 *
 * @param {KeyboardEvent} evt
 */
function keyupEventHandler(evt) {
  pressedKeys[evt.key] = false;
}

/**
 * Reset pressed keys.
 */
function blurEventHandler() {
  pressedKeys = {};
}

/**
 * Add keyboard event listeners.
 */
export function initKeys() {
  addEventListener('keydown', keydownEventHandler);
  addEventListener('keyup', keyupEventHandler);
  addEventListener('blur', blurEventHandler);
}

/**
 * Register a function to be called on a key press.
 *
 * @param {string|string[]} keys - key or keys to bind.
 */
export function bindKeys(keys, callback) {
  // smaller than doing `Array.isArray(keys) ? keys : [keys]`
  [].concat(keys).map(key => callbacks[key] = callback);
}

/**
 * Remove the callback function for a key.
 *
 * @param {string|string[]} keys - key or keys to unbind.
 */
export function unbindKeys(keys) {
  // 0 is the smallest falsy value
  [].concat(keys).map(key => callbacks[key] = 0);
}

/**
 * Returns whether a key is pressed.
 *
 * @param {string} key - Key to check for press.
 *
 * @returns {boolean}
 */
export function keyPressed(key) {
  return !!pressedKeys[key];
}