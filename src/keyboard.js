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
 * Below is a list of keys that are provided by default. If you need to extend this list, you can use the [keyMap](api/keyboard#keyMap) property.
 *
 * - a-z
 * - 0-9
 * - enter, esc, space, left, up, right, down
 * @sectionName Available Keys
 */

let keydownCallbacks = {};
let keyupCallbacks = {};
let pressedKeys = {};

/**
 * A map of [KeyboardEvent code values](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/code/code_values) to key names. Add to this object to expand the list of [available keys](api/keyboard#available-keys).
 *
 * ```js
 * import { keyMap, bindKeys } from 'kontra';
 *
 * keyMap['ControlRight'] = 'ctrl';
 *
 * bindKeys('ctrl', function(e) {
 *   // handle ctrl key
 * });
 * ```
 * @property {{[key in (String|Number)]: string}} keyMap
 */
export let keyMap = {
  // named keys
  'Enter': 'enter',
  'Escape': 'esc',
  'Space': 'space',
  'ArrowLeft': 'left',
  'ArrowUp': 'up',
  'ArrowRight': 'right',
  'ArrowDown': 'down'
};

/**
 * Execute a function that corresponds to a keyboard key.
 *
 * @param {KeyboardEvent} evt
 */
function keydownEventHandler(evt) {
  let key = keyMap[evt.code];
  pressedKeys[key] = true;

  if (keydownCallbacks[key]) {
    keydownCallbacks[key](evt);
  }
}

/**
 * Set the released key to not being pressed.
 *
 * @param {KeyboardEvent} evt
 */
function keyupEventHandler(evt) {
  let key = keyMap[evt.code];
  pressedKeys[key] = false;

  if (keyupCallbacks[key]) {
    keyupCallbacks[key](evt);
  }
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
    keyMap[i + 65] = keyMap['Key' + String.fromCharCode(i + 65)] = String.fromCharCode(i + 97);
  }

  // numeric keys
  for (i = 0; i < 10; i++) {
    keyMap[48+i] = keyMap['Digit'+i] = ''+i;
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
 * }, 'keyup');
 * bindKeys(['enter', 'space'], function(e) {
 *   e.preventDefault();
 *   // fire gun
 * });
 * ```
 * @function bindKeys
 *
 * @param {String|String[]} keys - Key or keys to bind.
 * @param {(evt: KeyboardEvent) => void} callback - The function to be called when the key is pressed.
 * @param {'keydown'|'keyup'} [handler=keydown] - Whether to bind to keydown or keyup events.
 */
export function bindKeys(keys, callback, handler='keydown') {
  const callbacks = handler == 'keydown' ? keydownCallbacks : keyupCallbacks;
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
 * @param {'keydown'|'keyup'} [handler=keydown] - Whether to unbind from keydown or keyup events.
 */
export function unbindKeys(keys, handler='keydown') {
  const callbacks = handler == 'keydown' ? keydownCallbacks : keyupCallbacks;
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
