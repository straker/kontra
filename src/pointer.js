import { getCanvas } from './core.js';
import { on } from './events.js';
import { getWorldRect } from './utils.js';

/**
 * A simple pointer API. You can use it move the main sprite or respond to a pointer event. Works with both mouse and touch events.
 *
 * Pointer events can be added on a global level or on individual sprites or objects. Before an object can receive pointer events, you must tell the pointer which objects to track and the object must haven been rendered to the canvas using `object.render()`.
 *
 * After an object is tracked and rendered, you can assign it an `onDown()`, `onUp()`, `onOver()`, or `onOut()` functions which will be called whenever a pointer down, up, over, or out event happens on the object.
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
 *   },
 *   onOut: function() {
 *     // handle on out events on the sprite
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
let pointers = new WeakMap();
let callbacks = {};
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
 * Get the pointer object which contains the `radius`, current `x` and `y` position of the pointer relative to the top-left corner of the canvas, and which `canvas` the pointer applies to.
 *
 * ```js
 * import { initPointer, getPointer } from 'kontra';
 *
 * initPointer();
 *
 * console.log(getPointer());  //=> { x: 100, y: 200, radius: 5, canvas: <canvas> };
 * ```
 *
 * @function getPointer
 *
 * @param {HTMLCanvasElement} [canvas] - The canvas which maintains the pointer. Defaults to [core.getCanvas()](api/core#getCanvas).
 *
 * @returns {{x: Number, y: Number, radius: Number, canvas: HTMLCanvasElement, touches: Object}} pointer with properties `x`, `y`, and `radius`. If using touch events, also has a `touches` object with keys of the touch identifier and the x/y position of the touch as the value.
 */
export function getPointer(canvas = getCanvas()) {
  return pointers.get(canvas);
}

/**
 * Detection collision between a rectangle and a circlevt.
 * @see https://yal.cc/rectangle-circle-intersection-test/
 *
 * @param {Object} object - Object to check collision against.
 */
function circleRectCollision(object, pointer) {
  let { x, y, width, height } = getWorldRect(object);

  let dx = pointer.x - Math.max(x, Math.min(pointer.x, x + width));
  let dy = pointer.y - Math.max(y, Math.min(pointer.y, y + height));
  return (dx * dx + dy * dy) < (pointer.radius * pointer.radius);
}

/**
 * Get the first on top object that the pointer collides with.
 *
 * @param {Object} pointer - The pointer object
 *
 * @returns {Object} First object to collide with the pointer.
 */
function getCurrentObject(pointer) {

  // if pointer events are required on the very first frame or
  // without a game loop, use the current frame
  let renderedObjects = pointer._lf.length ?
    pointer._lf :
    pointer._cf;

  for (let i = renderedObjects.length - 1; i >= 0; i--) {
    let object = renderedObjects[i];
    let collides = object.collidesWithPointer ?
      object.collidesWithPointer(pointer) :
      circleRectCollision(object, pointer);

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
 *
 * @param {MouseEvent|TouchEvent} evt
 */
function blurEventHandler(evt) {
  let pointer = pointers.get(evt.target);
  pointer._oo = null;
  pressedButtons = {};
}

/**
 * Find the first object for the event and execute it's callback function
 *
 * @param {MouseEvent|TouchEvent} evt
 * @param {string} eventName - Which event was called.
 */
function pointerHandler(evt, eventName) {
  evt.preventDefault();

  let canvas = evt.target;
  let pointer = pointers.get(canvas);

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

      let clientX = evt.changedTouches[i].clientX;
      let clientY = evt.changedTouches[i].clientY;
      pointer.x = (clientX - rect.left) * ratio;
      pointer.y = (clientY - rect.top) * ratio;

      // Trigger events
      let object = getCurrentObject(pointer);
      if (object && object[eventName]) {
        object[eventName](evt);
      }

      if (callbacks[eventName]) {
        callbacks[eventName](evt, object);
      }
    }
  } else {
    pointer.x = (evt.clientX - rect.left) * ratio;
    pointer.y = (evt.clientY - rect.top) * ratio;

    let object = getCurrentObject(pointer);
    if (object && object[eventName]) {
      object[eventName](evt);
    }

    if (callbacks[eventName]) {
      callbacks[eventName](evt, object);
    }

    // handle onOut events
    if (eventName == 'onOver') {
      if (object != pointer._oo && pointer._oo && pointer._oo.onOut) {
        pointer._oo.onOut(evt);
      }

      pointer._oo = object;
    }
  }
}

/**
 * Initialize pointer event listeners. This function must be called before using other pointer functions.
 *
 * If you need to use multiple canvas, you'll have to initialize the pointer for each one individually as each canvas maintains its own pointer object.
 * @function initPointer
 *
 * @param {HTMLCanvasElement} [canvas] - The canvas that event listeners will be attached to. Defaults to [core.getCanvas()](api/core#getCanvas).
 *
 * @returns {{x: Number, y: Number, radius: Number, canvas: HTMLCanvasElement, touches: Object}} The pointer object for the canvas.
 */
export function initPointer(canvas = getCanvas()) {
  let pointer = pointers.get(canvas);
  if (!pointer) {
    pointer = {
      x: 0,
      y: 0,
      radius: 5, // arbitrary size
      touches: {},
      canvas,

      // cf = current frame, lf = last frame, o = objects,
      // oo = over object
      _cf: [],
      _lf: [],
      _o: [],
      _oo: null
    };
    pointers.set(canvas, pointer);
  }

  // if this function is called multiple times, the same event
  // won't be added multiple times
  // @see https://stackoverflow.com/questions/28056716/check-if-an-element-has-event-listener-on-it-no-jquery/41137585#41137585
  canvas.addEventListener('mousedown', pointerDownHandler);
  canvas.addEventListener('touchstart', pointerDownHandler);
  canvas.addEventListener('mouseup', pointerUpHandler);
  canvas.addEventListener('touchend', pointerUpHandler);
  canvas.addEventListener('touchcancel', pointerUpHandler);
  canvas.addEventListener('blur', blurEventHandler);
  canvas.addEventListener('mousemove', mouseMoveHandler);
  canvas.addEventListener('touchmove', mouseMoveHandler);

  // however, the tick event should only be registered once
  // otherwise it completely destroys pointer events
  if (!pointer._t) {
    pointer._t = true;

    // reset object render order on every new frame
    on('tick', () => {
      pointer._lf.length = 0;

      pointer._cf.map(object => {
        pointer._lf.push(object);
      });

      pointer._cf.length = 0;
    });
  }

  return pointer;
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
 * @param {...Object[]} objects - Objects to track.
 */
export function track(...objects) {
  objects.map(object => {
    let canvas = object.context ? object.context.canvas : getCanvas();
    let pointer = pointers.get(canvas);

    // @ifdef DEBUG
    if (!pointer) {
      throw new ReferenceError('Pointer events not initialized for the objects canvas');
    };
    // @endif

    // override the objects render function to keep track of render
    // order
    if (!object._r) {
      object._r = object.render;

      object.render = function() {
        pointer._cf.push(this);
        this._r();
      };

      pointer._o.push(object);
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
 * @param {...Object[]} objects - Object or objects to stop tracking.
 */
export function untrack(...objects) {
  objects.map(object => {
    let canvas = object.context ? object.context.canvas : getCanvas();
    let pointer = pointers.get(canvas);

    // @ifdef DEBUG
    if (!pointer) {
      throw new ReferenceError('Pointer events not initialized for the objects canvas');
    };
    // @endif

    // restore original render function to no longer track render order
    object.render = object._r;
    object._r = 0;  // 0 is the shortest falsy value

    let index = pointer._o.indexOf(object);
    if (index !== -1) {
      pointer._o.splice(index, 1);
    }
  });
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
  let canvas = object.context ? object.context.canvas : getCanvas();
  let pointer = pointers.get(canvas);

  // @ifdef DEBUG
  if (!pointer) {
    throw new ReferenceError('Pointer events not initialized for the objects canvas');
  };
  // @endif

  return pointer._o.includes(object) && getCurrentObject(pointer) === object;
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
 * @param {(evt: MouseEvent|TouchEvent, object?: Object) => void} callback - Function to call on pointer down.
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
 * @param {(evt: MouseEvent|TouchEvent, object?: Object) => void} callback - Function to call on pointer up.
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

// expose for testing
export function resetPointers() {
  // no clear method so only alternative is to create a new WeakMap
  // @see https://stackoverflow.com/questions/37528622/why-is-weakmap-clear-method-deprecated
  pointers = new WeakMap()
}