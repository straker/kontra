import { on } from './events.js'

let gamepads = {};

/**
 * Keep track of the connected gamepads so multiple gamepads can be used at a time.
 */
function gamepadConnectedHandler(event) {
  gamepads[event.gamepad.index] = {
    pressedButtons: {}
  };
}

/**
 * Initialize gamepad event listeners. This function must be called before using other gamepad functions.
 * @function initGamepad
 */
export function initGamepad() {
  window.addEventListener('gamepadconnected', gamepadConnectedHandler);

  // update gamepad state each frame
  on('tick', () => {
    let pads = navigator.getGamepads
      ? navigator.getGamepads()
      : navigator.webkitGetGamepads
        ? navigator.webkitGetGamepads
        : [];

    // in Chrome this a GamepadList but in Firefox it's an array
    for (let i = 0; i < pads.length; i++) {
      let gamepad = pads[i];
      gamepad.buttons.forEach((button, index) => {
        gamepads[gamepad.index].pressedButtons[index] = button.pressed;
      });
    }
  });
}

/**
 *
 */
export function gamepadPressed(gamepadIndex, button) {
  return gamepads[gamepadIndex].pressedButtons[button];
}