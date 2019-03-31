import { getCanvas } from './core.js'
import { on } from './events.js'

// save each object as they are rendered to determine which object
// is on top when multiple objects are the target of an event.
// we'll always use the last frame's object order so we know
// the finalized order of all objects, otherwise an object could ask
// if it's being hovered when it's rendered first even if other objects
// would block it later in the render order
let thisFrameRenderOrder = [];
let lastFrameRenderOrder = [];

let callbacks = {};
let trackedObjects = [];
let pressedButtons = {};

let buttonMap = {
  0: 'left',
  1: 'middle',
  2: 'right'
};

export let pointer = {
  x: 0,
  y: 0,
  radius: 5  // arbitrary size
};

/**
 * Detection collision between a rectangle and a circlevt.
 * @see https://yal.cc/rectangle-circle-intersection-test/
 *
 * @param {object} object - Object to check collision against.
 */
function circleRectCollision(object) {
  let x = object.x;
  let y = object.y;
  if (object.anchor) {
    x -= object.width * object.anchor.x;
    y -= object.height * object.anchor.y;
  }

  let dx = pointer.x - Math.max(x, Math.min(pointer.x, x + object.width));
  let dy = pointer.y - Math.max(y, Math.min(pointer.y, y + object.height));
  return (dx * dx + dy * dy) < (pointer.radius * pointer.radius);
}

/**
 * Get the first on top object that the pointer collides with.
 *
 * @returns {object} First object to collide with the pointer.
 */
function getCurrentObject() {

  // if pointer events are required on the very first frame or without a game
  // loop, use the current frame order array
  let frameOrder = (lastFrameRenderOrder.length ? lastFrameRenderOrder : thisFrameRenderOrder);
  let length = frameOrder.length - 1;
  let object, collides;

  for (let i = length; i >= 0; i--) {
    object = frameOrder[i];

    if (object.collidesWithPointer) {
      collides = object.collidesWithPointer(pointer);
    }
    else {
      collides = circleRectCollision(object);
    }

    if (collides) {
      return object;
    }
  }
}

/**
 * Execute the onDown callback for an object.
 *
 * @param {MouseEvent|TouchEvent} evt
 */
function pointerDownHandler(evt) {

  // touchstart should be treated like a left mouse button
  let button = evt.button !== undefined ? buttonMap[evt.button] : 'left';
  pressedButtons[button] = true;
  pointerHandler(evt, 'onDown');
}

/**
 * Execute the onUp callback for an object.
 *
 * @param {MouseEvent|TouchEvent} evt
 */
function pointerUpHandler(evt) {
  let button = evt.button !== undefined ? buttonMap[evt.button] : 'left';
  pressedButtons[button] = false;
  pointerHandler(evt, 'onUp');
}

/**
 * Track the position of the mousevt.
 *
 * @param {MouseEvent|TouchEvent} evt
 */
function mouseMoveHandler(evt) {
  pointerHandler(evt, 'onOver');
}

/**
 * Reset pressed buttons.
 */
function blurEventHandler() {
  pressedButtons = {};
}

/**
 * Find the first object for the event and execute it's callback function
 *
 * @param {MouseEvent|TouchEvent} evt
 * @param {string} eventName - Which event was called.
 */
function pointerHandler(evt, eventName) {
  let canvas = getCanvas();

  if (!canvas) return;

  let clientX, clientY;

  if (['touchstart', 'touchmove', 'touchend'].indexOf(evt.type) !== -1) {
    clientX = (evt.touches[0] || evt.changedTouches[0]).clientX;
    clientY = (evt.touches[0] || evt.changedTouches[0]).clientY;
  } else {
    clientX = evt.clientX;
    clientY = evt.clientY;
  }

  let ratio = canvas.height / canvas.offsetHeight;
  let rect = canvas.getBoundingClientRect();
  let x = (clientX - rect.left) * ratio;
  let y = (clientY - rect.top) * ratio;

  pointer.x = x;
  pointer.y = y;

  evt.preventDefault();
  let object = getCurrentObject();
  if (object && object[eventName]) {
    object[eventName](evt);
  }

  if (callbacks[eventName]) {
    callbacks[eventName](evt, object);
  }
}

/**
 * Add pointer event listeners.
 */
export function initPointer() {
  let canvas = getCanvas();

  canvas.addEventListener('mousedown', pointerDownHandler);
  canvas.addEventListener('touchstart', pointerDownHandler);
  canvas.addEventListener('mouseup', pointerUpHandler);
  canvas.addEventListener('touchend', pointerUpHandler);
  canvas.addEventListener('blur', blurEventHandler);
  canvas.addEventListener('mousemove', mouseMoveHandler);
  canvas.addEventListener('touchmove', mouseMoveHandler);

  // reset object render order on every new frame
  on('tick', () => {
    lastFrameRenderOrder.length = 0;

    thisFrameRenderOrder.map(object => {
      lastFrameRenderOrder.push(object);
    });

    thisFrameRenderOrder.length = 0;
  });
}

/**
 * Register object to be tracked by pointer events.
 *
 * @param {object|object[]} objects - Object or objects to track.
 */
export function track(objects) {
  [].concat(objects).map(object => {

    // override the objects render function to keep track of render order
    if (!object._r) {
      object._r = object.render;

      object.render = function() {
        thisFrameRenderOrder.push(this);
        this._r();
      };

      trackedObjects.push(object);
    }
  });
}

/**
 * Remove object from being tracked by pointer events.
 *
 * @param {object|object[]} objects - Object or objects to stop tracking.
 */
export function untrack(objects) {
  [].concat(objects).map(object => {

    // restore original render function to no longer track render order
    object.render = object._r;
    object._r = 0;  // 0 is the shortest falsy value

    let index = trackedObjects.indexOf(object);
    if (index !== -1) {
      trackedObjects.splice(index, 1);
    }
  })
}

/**
 * Returns whether a tracked object is under the pointer.
 *
 * @param {object} object - Object to check
 *
 * @returns {boolean}
 */
export function pointerOver(object) {
  if (!trackedObjects.includes(object)) return false;

  return getCurrentObject() === object;
}

/**
 * Register a function to be called on pointer down.
 *
 * @param {function} callback - Function to execute
 */
export function onPointerDown(callback) {
  callbacks.onDown = callback;
}

/**
 * Register a function to be called on pointer up.
 *
 * @param {function} callback - Function to execute
 */
export function onPointerUp(callback) {
  callbacks.onUp = callback;
}

/**
 * Returns whether the button is pressed.
 *
 * @param {string} button - Button to check for press.
 *
 * @returns {boolean}
 */
export function pointerPressed(button) {
  return !!pressedButtons[button]
}