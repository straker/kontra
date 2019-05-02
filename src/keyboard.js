/**
 * A minimalistic keyboard API. You can use it move the main sprite or respond to a key press.
 *
 * ```js
 * import { initKeys, keyPressed } from 'kontra';
 *
 * // this function must be called first before keyboard
 * // functions will work
 * initKeys();
 *
 * function update() {
 *   if (keyPressed('left')) {
 *     // move left
 *   }
 * }
 * ```
 * @sectionName Keyboard
 */

/**
 * Below is a list of keys that are provided by default. If you need to extend this list, you can use the [keyMap](#keyMap) property.
 *
 * - a-z
 * - 0-9
 * - enter, esc, space, left, up, right, down
 * @sectionName Available Keys
 */

let callbacks = {};
let pressedKeys = {};

/**
 * A map of keycodes to key names. Add to this object to expand the list of [available keys](#available-keys).
 *
 * ```js
 * import { keyMap, bindKeys } from 'kontra';
 *
 * keyMap[34] = 'pageDown';
 *
 * bindKeys('pageDown', function(e) {
 *   // handle pageDown key
 * });
 * ```
 * @property {Object} keyMap
 */
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
 * Initialize keyboard event listeners. This function must be called before using other keyboard functions.
 * @function initKeys
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
 * Bind a set of keys that will call the callback function when they are pressed. Takes a single key or an array of keys. Is passed the original KeyboardEvent as a parameter.
 *
 * ```js
 * import { initKeys, bindKeys } from 'kontra';
 *
 * initKeys();
 *
 * bindKeys('p', function(e) {
 *   // pause the game
 * });
 * bindKeys(['enter', 'space'], function(e) {
 *   e.preventDefault();
 *   // fire gun
 * });
 * ```
 * @function bindKeys
 *
 * @param {String|String[]} keys - Key or keys to bind.
 */
export function bindKeys(keys, callback) {
  // smaller than doing `Array.isArray(keys) ? keys : [keys]`
  [].concat(keys).map(key => callbacks[key] = callback);
}

/**
 * Remove the callback function for a bound set of keys. Takes a single key or an array of keys.
 *
 * ```js
 * import { unbindKeys } from 'kontra';
 *
 * unbindKeys('left');
 * unbindKeys(['enter', 'space']);
 * ```
 * @function unbindKeys
 *
 * @param {String|String[]} keys - Key or keys to unbind.
 */
export function unbindKeys(keys) {
  // 0 is the smallest falsy value
  [].concat(keys).map(key => callbacks[key] = 0);
}

/**
 * Check if a key is currently pressed. Use during an `update()` function to perform actions each frame.
 *
 * ```js
 * import { Sprite, initKeys, keyPressed } from 'kontra';
 *
 * initKeys();
 *
 * let sprite = Sprite({
 *   update: function() {
 *     if (keyPressed('left')){
 *       // left arrow pressed
 *     }
 *     else if (keyPressed('right')) {
 *       // right arrow pressed
 *     }
 *
 *     if (keyPressed('up')) {
 *       // up arrow pressed
 *     }
 *     else if (keyPressed('down')) {
 *       // down arrow pressed
 *     }
 *   }
 * });
 * ```
 * @function keyPressed
 *
 * @param {String} key - Key to check for pressed state.
 *
 * @returns {Boolean} `true` if the key is pressed, `false` otherwise.
 */
export function keyPressed(key) {
  return !!pressedKeys[key];
}