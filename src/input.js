import { gamepadMap, initGamepad, onGamepad, offGamepad } from './gamepad.js';
import { gestureMap, initGesture, onGesture, offGesture } from './gesture.js';
import { keyMap, initKeys, onKey, offKey } from './keyboard.js';
import { initPointer, onPointer, offPointer } from './pointer.js';

function contains(value, map) {
  return Object.values(map).includes(value);
}

function isGesture(value) {
  return Object.keys(gestureMap).some(name => value.startsWith(name));
}

export function initInput(options = {}) {
  initKeys();
  initPointer(options.pointer);
  initGesture();
  initGamepad();
}

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

export function offInput(inputs, callback, { gamepad, key } = {}) {
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
