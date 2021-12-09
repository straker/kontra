import {
  gamepadMap,
  initGamepad,
  onGamepad,
  offGamepad
} from './gamepad.js';
import {
  gestureMap,
  initGesture,
  onGesture,
  offGesture
} from './gesture.js';
import { keyMap, initKeys, onKey, offKey } from './keyboard.js';
import { initPointer, onPointer, offPointer } from './pointer.js';

/**
 * A wrapper for initializing and handling multiple inputs at once (keyboard, gamepad, gesture, pointer).
 *
 * ```js
 * import { initInput, onInput } from 'kontra';
 *
 * // this function must be called first before input
 * // functions will work
 * initInput();
 *
 * onInput(['arrowleft', 'swipeleft', 'dpadleft'], () => {
 *   // move left
 * });
 * ```
 * @sectionName Input
 */

/**
 * Check if string is a value of an object.
 * @param {String} value - Value to look for.
 * @param {Object} map - Object to look in.
 *
 * @returns {Boolean} True if the object contains the value, false otherwise.
 */
function contains(value, map) {
  return Object.values(map).includes(value);
}

/**
 * Check to see if input name is a gesture input.
 * @param {String} value - Value to look for.
 *
 * @returns {Boolean} True if value is a gesture input, false otherwise.
 */
function isGesture(value) {
  return Object.keys(gestureMap).some(name => value.startsWith(name));
}

/**
 * Initialize input event listeners. This function must be called before using other input functions.
 * @function initInput
 *
 * @param {Object} [options] - Input options.
 * @param {Object} [options.pointer] - [Pointer options](/api/pointer#initPointer).
 *
 * @returns {{pointer: {x: Number, y: Number, radius: Number, canvas: HTMLCanvasElement, touches: Object}}} Object with `pointer` property which is the pointer object for the canvas.
 */
export function initInput(options = {}) {
  initKeys();
  let pointer = initPointer(options.pointer);
  initGesture();
  initGamepad();

  return { pointer };
}

/**
 * Register a function to be called on an input event. Takes a single input or an array of inputs. See the [keyboard](api/keyboard#available-keys), [gamepad](api/gamepad#available-buttons), [gesture](api/gesture#available-gestures), and [pointer](/api/pointer#onPointer) docs for the lists of available input names.
 *
 * ```js
 * import { initInput, onInput } from 'kontra';
 *
 * initInput();
 *
 * onInput('p', function(e) {
 *   // pause the game
 * });
 * onInput(['enter', 'down', 'south'], function(e) {
 *   // fire gun on enter key, mouse down, or gamepad south button
 * });
 * ```
 * @function onInput
 *
 * @param {String|String[]} inputs - Inputs or inputs to register callback for.
 * @param {Function} callback -  The function to be called on the input event.
 * @param {Object} [options] - Input options.
 * @param {Object} [options.gamepad] - [onGamepad options](/api/gamepad#onGamepad).
 * @param {Object} [options.key] - [onKey options](/api/keyboard#onKey).
 */
export function onInput(inputs, callback, { gamepad, key } = {}) {
  [].concat(inputs).map(input => {
    if (contains(input, gamepadMap)) {
      onGamepad(input, callback, gamepad);
    } else if (isGesture(input)) {
      onGesture(input, callback);
    } else if (contains(input, keyMap)) {
      onKey(input, callback, key);
    } else if (['down', 'up'].includes(input)) {
      onPointer(input, callback);
    }
    // @ifdef DEBUG
    else {
      throw new TypeError(`"${input}" is not a valid input name`);
    }
    // @endif
  });
}

/**
 * Unregister the callback function for an input. Takes a single input or an array of inputs.
 *
 * ```js
 * import { offInput } from 'kontra';
 *
 * offInput('left');
 * offInput(['enter', 'down', 'swipeleft']);
 * ```
 * @function offInput
 *
 * @param {String|String[]} inputs - Inputs or inputs to unregister callback for.
 * @param {Object} [options] - Input options.
 * @param {Object} [options.gamepad] - [offGamepad options](/api/gamepad#offGamepad).
 * @param {Object} [options.key] - [offKey options](/api/keyboard#offKey).
 */
export function offInput(inputs, { gamepad, key } = {}) {
  [].concat(inputs).map(input => {
    if (contains(input, gamepadMap)) {
      offGamepad(input, gamepad);
    } else if (isGesture(input)) {
      offGesture(input);
    } else if (contains(input, keyMap)) {
      offKey(input, key);
    } else if (['down', 'up'].includes(input)) {
      offPointer(input);
    }
  });
}
