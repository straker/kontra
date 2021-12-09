/**
 * A group of helpful functions that are commonly used for game development. Includes things such as converting between radians and degrees and getting random integers.
 *
 * ```js
 * import { degToRad } from 'kontra';
 *
 * let radians = degToRad(180);  // => 3.14
 * ```
 * @sectionName Helpers
 */

/**
 * Convert degrees to radians.
 * @function degToRad
 *
 * @param {Number} deg - Degrees to convert.
 *
 * @returns {Number} The value in radians.
 */
export function degToRad(deg) {
  return (deg * Math.PI) / 180;
}

/**
 * Convert radians to degrees.
 * @function radToDeg
 *
 * @param {Number} rad - Radians to convert.
 *
 * @returns {Number} The value in degrees.
 */
export function radToDeg(rad) {
  return (rad * 180) / Math.PI;
}

/**
 * Return the angle in radians from one point to another point.
 *
 * ```js
 * import { angleToTarget, Sprite } from 'kontra';
 *
 * let sprite = Sprite({
 *   x: 10,
 *   y: 10,
 *   width: 20,
 *   height: 40,
 *   color: 'blue'
 * });
 *
 * sprite.rotation = angleToTarget(sprite, {x: 100, y: 30});
 *
 * let sprite2 = Sprite({
 *   x: 100,
 *   y: 30,
 *   width: 20,
 *   height: 40,
 *   color: 'red',
 * });
 *
 * sprite2.rotation = angleToTarget(sprite2, sprite);
 * ```
 * @function angleToTarget
 *
 * @param {{x: Number, y: Number}} source - The {x,y} source point.
 * @param {{x: Number, y: Number}} target - The {x,y} target point.
 *
 * @returns {Number} Angle (in radians) from the source point to the target point.
 */
export function angleToTarget(source, target) {
  // atan2 returns the counter-clockwise angle in respect to the x-axis, but
  // the canvas rotation system is based on the y-axis (rotation of 0 = up).
  // so we need to add a quarter rotation to return a counter-clockwise
  // rotation in respect to the y-axis
  return Math.atan2(target.y - source.y, target.x - source.x) + Math.PI / 2;
}

/**
 * Rotate a point by an angle.
 * @function rotatePoint
 *
 * @param {{x: Number, y: Number}} point - The {x,y} point to rotate.
 * @param {Number} angle - Angle (in radians) to rotate.
 *
 * @returns {{x: Number, y: Number}} The new x and y coordinates after rotation.
 */
export function rotatePoint(point, angle) {
  let sin = Math.sin(angle);
  let cos = Math.cos(angle);

  return {
    x: point.x * cos - point.y * sin,
    y: point.x * sin + point.y * cos
  };
}

/**
 * Move a point by an angle and distance.
 * @function
 *
 * @param {{x: Number, y: Number}} point - The {x,y} point to move.
 * @param {Number} angle - Angle (in radians) to move.
 * @param {Number} distance - Distance to move.
 *
 * @returns {{x: Number, y: Number}} The new x and y coordinates after moving.
 */
export function movePoint(point, angle, distance) {
  return {
    x: point.x + Math.sin(angle) * distance,
    y: point.y - Math.cos(angle) * distance
  };
}

/**
 * Return a random integer between a minimum (inclusive) and maximum (inclusive) integer.
 * @see https://stackoverflow.com/a/1527820/2124254
 * @function randInt
 *
 * @param {Number} min - Min integer.
 * @param {Number} max - Max integer.
 *
 * @returns {Number} Random integer between min and max values.
 */
export function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Create a seeded random number generator.
 *
 * ```js
 * import { seedRand } from 'kontra';
 *
 * let rand = seedRand('kontra');
 * console.log(rand());  // => always 0.33761959057301283
 * ```
 * @see https://stackoverflow.com/a/47593316/2124254
 * @see https://github.com/bryc/code/blob/master/jshash/PRNGs.md
 *
 * @function seedRand
 *
 * @param {String} str - String to seed the random number generator.
 *
 * @returns {() => Number} Seeded random number generator function.
 */
export function seedRand(str) {
  // based on the above references, this was the smallest code yet decent
  // quality seed random function

  // first create a suitable hash of the seed string using xfnv1a
  // @see https://github.com/bryc/code/blob/master/jshash/PRNGs.md#addendum-a-seed-generating-functions
  for (var i = 0, h = 2166136261 >>> 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 16777619);
  }
  h += h << 13;
  h ^= h >>> 7;
  h += h << 3;
  h ^= h >>> 17;
  let seed = (h += h << 5) >>> 0;

  // then return the seed function and discard the first result
  // @see https://github.com/bryc/code/blob/master/jshash/PRNGs.md#lcg-lehmer-rng
  let rand = () => ((2 ** 31 - 1) & (seed = Math.imul(48271, seed))) / 2 ** 31;
  rand();
  return rand;
}

/**
 * Linearly interpolate between two values. The function calculates the number between two values based on a percent. Great for smooth transitions.
 *
 * ```js
 * import { lerp } from 'kontra';
 *
 * console.log( lerp(10, 20, 0.5) );  // => 15
 * console.log( lerp(10, 20, 2) );  // => 30
 * ```
 * @function lerp
 *
 * @param {Number} start - Start value.
 * @param {Number} end - End value.
 * @param {Number} percent - Percent to interpolate.
 *
 * @returns {Number} Interpolated number between the start and end values
 */
export function lerp(start, end, percent) {
  return start * (1 - percent) + end * percent;
}

/**
 * Return the linear interpolation percent between two values. The function calculates the percent between two values of a given value.
 *
 * ```js
 * import { inverseLerp } from 'kontra';
 *
 * console.log( inverseLerp(10, 20, 15) );  // => 0.5
 * console.log( inverseLerp(10, 20, 30) );  // => 2
 * ```
 * @function inverseLerp
 *
 * @param {Number} start - Start value.
 * @param {Number} end - End value.
 * @param {Number} value - Value between start and end.
 *
 * @returns {Number} Percent difference between the start and end values.
 */
export function inverseLerp(start, end, value) {
  return (value - start) / (end - start);
}

/**
 * Clamp a number between two values, preventing it from going below or above the minimum and maximum values.
 * @function clamp
 *
 * @param {Number} min - Min value.
 * @param {Number} max - Max value.
 * @param {Number} value - Value to clamp.
 *
 * @returns {Number} Value clamped between min and max.
 */
export function clamp(min, max, value) {
  return Math.min(Math.max(min, value), max);
}

/**
 * Save an item to localStorage. A value of `undefined` will remove the item from localStorage.
 * @function setStoreItem
 *
 * @param {String} key - The name of the key.
 * @param {*} value - The value to store.
 */
export function setStoreItem(key, value) {
  if (value === undefined) {
    localStorage.removeItem(key);
  } else {
    localStorage.setItem(key, JSON.stringify(value));
  }
}

/**
 * Retrieve an item from localStorage and convert it back to its original type.
 *
 * Normally when you save a value to LocalStorage it converts it into a string. So if you were to save a number, it would be saved as `"12"` instead of `12`. This function enables the value to be returned as `12`.
 * @function getStoreItem
 *
 * @param {String} key - Name of the key of the item to retrieve.
 *
 * @returns {*} The retrieved item.
 */
export function getStoreItem(key) {
  let value = localStorage.getItem(key);

  try {
    value = JSON.parse(value);
  } catch (e) {}

  return value;
}

/**
 * Check if two objects collide. Uses a simple [Axis-Aligned Bounding Box (AABB) collision check](https://developer.mozilla.org/en-US/docs/Games/Techniques/2D_collision_detection#Axis-Aligned_Bounding_Box). Takes into account the objects [anchor](api/gameObject#anchor) and [scale](api/gameObject#scale).
 *
 * **NOTE:** Does not take into account object rotation. If you need collision detection between rotated objects you will need to implement your own `collides()` function. I suggest looking at the Separate Axis Theorem.
 *
 * ```js
 * import { Sprite, collides } from 'kontra';
 *
 * let sprite = Sprite({
 *   x: 100,
 *   y: 200,
 *   width: 20,
 *   height: 40
 * });
 *
 * let sprite2 = Sprite({
 *   x: 150,
 *   y: 200,
 *   width: 20,
 *   height: 20
 * });
 *
 * collides(sprite, sprite2);  //=> false
 *
 * sprite2.x = 115;
 *
 * collides(sprite, sprite2);  //=> true
 * ```
 * @function collides
 *
 * @param {{x: number, y: number, width: number, height: number}|{world: {x: number, y: number, width: number, height: number}}} obj1 - Object reference.
 * @param {{x: number, y: number, width: number, height: number}|{world: {x: number, y: number, width: number, height: number}}} obj2 - Object to check collision against.
 *
 * @returns {Boolean} `true` if the objects collide, `false` otherwise.
 */
export function collides(obj1, obj2) {
  // @ifdef GAMEOBJECT_SCALE||GAMEOBJECT_ANCHOR
  // destructure results to obj1 and obj2
  [obj1, obj2] = [obj1, obj2].map(obj => getWorldRect(obj));
  // @endif

  return (
    obj1.x < obj2.x + obj2.width &&
    obj1.x + obj1.width > obj2.x &&
    obj1.y < obj2.y + obj2.height &&
    obj1.y + obj1.height > obj2.y
  );
}

/**
 * Return the world rect of an object. The rect is the world position of the top-left corner of the object and its size. Takes into account the objects anchor and scale.
 * @function getWorldRect
 *
 * @param {{x: number, y: number, width: number, height: number}|{world: {x: number, y: number, width: number, height: number}}|{mapwidth: number, mapheight: number}} obj - Object to get world rect of.
 *
 * @returns {{x: number, y: number, width: number, height: number}} The world `x`, `y`, `width`, and `height` of the object.
 */
export function getWorldRect(obj) {
  let { x = 0, y = 0, width, height } = obj.world || obj;

  // take into account tileEngine
  if (obj.mapwidth) {
    width = obj.mapwidth;
    height = obj.mapheight;
  }

  // @ifdef GAMEOBJECT_ANCHOR
  // account for anchor
  if (obj.anchor) {
    x -= width * obj.anchor.x;
    y -= height * obj.anchor.y;
  }
  // @endif

  // @ifdef GAMEOBJECT_SCALE
  // account for negative scales
  if (width < 0) {
    x += width;
    width *= -1;
  }
  if (height < 0) {
    y += height;
    height *= -1;
  }
  // @endif

  return {
    x,
    y,
    width,
    height
  };
}
