/**
 * A pseudo-random number generator (PRNG).
 *
 * @sectionName Random
 */
let seed;

/**
 * Return a random number between 0 (inclusive) and 1 (exclusive).
 * @see https://github.com/bryc/code/blob/master/jshash/PRNGs.md#splitmix32
 * @function rand
 *
 * @returns {Number} Random number between 0 and <1.
 */
export function rand() {
  seed ??= Date.now();
  seed |= 0;
  seed = (seed + 0x9e3779b9) | 0;
  let t = seed ^ (seed >>> 16);
  t = Math.imul(t, 0x21f0aaad);
  t = t ^ (t >>> 15);
  t = Math.imul(t, 0x735a2d97);
  return ((t = t ^ (t >>> 15)) >>> 0) / 4294967296;
}

/**
 * Return a random integer between a minimum (inclusive) and maximum (inclusive) integer.
 *
 * ```js
 * import { randInt, rand } from 'kontra';
 *
 * // random number between 10 and 20
 * console.log( randInt(10, 20) );
 *
 * // bias the result of the random integer to be closer
 * // to the max
 * console.log( randInt(10, 20, () => rand() ** 2) );
 * ```
 * @see https://stackoverflow.com/a/1527820/2124254
 * @function randInt
 *
 * @param {Number} min - Min integer.
 * @param {Number} max - Max integer.
 * @param {() => Number} [randFn] - Function that generates a random number. Useful for [biasing the random number](https://gamedev.stackexchange.com/a/116875).
 *
 * @returns {Number} Random integer between min and max values.
 */
export function randInt(min, max, randFn = rand) {
  return ((randFn() * (max - min + 1)) | 0) + min;
}

/**
 * Get the current seed value of the random number generator.
 * @function getSeed
 *
 * @returns {Number} The seed value.
 */
export function getSeed() {
  return seed;
}

/**
 * Initialize the random number generator with a given seed.
 *
 * ```js
 * import { seedRand, rand } from 'kontra';
 *
 * seedRand('kontra');
 * console.log(rand()); // => always 0.26133555523119867
 * ```
 * @see https://stackoverflow.com/a/47593316/2124254
 * @see https://github.com/bryc/code/blob/master/jshash/PRNGs.md
 *
 * @function seedRand
 *
 * @param {Number|String} [value=Date.now()] - Number or string to seed the random number generator.
 */
export function seedRand(value = Date.now()) {
  seed = value;

  if (typeof value == 'string') {
    // create a suitable hash of the seed string using MurmurHash3
    // @see https://github.com/bryc/code/blob/master/jshash/PRNGs.md#addendum-a-seed-generating-functions
    for (
      var i = 0, h = 1779033703 ^ value.length;
      i < value.length;
      i++
    ) {
      (h = Math.imul(h ^ value.charCodeAt(i), 3432918353)),
        (h = (h << 13) | (h >>> 19));
    }
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    seed = (h ^= h >>> 16) >>> 0;
  }
}

// export just for testing
export function _reset() {
  seed = null;
}
