import { getCanvas } from './core.js';
import { on, emit } from './events.js';
import { getWorldRect } from './helpers.js';
import { removeFromArray } from './utils.js';

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
 *
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

/**
 * Below is a list of buttons that you can use. If you need to extend or modify this list, you can use the [pointer](api/gamepad#pointerMap) property.
 *
 * - left, middle, right
 * @sectionName Available Buttons
 */

// save each object as they are rendered to determine which object
// is on top when multiple objects are the target of an event.
// we'll always use the last frame's object order so we know
// the finalized order of all objects, otherwise an object could ask
// if it's being hovered when it's rendered first even if other
// objects would block it later in the render order
let pointers = new WeakMap();
let callbacks = {};
let pressedButtons = {};

/**
 * A map of pointer button indices to button names. Modify this object to expand the list of [available buttons](api/pointer#available-buttons).
 *
 * ```js
 * import { pointerMap, pointerPressed } from 'kontra';
 *
 * pointerMap[2] = 'buttonWest';
 *
 * if (pointerPressed('buttonWest')) {
 *   // handle west face button
 * }
 * ```
 * @property {{[key: number]: String}} pointerMap
 */
export let pointerMap = {
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
 * Detection collision between a rectangle and a circle.
 * @see https://yal.cc/rectangle-circle-intersection-test/
 *
 * @param {Object} object - Object to check collision against.
 */
function circleRectCollision(object, pointer) {
  let { x, y, width, height } = getWorldRect(object);

  // account for camera
  do {
    x -= object.sx || 0;
    y -= object.sy || 0;
  } while ((object = object.parent));

  let dx = pointer.x - Math.max(x, Math.min(pointer.x, x + width));
  let dy = pointer.y - Math.max(y, Math.min(pointer.y, y + height));
  return dx * dx + dy * dy < pointer.radius * pointer.radius;
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
  let renderedObjects = pointer._lf.length
    ? pointer._lf
    : pointer._cf;

  for (let i = renderedObjects.length - 1; i >= 0; i--) {
    let object = renderedObjects[i];
    let collides = object.collidesWithPointer
      ? object.collidesWithPointer(pointer)
      : circleRectCollision(object, pointer);

    if (collides) {
      return object;
    }
  }
}

/**
 * Get the style property value.
 */
function getPropValue(style, value) {
  return parseFloat(style.getPropertyValue(value)) || 0;
}

/**
 * Calculate the canvas size, scale, and offset.
 *
 * @param {Object} The pointer object
 *
 * @returns {Object} The scale and offset of the canvas
 */
function getCanvasOffset(pointer) {
  // we need to account for CSS scale, transform, border, padding,
  // and margin in order to get the correct scale and offset of the
  // canvas
  let { canvas, _s } = pointer;
  let rect = canvas.getBoundingClientRect();

  // @see https://stackoverflow.com/a/53405390/2124254
  let transform =
    _s.transform != 'none'
      ? _s.transform.replace('matrix(', '').split(',')
      : [1, 1, 1, 1];
  let transformScaleX = parseFloat(transform[0]);
  let transformScaleY = parseFloat(transform[3]);

  // scale transform applies to the border and padding of the element
  let borderWidth =
    (getPropValue(_s, 'border-left-width') +
      getPropValue(_s, 'border-right-width')) *
    transformScaleX;
  let borderHeight =
    (getPropValue(_s, 'border-top-width') +
      getPropValue(_s, 'border-bottom-width')) *
    transformScaleY;

  let paddingWidth =
    (getPropValue(_s, 'padding-left') +
      getPropValue(_s, 'padding-right')) *
    transformScaleX;
  let paddingHeight =
    (getPropValue(_s, 'padding-top') +
      getPropValue(_s, 'padding-bottom')) *
    transformScaleY;

  return {
    scaleX: (rect.width - borderWidth - paddingWidth) / canvas.width,
    scaleY:
      (rect.height - borderHeight - paddingHeight) / canvas.height,
    offsetX:
      rect.left +
      (getPropValue(_s, 'border-left-width') +
        getPropValue(_s, 'padding-left')) *
        transformScaleX,
    offsetY:
      rect.top +
      (getPropValue(_s, 'border-top-width') +
        getPropValue(_s, 'padding-top')) *
        transformScaleY
  };
}

/**
 * Execute the onDown callback for an object.
 *
 * @param {MouseEvent|TouchEvent} evt
 */
function pointerDownHandler(evt) {
  // touchstart should be treated like a left mouse button
  let button = evt.button != null ? pointerMap[evt.button] : 'left';
  pressedButtons[button] = true;
  pointerHandler(evt, 'onDown');
}

/**
 * Execute the onUp callback for an object.
 *
 * @param {MouseEvent|TouchEvent} evt
 */
function pointerUpHandler(evt) {
  let button = evt.button != null ? pointerMap[evt.button] : 'left';
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
 * Call a pointer callback function
 *
 * @param {Object} pointer
 * @param {String} eventName
 * @param {MouseEvent|TouchEvent} evt
 */
function callCallback(pointer, eventName, evt) {
  // Trigger events
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
  let { scaleX, scaleY, offsetX, offsetY } = getCanvasOffset(pointer);
  let isTouchEvent = evt.type.includes('touch');

  if (isTouchEvent) {
    // track new touches
    Array.from(evt.touches).map(
      ({ clientX, clientY, identifier }) => {
        let touch = pointer.touches[identifier];
        if (!touch) {
          touch = pointer.touches[identifier] = {
            start: {
              x: (clientX - offsetX) / scaleX,
              y: (clientY - offsetY) / scaleY
            }
          };
          pointer.touches.length++;
        }

        touch.changed = false;
      }
    );

    // handle only changed touches
    Array.from(evt.changedTouches).map(
      ({ clientX, clientY, identifier }) => {
        let touch = pointer.touches[identifier];
        touch.changed = true;
        touch.x = pointer.x = (clientX - offsetX) / scaleX;
        touch.y = pointer.y = (clientY - offsetY) / scaleY;

        callCallback(pointer, eventName, evt);
        emit('touchChanged', evt, pointer.touches);

        // remove touches
        if (eventName == 'onUp') {
          delete pointer.touches[identifier];
          pointer.touches.length--;

          if (!pointer.touches.length) {
            emit('touchEnd');
          }
        }
      }
    );
  } else {
    // translate the scaled size back as if the canvas was at a
    // 1:1 scale
    pointer.x = (evt.clientX - offsetX) / scaleX;
    pointer.y = (evt.clientY - offsetY) / scaleY;

    callCallback(pointer, eventName, evt);
  }
}

/**
 * Initialize pointer event listeners. This function must be called before using other pointer functions.
 *
 * If you need to use multiple canvas, you'll have to initialize the pointer for each one individually as each canvas maintains its own pointer object.
 * @function initPointer
 *
 * @param {Object} [options] - Pointer options.
 * @param {Number} [options.radius=5] - Radius of the pointer.
 * @param {HTMLCanvasElement} [options.canvas] - The canvas that event listeners will be attached to. Defaults to [core.getCanvas()](api/core#getCanvas).
 *
 * @returns {{x: Number, y: Number, radius: Number, canvas: HTMLCanvasElement, touches: Object}} The pointer object for the canvas.
 */
export function initPointer({
  radius = 5,
  canvas = getCanvas()
} = {}) {
  let pointer = pointers.get(canvas);
  if (!pointer) {
    let style = window.getComputedStyle(canvas);

    pointer = {
      x: 0,
      y: 0,
      radius,
      touches: { length: 0 },
      canvas,

      // cf = current frame, lf = last frame, o = objects,
      // oo = over object, _s = style
      _cf: [],
      _lf: [],
      _o: [],
      _oo: null,
      _s: style
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
 * track(obj1, obj2);
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
      throw new ReferenceError(
        'Pointer events not initialized for the objects canvas'
      );
    }
    // @endif

    // override the objects render function to keep track of render
    // order
    if (!object._r) {
      object._r = object.render;

      object.render = function () {
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
 * untrack(obj1, obj2);
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
      throw new ReferenceError(
        'Pointer events not initialized for the objects canvas'
      );
    }
    // @endif

    // restore original render function to no longer track render
    // order
    object.render = object._r;
    object._r = 0; // 0 is the shortest falsy value

    removeFromArray(pointer._o, object);
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
 * track(sprite1, sprite2);
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
    throw new ReferenceError(
      'Pointer events not initialized for the objects canvas'
    );
  }
  // @endif

  return (
    pointer._o.includes(object) &&
    /* eslint-disable-next-line no-restricted-syntax */
    getCurrentObject(pointer) === object
  );
}

/**
 * Register a function to be called on pointer events. Is passed the original Event and the target object (if there is one).
 *
 * ```js
 * import { initPointer, onPointer } from 'kontra';
 *
 * initPointer();
 *
 * onPointer('down', function(e, object) {
 *   // handle pointer down
 * });
 * ```
 * @function onPointer
 *
 * @param {'down'|'up'} direction - Direction of the pointer event.
 * @param {(evt: MouseEvent|TouchEvent, object?: Object) => void} callback - Function to call on pointer event.
 */
export function onPointer(direction, callback) {
  let eventName = direction[0].toUpperCase() + direction.substr(1);
  callbacks['on' + eventName] = callback;
}

/**
 * Unregister the callback for a pointer event.
 *
 * ```js
 * import { initPointer, offPointer } from 'kontra';
 *
 * initPointer();
 *
 * offPointer('down');
 * ```
 * @function offPointer
 *
 * @param {'down'|'up'} direction - Direction of the pointer event.
 */
export function offPointer(direction) {
  let eventName = direction[0].toUpperCase() + direction.substr(1);
  callbacks['on' + eventName] = 0;
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
  return !!pressedButtons[button];
}

// expose for testing
export function resetPointers() {
  // no clear method so only alternative is to create a new WeakMap
  // @see https://stackoverflow.com/questions/37528622/why-is-weakmap-clear-method-deprecated
  pointers = /*@__PURE__*/ new WeakMap();
}
