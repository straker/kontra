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
  return deg * Math.PI / 180;
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
  return rad * 180 / Math.PI;
}

/**
 * Return the angle (in radians) from one point to another point.
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
 * @param {{x: Number, y: Number}} source - The source point.
 * @param {{x: Number, y: Number}} target - The target point.
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
  for(var i = 0, h = 2166136261 >>> 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 16777619);
  }
  h += h << 13; h ^= h >>> 7;
  h += h << 3;  h ^= h >>> 17;
  let seed = (h += h << 5) >>> 0;

  // then return the seed function and discard the first result
  // @see https://github.com/bryc/code/blob/master/jshash/PRNGs.md#lcg-lehmer-rng
  let rand = () => (2 ** 31 - 1 & (seed = Math.imul(48271, seed))) / 2 ** 31;
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
  return Math.min( Math.max(min, value), max );
}