import { on } from './events.js';

/**
 * A simple gesture API. You can use it to move the main sprite or respond to gesture events.
 *
 * ```js
 * import { initPointer, initGesture, onGesture } from 'kontra';
 *
 * // these functions must be called first before gesture
 * // functions will work
 * initPointer();
 * initGesture();
 *
 * onGesture('swipeleft', function() {
 *   // handle swipeleft event
 * })
 * ```
 * @sectionName Gesture
 */

/**
 * Below is a list of gestures that are provided by default. If you need to extend this list, you can use the [gestureMap](api/gesture#gestureMap) property.
 *
 * - swipeleft, swipeup, swiperight, swipedown
 * - pinchin, pinchout
 * @sectionName Available Gestures
 */

// expose for tests
export let callbacks = {};
let currGesture;
let init = false;

/**
 * A map of gesture objects to gesture names. Add to this object to expand the list of [available gestures](api/gesture#available-gestures).
 *
 * The gesture name should be the overall name of the gesture (e.g. swipe, pinch) and not include any directional information (e.g. left, in).
 *
 * A gesture object should have a `touches` property and at least one touch event function. The provided gestures also have a `threshold` property which is the minimum distance before the gesture is recognized.
 *
 * The `touches` property is a number that indicates how many touch points are required for the gesture. A touch event function is a function whose name should match the touch event name it triggers on (e.g. touchstart, touchmove). A touch event function is passed a touch object.
 *
 * A gesture can have multiple touch event functions, but one of them must return the direction of the gesture (e.g. left, in). The gesture name and the gesture direction are combined together as the callback name for [onGesture](api/gesture#onGesture) (e.g. swipeleft, pinchin).
 *
 * A touch object is an array-like object where each index is a touch. A touch has the current `x` and `y` position of the touch and a `start` property which has the initial start `x` and `y` position.
 *
 * ```js
 * import { gestureMap, onGesture } from 'kontra';
 *
 * // pan is the name of the gesture
 * gestureMap.pan = {
 *   // panning uses 1 touch
 *   touches: 1,
 *   // panning is triggered on touchmove
 *   touchmove({ 0: touch }) {
 *     let x = touch.x - touch.start.x;
 *     let y = touch.y - touch.start.y;
 *     let absX = Math.abs(x);
 *     let absY = Math.abs(y);
 *
 *     // return the direction the pan
 *     return absX > absY
 *       ? x < 0 ? 'left' : 'right'
 *       : y < 0 ? 'up' : 'down'
 *   }
 * };
 *
 * // the gesture name and direction are combined as the callback name
 * onGesture('panleft', function(e, touches) {
 *   // handle panleft gesture
 * });
 * ```
 * @property {{[name: string]: {touches: number, touchstart?: Function, touchmove?: Function, touchend?: Function, [prop: string]: any}}} gestureMap
 */
export let gestureMap = {
  swipe: {
    touches: 1,
    threshold: 10,
    touchend({ 0: touch }) {
      let x = touch.x - touch.start.x;
      let y = touch.y - touch.start.y;
      let absX = Math.abs(x);
      let absY = Math.abs(y);
      if (absX < this.threshold && absY < this.threshold) return;

      return absX > absY ? (x < 0 ? 'left' : 'right') : y < 0 ? 'up' : 'down';
    }
  },
  pinch: {
    touches: 2,
    threshold: 2,
    touchstart({ 0: touch0, 1: touch1 }) {
      this.prevDist = Math.hypot(touch0.x - touch1.x, touch0.y - touch1.y);
    },
    touchmove({ 0: touch0, 1: touch1 }) {
      let dist = Math.hypot(touch0.x - touch1.x, touch0.y - touch1.y);
      if (Math.abs(dist - this.prevDist) < this.threshold) return;

      let dir = dist > this.prevDist ? 'out' : 'in';
      this.prevDist = dist;
      return dir;
    }
  }
};

/**
 * Initialize gesture event listeners. This function must be called before using other gesture functions. Gestures depend on pointer events, so [initPointer](api/pointer#initPointer) must be called as well.
 * @function initGesture
 */
export function initGesture(gestures) {
  // don't add the on call multiple times otherwise it will mess up
  // gesture events
  if (!init) {
    init = true;

    on('touchChanged', (evt, touches) => {
      Object.keys(gestureMap).map(name => {
        let gesture = gestureMap[name];
        let type;

        if (
          // don't call swipe if at the end of a pinch and there's 1
          // finger left touching
          (!currGesture || currGesture == name) &&
          touches.length == gesture.touches &&
          // ensure that the indices of touches goes from 0..N. otherwise
          // a length 1 touch could have an index of 2 which means there
          // were two other touches that started a gesture
          // @see https://stackoverflow.com/a/33352604/2124254
          [...Array(touches.length).keys()].every(key => touches[key]) &&
          (type = gesture[evt.type]?.(touches) ?? '') &&
          callbacks[name + type]
        ) {
          currGesture = name;
          callbacks[name + type](evt, touches);
        }
      });
    });

    on('touchEnd', () => {
      // 0 is the shortest falsy value
      currGesture = 0;
    });
  }
}

/**
 * Register a function to be called on a gesture event. Is passed the original Event and the touch object, an array-like object of touches.
 *
 * ```js
 * import { initPointer, initGesture, onGesture } from 'kontra';
 *
 * initPointer();
 * initGesture();
 *
 * onGesture('swipeleft', function(e, touches) {
 *   // handle swipeleft gesture
 * });
 * ```
 * @function onGesture
 *
 * @param {String} name - The name of the gesture.
 * @param {(evt: TouchEvent, touches: Object) => void} callback - Function to call on gesture events.
 */
export function onGesture(name, callback) {
  callbacks[name] = callback;
}

/**
 * Unregister the callback function for a gesture.
 *
 * ```js
 * import { initPointer, initGesture, offGesture } from 'kontra';
 *
 * initPointer();
 * initGesture();
 *
 * offGesture('swipeleft');
 * ```
 * @function offGesture
 *
 * @param {String} name - The name of the gesture.
 */
export function offGesture(name) {
  callbacks[name] = 0;
}
