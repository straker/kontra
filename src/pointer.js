import { getCanvas } from './core.js'
import { on } from './events.js'

/**
 * A simple pointer API. You can use it move the main sprite or respond to a pointer event. Works with both mouse and touch events.
 *
 * Pointer events can be added on a global level or on individual sprites or objects. Before an object can receive pointer events, you must tell the pointer which objects to track and the object must haven been rendered to the canvas using `object.render()`.
 *
 * After an object is tracked and rendered, you can assign it an `onDown()`, `onUp()`, or `onOver()` functions which will be called whenever a pointer down, up, or over event happens on the object.
 *
 * ```js
 * import { initPointer, track, Sprite } from 'kontra';
 *
 * // this function must be called first before pointer
 * // functions will work
 * initPointer();
 *
 * let sprite = Sprite({
 *   onDown: function() {
 *     // handle on down events on the sprite
 *   },
 *   onUp: function() {
 *     // handle on up events on the sprite
 *   },
 *   onOver: function() {
 *     // handle on over events on the sprite
 *   }
 * });
 *
 * track(sprite);
 * sprite.render();
 * ```
 *
 * By default, the pointer is treated as a circle and will check for collisions against objects assuming they are rectangular (have a width and height property).
 *
 * If you need to perform a different type of collision detection, assign the object a `collidesWithPointer()` function and it will be called instead. The function is passed the pointer object. Use this function to determine how the pointer circle should collide with the object.
 *
 * ```js
 * import { Sprite } from 'kontra';

 * let sprite = Srite({
 *   x: 10,
 *   y: 10,
 *   radius: 10
 *   collidesWithPointer: function(pointer) {
 *     // perform a circle v circle collision test
 *     let dx = pointer.x - this.x;
 *     let dy = pointer.y - this.y;
 *     return Math.sqrt(dx * dx + dy * dy) < this.radius;
 *   }
 * });
 * ```
 * @sectionName Pointer
 */

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

/**
 * Below is a list of buttons that you can use.
 *
 * - left, middle, right
 * @sectionName Available Buttons
 */
let buttonMap = {
  0: 'left',
  1: 'middle',
  2: 'right'
};

/**
 * Object containing the `radius` and current `x` and `y` position of the pointer relative to the top-left corner of the canvas.
 *
 * ```js
 * import { initPointer, pointer } from 'kontra';
 *
 * initPointer();
 *
 * console.log(pointer);  //=> { x: 100, y: 200, radius: 5 };
 * ```
 * @property {Object} pointer
 */
export let pointer = {
  x: 0,
  y: 0,
  radius: 5  // arbitrary size
};

/**
 * Detection collision between a rectangle and a circlevt.
 * @see https://yal.cc/rectangle-circle-intersection-test/
 *
 * @param {Object} object - Object to check collision against.
 */
function circleRectCollision(object, _pntr) {
  const pntr = _pntr || pointer;

  let x = object.x;
  let y = object.y;
  if (object.anchor) {
    x -= object.width * object.anchor.x;
    y -= object.height * object.anchor.y;
  }

  let dx = pntr.x - Math.max(x, Math.min(pntr.x, x + object.width));
  let dy = pntr.y - Math.max(y, Math.min(pntr.y, y + object.height));
  return (dx * dx + dy * dy) < (pntr.radius * pntr.radius);
}

/**
 * Get the first on top object that the pointer collides with.
 *
 * @returns {Object} First object to collide with the pointer.
 */
function getCurrentObject(_pntr) {
  const pntr = _pntr || pointer;

  // if pointer events are required on the very first frame or without a game
  // loop, use the current frame order array
  let frameOrder = (lastFrameRenderOrder.length ? lastFrameRenderOrder : thisFrameRenderOrder);
  let length = frameOrder.length - 1;
  let object, collides;

  for (let i = length; i >= 0; i--) {
    object = frameOrder[i];

    if (object.collidesWithPointer) {
      collides = object.collidesWithPointer(pntr);
    }
    else {
      collides = circleRectCollision(object, pntr);
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
  let ratio = canvas.height / canvas.offsetHeight;
  let rect = canvas.getBoundingClientRect();

  let isTouchEvent = ['touchstart', 'touchmove', 'touchend'].indexOf(evt.type) !== -1;
  if (isTouchEvent) {
    // Update pointer.touches
    pointer.touches = {};
    for (var i = 0; i < evt.touches.length; i++) {
      pointer.touches[evt.touches[i].identifier] = {
        id: evt.touches[i].identifier,
        x: (evt.touches[i].clientX - rect.left) * ratio,
        y: (evt.touches[i].clientY - rect.top) * ratio,
        changed: false
      };
    }
    // Handle all touches
    for (var i = evt.changedTouches.length; i--;) {
      const id = evt.changedTouches[i].identifier;
      if (typeof pointer.touches[id] !== "undefined") {
        pointer.touches[id].changed = true;
      }

      clientX = evt.changedTouches[i].clientX; // Save for later
      clientY = evt.changedTouches[i].clientY;

      // Trigger events
      let object = getCurrentObject({
        id,
        x: (clientX - rect.left) * ratio,
        y: (clientY - rect.top) * ratio,
        radius: pointer.radius // only for collision
      });

      if (object && object[eventName]) {
        object[eventName](evt);
      }

      if (callbacks[eventName]) {
        callbacks[eventName](evt, object);
      }
    }
  } else {
    clientX = evt.clientX;
    clientY = evt.clientY;
  }

  pointer.x = (clientX - rect.left) * ratio;
  pointer.y = (clientY - rect.top) * ratio;

  evt.preventDefault();

  if (!isTouchEvent) { // Prevent double touch event
    let object = getCurrentObject();
    if (object && object[eventName]) {
      object[eventName](evt);
    }

    if (callbacks[eventName]) {
      callbacks[eventName](evt, object);
    }
  }
}

/**
 * Initialize pointer event listeners. This function must be called before using other pointer functions.
 * @function initPointer
 */
export function initPointer() {
  let canvas = getCanvas();

  canvas.addEventListener('mousedown', pointerDownHandler);
  canvas.addEventListener('touchstart', pointerDownHandler);
  canvas.addEventListener('mouseup', pointerUpHandler);
  canvas.addEventListener('touchend', pointerUpHandler);
  canvas.addEventListener('touchcancel', pointerUpHandler);
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
 * Begin tracking pointer events for a set of objects. Takes a single object or an array of objects.
 *
 * ```js
 * import { initPointer, track } from 'kontra';
 *
 * initPointer();
 *
 * track(obj);
 * track([obj1, obj2]);
 * ```
 * @function track
 *
 * @param {Object|Object[]} objects - Objects to track.
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
* Remove the callback function for a bound set of objects.
 *
 * ```js
 * import { untrack } from 'kontra';
 *
 * untrack(obj);
 * untrack([obj1, obj2]);
 * ```
 * @function untrack
 *
 * @param {Object|Object[]} objects - Object or objects to stop tracking.
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
 * Check to see if the pointer is currently over the object. Since multiple objects may be rendered on top of one another, only the top most object under the pointer will return true.
 *
 * ```js
 * import { initPointer, track, pointer, pointerOver, Sprite } from 'kontra';
 *
 * initPointer();
 *
 * let sprite1 = Sprite({
 *   x: 10,
 *   y: 10,
 *   width: 10,
 *   height: 10
 * });
 * let sprite2 = Sprite({
 *   x: 15,
 *   y: 10,
 *   width: 10,
 *   height: 10
 * });
 *
 * track([sprite1, sprite2]);
 *
 * sprite1.render();
 * sprite2.render();
 *
 * pointer.x = 14;
 * pointer.y = 15;
 *
 * console.log(pointerOver(sprite1));  //=> false
 * console.log(pointerOver(sprite2));  //=> true
 * ```
 * @function pointerOver
 *
 * @param {Object} object - The object to check if the pointer is over.
 *
 * @returns {Boolean} `true` if the pointer is currently over the object, `false` otherwise.
 */
export function pointerOver(object) {
  if (!trackedObjects.includes(object)) return false;

  return getCurrentObject() === object;
}

/**
 * Register a function to be called on all pointer down events. Is passed the original Event and the target object (if there is one).
 *
 * ```js
 * import { initPointer, onPointerDown } from 'kontra';
 *
 * initPointer();
 *
 * onPointerDown(function(e, object) {
 *   // handle pointer down
 * })
 * ```
 * @function onPointerDown
 *
 * @param {Function} callback - Function to call on pointer down.
 */
export function onPointerDown(callback) {
  callbacks.onDown = callback;
}

/**
* Register a function to be called on all pointer up events. Is passed the original Event and the target object (if there is one).
 *
 * ```js
 * import { initPointer, onPointerUp } from 'kontra';
 *
 * initPointer();
 *
 * onPointerUp(function(e, object) {
 *   // handle pointer up
 * })
 * ```
 * @function onPointerUp
 *
 * @param {Function} callback - Function to call on pointer up.
 */
export function onPointerUp(callback) {
  callbacks.onUp = callback;
}

/**
 * Check if a button is currently pressed. Use during an `update()` function to perform actions each frame.
 *
 * ```js
 * import { initPointer, pointerPressed } from 'kontra';
 *
 * initPointer();
 *
 * Sprite({
 *   update: function() {
 *     if (pointerPressed('left')){
 *       // left mouse button pressed
 *     }
 *     else if (pointerPressed('right')) {
 *       // right mouse button pressed
 *     }
 *   }
 * });
 * ```
 * @function pointerPressed
 *
 * @param {String} button - Button to check for pressed state.
 *
 * @returns {Boolean} `true` if the button is pressed, `false` otherwise.
 */
export function pointerPressed(button) {
  return !!pressedButtons[button]
}
