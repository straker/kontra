/**
 * A simple gamepad API. You can use it move the main sprite or respond to gamepad events.
 *
 * *NOTE:* Gamepad support requires using a secure context (HTTPS) and the [GameLoop](/api/gameLoop) (since the gamepad state must be checked every frame as there are no global event listeners for gamepad button / axes events).
 *
 * ```js
 * import { initGamepad, GameLoop, gamepadPressed } from 'kontra';
 *
 * // this function must be called first before gamepad
 * // functions will work
 * initGamepad();
 *
 * function update() {
 *   if (gamepadPressed('dpadleft')) {
 *     // move left
 *   }
 * }
 *
 * // using the GameLoop is required
 * let loop = kontra.GameLoop({
 *   // ...
 * })
 * loop.start();
 * ```
 * @sectionName Gamepad
 */
import { on } from './events.js';

/**
 * Below is a list of button names that are provided by default. If you need to extend or modify this list, you can use the [gamepadMap](api/gamepad#gamepadMap) property.
 *
 * - south _(Xbox controller: A; PS4 controller: cross)_
 * - east _(Xbox controller: B; PS4 controller: circle)_
 * - west _(Xbox controller: X; PS4 controller: square)_
 * - north _(Xbox controller: Y; PS4 controller: triangle)_
 * - leftshoulder _(Xbox controller: LB; PS4 controller: L1)_
 * - rightshoulder _(Xbox controller: RB; PS4 controller: R1)_
 * - lefttrigger _(Xbox controller: LT; PS4 controller: L2)_
 * - righttrigger _(Xbox controller: RT; PS4 controller: R2)_
 * - select _(Xbox controller: back/view; PS4 controller: share)_
 * - start _(Xbox controller: start/menu; PS4 controller: options)_
 * - leftstick
 * - rightstick
 * - dpadup
 * - dpaddown
 * - dpadleft
 * - dpadright
 *
 * @sectionName Available Buttons
 */

let gamepads = [];
let gamepaddownCallbacks = {};
let gamepadupCallbacks = {};

/**
 * A map of Gamepad button indices to button names. Modify this object to expand the list of [available buttons](api/gamepad#available-buttons). By default, the map uses the Xbox and PS4 controller button indicies.
 *
 * ```js
 * import { gamepadMap, gamepadPressed } from 'kontra';
 *
 * gamepadMap[2] = 'buttonWest';
 *
 * if (gamepadPressed('buttonWest')) {
 *   // handle west face button
 * }
 * ```
 * @property {{[key: number]: String}} gamepadMap
 */
export let gamepadMap = {
  0: 'south',
  1: 'east',
  2: 'west',
  3: 'north',
  4: 'leftshoulder',
  5: 'rightshoulder',
  6: 'lefttrigger',
  7: 'righttrigger',
  8: 'select',
  9: 'start',
  10: 'leftstick',
  11: 'rightstick',
  12: 'dpadup',
  13: 'dpaddown',
  14: 'dpadleft',
  15: 'dpadright'
};

/**
 * Keep track of the connected gamepads so multiple gamepads can be used at a time.
 */
function gamepadConnectedHandler(event) {
  gamepads[event.gamepad.index] = {
    pressedButtons: {},
    axes: {}
  };
}

/**
 * Remove disconnected gamepads
 */
function gamepadDisconnectedHandler(event) {
  delete gamepads[event.gamepad.index];
}

/**
 * Reset pressed buttons and axes information.
 */
function blurEventHandler() {
  gamepads.forEach(gamepad => {
    gamepad.pressedButtons = {};
    gamepad.axes = {};
  });
}

/**
 * Update the gamepad state. Call this function every frame only if you are not using the [GameLoop](/api/gameLoop). Otherwise it is called automatically.
 *
 * ```js
 * import { initGamepad, updateGamepad, gamepadPressed } from 'kontra';
 *
 * initGamepad();
 *
 * function update() {
 *   // not using GameLoop so need to manually call update state
 *   updateGamepad();
 *
 *   if (gamepadPressed('dpadleft')) {
 *     // move left
 *   }
 * }
 *
 * ```
 * @function updateGamepad
 */
export function updateGamepad() {
  // in Chrome this a GamepadList but in Firefox it's an array
  let pads = navigator.getGamepads
    ? navigator.getGamepads()
    : navigator.webkitGetGamepads
    ? navigator.webkitGetGamepads
    : [];

  for (let i = 0; i < pads.length; i++) {
    let gamepad = pads[i];

    // a GamepadList will have a default length of 4 but use null for
    // any index that doesn't have a gamepad connected
    if (!gamepad) {
      continue;
    }

    gamepad.buttons.forEach((button, index) => {
      let buttonName = gamepadMap[index];
      let { pressed } = button;
      let { pressedButtons } = gamepads[gamepad.index];
      let state = pressedButtons[buttonName];

      // if the button was not pressed before and is now pressed that's
      // a gamepaddown event
      if (!state && pressed) {
        [gamepaddownCallbacks[gamepad.index], gamepaddownCallbacks].map(callback => {
          callback?.[buttonName]?.(gamepad, button);
        });
      }
      // if the button was pressed before and is now not pressed that's
      // a gamepadup event
      else if (state && !pressed) {
        [gamepadupCallbacks[gamepad.index], gamepadupCallbacks].map(callback => {
          callback?.[buttonName]?.(gamepad, button);
        });
      }

      pressedButtons[buttonName] = pressed;
    });

    let { axes } = gamepads[gamepad.index];
    axes.leftstickx = gamepad.axes[0];
    axes.leftsticky = gamepad.axes[1];
    axes.rightstickx = gamepad.axes[2];
    axes.rightsticky = gamepad.axes[3];
  }
}

/**
 * Initialize gamepad event listeners. This function must be called before using other gamepad functions.
 * @function initGamepad
 */
export function initGamepad() {
  window.addEventListener('gamepadconnected', gamepadConnectedHandler);
  window.addEventListener('gamepaddisconnected', gamepadDisconnectedHandler);
  window.addEventListener('blur', blurEventHandler);

  // update gamepad state each frame
  on('tick', updateGamepad);
}

/**
 * Register a function to be called when a gamepad button is pressed. Takes a single button or an array of buttons. Is passed the [Gamepad](https://developer.mozilla.org/en-US/docs/Web/API/Gamepad) and the [GamepadButton](https://developer.mozilla.org/en-US/docs/Web/API/GamepadButton) that was pressed as parameters.
 *
 * When registering the function, you have the choice of registering to a specific gamepad or to all gamepads. To register to a specific gamepad, pass the desired gamepad index as the `gamepad` option. If the `gamepad` option is ommited the callback is bound to all gamepads instead of a specific one.
 *
 * You can register a callback for both a specific gamepad and for all gamepads in two different calls. When this happens, the specific gamepad callback will be called first and then the global one.
 *
 * ```js
 * import { initGamepad, onGamepad } from 'kontra';
 *
 * initGamepad();
 *
 * onGamepad('start', function(gamepad, button) {
 *   // pause the game
 * });
 * onGamepad(['south', 'rightstick'], function(gamepad, button) {
 *   // fire gun
 * });
 *
 * onGamepad('south', function() {
 *   // handle south button
 * }, {
 *   gamepad: 0  // register just for the gamepad at index 0
 * });
 * ```
 * @function onGamepad
 *
 * @param {String|String[]} buttons - Button or buttons to regsiter callback for.
 * @param {(gamepad: Gamepad, button: GamepadButton) => void} callback - The function to be called when the button is pressed.
 * @param {Object} [options] - Registration options.
 * @param {Number} [options.gamepad] - Gamepad index. Defaults to registerting for all gamepads.
 * @param {'gamepaddown'|'gamepadup'} [options.handler='gamepaddown'] - Whether to register to the gamepaddown or gamepadup event.
 */
export function onGamepad(buttons, callback, { gamepad, handler = 'gamepaddown' } = {}) {
  const callbacks = handler == 'gamepaddown' ? gamepaddownCallbacks : gamepadupCallbacks;

  // smaller than doing `Array.isArray(buttons) ? buttons : [buttons]`
  [].concat(buttons).map(button => {
    if (isNaN(gamepad)) {
      callbacks[button] = callback;
    } else {
      callbacks[gamepad] = callbacks[gamepad] || {};
      callbacks[gamepad][button] = callback;
    }
  });
}

/**
 * Unregister the callback function for a set of buttons. Takes a single button or an array of buttons.
 *
 * When unregistering a button, you have the choice to unregister from a specific gamepad or from all gamepads. To unregister from a specific gamepad, pass the desired gamepad index as the `gamepad` option. If the `gamepad` option is ommited the callback is unregistered from all gamepads instead of a specific one.
 *
 * ```js
 * import { offGamepad } from 'kontra';
 *
 * offGamepad('start');
 * offGamepad(['south', 'rightstick']);
 *
 * offGamepad('south', {
 *   gamepad: 0  // unregister from just the gamepad at index 0
 * });
 * ```
 * @function offGamepad
 *
 * @param {String|String[]} buttons - Button or buttons to unregister callback for.
 * @param {Object} [options] - Unregister options.
 * @param {Number} [options.gamepad] - Gamepad index. Defaults to unregistering from all gamepads.
 * @param {'gamepaddown'|'gamepadup'} [options.handler='gamepaddown'] - Whether to unregister from gamepaddown or gamepadup event.
 */
export function offGamepad(buttons, { gamepad, handler = 'gamepaddown' } = {}) {
  const callbacks = handler == 'gamepaddown' ? gamepaddownCallbacks : gamepadupCallbacks;

  // smaller than doing `Array.isArray(buttons) ? buttons : [buttons]`
  [].concat(buttons).map(button => {
    if (isNaN(gamepad)) {
      delete callbacks[button];
    } else {
      callbacks[gamepad] = callbacks[gamepad] || {};
      delete callbacks[gamepad][button];
    }
  });
}

/**
 * Check if a button is currently pressed. Use during an `update()` function to perform actions each frame.
 *
 * You can check if the button is pressed on all gamepads or just a specific gamepad. To check a specific gamepad, pass the desired gamepad index as the `gamepad` option. If the `gamepad` option is ommited all gamepads will be checked and if at least one is pressing the button the function will return `true`.
 *
 * ```js
 * import { Sprite, initGamepad, gamepadPressed } from 'kontra';
 *
 * initGamepad();
 *
 * let sprite = Sprite({
 *   update: function() {
 *     if (gamepadPressed('dpadleft')){
 *       // left dpad pressed
 *     }
 *     else if (gamepadPressed('dpadright')) {
 *       // right dpad pressed
 *     }
 *
 *     if (gamepadPressed('dpadup')) {
 *       // up dpad pressed
 *     }
 *     else if (gamepadPressed('dpaddown')) {
 *       // down dpad pressed
 *     }
 *   }
 * });
 * ```
 * @function gamepadPressed
 *
 * @param {String} button - Button name to check for pressed state.
 * @param {Object} [options] - Pressed options.
 * @param {Number} [options.gamepad] - Index of the gamepad to check for pressed state.
 *
 * @returns {Boolean} `true` if the button is pressed, `false` otherwise.
 */
export function gamepadPressed(button, { gamepad } = {}) {
  if (isNaN(gamepad)) {
    return gamepads.some(pad => pad.pressedButtons[button]);
  }
  // this won't exist until the gamepad has been connected
  if (gamepads[gamepad]) {
    return !!gamepads[gamepad].pressedButtons[button];
  }

  return false;
}

/**
 * Get the value of a specific gamepad axis.
 *
 * Available axes are:
 *
 * - leftstickx
 * - leftsticky
 * - rightstickx
 * - rightsticky
 *
 * ```js
 * import { Sprite, initGamepad, gamepadAxis } from 'kontra';
 *
 * initGamepad();
 *
 * let sprite = Sprite({
 *   update: function() {
 *     let axisX = gamepadAxis('leftstickx', 0);
 *     let axisY = gamepadAxis('leftsticky', 0);
 *
 *     if (axisX < -0.4) {
 *       // move left
 *     }
 *     else if (axisX > 0.4) {
 *       // move right
 *     }
 *
 *     if (axisY < -0.4) {
 *       // move up
 *     }
 *     else if (axisY > 0.4) {
 *       // move down
 *     }
 *   }
 * });
 * ```
 * @function gamepadAxis
 *
 * @param {String} name - Name of the axis.
 * @param {Number} gamepad - Index of the gamepad to check.
 *
 * @returns {Number} The value of the axis between -1.0 and 1.0.
 */
export function gamepadAxis(name, gamepad) {
  return gamepads[gamepad]?.axes[name] || 0;
}
