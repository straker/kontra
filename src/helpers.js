/**
 * A group of helpful functions that are commonly used for game development. Includes things such as converting between radians and degrees and getting random integers.
 *
 * ```js
 * import { degToRad } from 'kontra';
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