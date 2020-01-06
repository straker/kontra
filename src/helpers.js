/**
 * A group of helpful functions that are commonly used for game development. Includes things such as converting between radians and degrees and getting random integers.
 * @sectionName Helpers
 */

/**
 * Convert degrees to radians.
 * @function degToRad
 *
 * @param {Number} deg - Degrees to convert.
 *
 * @returns {Number} radians
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
 * @returns {Number} degrees
 */
export function radToDeg(rad) {
  return rad * 180 / Math.PI;
}

/**
 * Return a random integer between min (inclusive) and max (inclusive).
 * @function randInt
 *
 * @param {Number} min - Min integer.
 * @param {Number} max - Max integer.
 *
 * @returns {Number} random number between range.
 */
export function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}