/**
 * Simulate a keyboard event.
 * @param {string} type - Type of keyboard event.
 * @param {object} [config] - Additional settings for the event.
 * @param {HTMLElement} [node=window] - Node to dispatch the event on.
 */
export function simulateEvent(type, config = {}, node = window) {
  let evt = new Event(type);

  for (let prop in config) {
    evt[prop] = config[prop];
  }

  if (config.async) {
    window.setTimeout(() => node.dispatchEvent(evt), 100);
  } else {
    node.dispatchEvent(evt);
  }

  return evt;
}

/**
 * Simulate a gamepad event.
 * @param {string} type - Type of gamepad event.
 * @param {object} gamepad - Gamepad object.
 * @param {number} gamepad.index - Index of the gamepad
 * @param {Object[]} [gamepad.buttons] - GamepadButtons and their state
 * @param {Number[]} [gamepad.axes] - Gamepad axes values
 *
 */
export function simulateGamepadEvent(type, gamepad) {
  let evt = new GamepadEvent(type);

  // evt.gamepad is read-only so we need to override it
  Object.defineProperty(evt, 'gamepad', {
    value: {
      buttons: [],
      axes: [],
      ...gamepad
    }
  });

  window.dispatchEvent(evt);

  return evt;
}

export let getGamepadsStub = [];
export function createGamepad(index = getGamepadsStub.length) {
  let gamepadObj = {
    index,
    connected: true,
    buttons: [],
    axes: [0, 0, 0, 0]
  };
  for (let i = 0; i < 16; i++) {
    gamepadObj.buttons[i] = { pressed: false };
  }

  simulateGamepadEvent('gamepadconnected', gamepadObj);
  getGamepadsStub[index] = gamepadObj;
}
