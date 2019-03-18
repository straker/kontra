let callbacks = {};
let pressedKeys = {};

export let keyMap = {
  // named keys
  13: 'enter',
  27: 'esc',
  32: 'space',
  37: 'left',
  38: 'up',
  39: 'right',
  40: 'down'
};

/**
 * Execute a function that corresponds to a keyboard key.
 *
 * @param {KeyboardEvent} evt
 */
function keydownEventHandler(evt) {
  let key = keyMap[evt.which];
  pressedKeys[key] = true;

  if (callbacks[key]) {
    callbacks[key](evt);
  }
}

/**
 * Set the released key to not being pressed.
 *
 * @param {KeyboardEvent} evt
 */
function keyupEventHandler(evt) {
  pressedKeys[ keyMap[evt.which] ] = false;
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
  let i;

  // alpha keys
  // @see https://stackoverflow.com/a/43095772/2124254
  for (i = 0; i < 26; i++) {
    // rollupjs considers this a side-effect (for now), so we'll do it in the
    // initKeys function
    // @see https://twitter.com/lukastaegert/status/1107011988515893249?s=20
    keyMap[65+i] = (10 + i).toString(36);
  }

  // numeric keys
  for (i = 0; i < 10; i++) {
    keyMap[48+i] = ''+i;
  }

  window.addEventListener('keydown', keydownEventHandler);
  window.addEventListener('keyup', keyupEventHandler);
  window.addEventListener('blur', blurEventHandler);
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