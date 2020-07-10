import { clamp } from './helpers.js';

/**
 * A simple 2d vector object.
 *
 * ```js
 * import { Vector } from 'kontra';
 *
 * let vector = Vector(100, 200);
 * ```
 * @class Vector
 *
 * @param {Number} [x=0] - X coordinate of the vector.
 * @param {Number} [y=0] - Y coordinate of the vector.
 */
class Vector {
  constructor(x = 0, y = 0, vec = {}) {
    this.x = x;
    this.y = y;

    // @ifdef VECTOR_CLAMP
    // preserve vector clamping when creating new vectors
    if (vec._c) {
      this.clamp(vec._a, vec._b, vec._d, vec._e);

      // reset x and y so clamping takes effect
      this.x = x;
      this.y = y;
    }
    // @endif
  }

  /**
   * Calculate the addition of the current vector with the given vector.
   * @memberof Vector
   * @function add
   *
   * @param {Vector|{x: number, y: number}} vector - Vector to add to the current Vector.
   *
   * @returns {Vector} A new Vector instance whose value is the addition of the two vectors.
   */
  add(vec) {
    return new Vector(
      this.x + vec.x,
      this.y + vec.y,
      this
    );
  }

  // @ifdef VECTOR_SUBTRACT
  /**
   * Calculate the subtraction of the current vector with the given vector.
   * @memberof Vector
   * @function subtract
   *
   * @param {Vector|{x: number, y: number}} vector - Vector to subtract from the current Vector.
   *
   * @returns {Vector} A new Vector instance whose value is the subtraction of the two vectors.
   */
   subtract(vec) {
    return new Vector(
      this.x - vec.x,
      this.y - vec.y,
      this
    );
  }
  // @endif

  // @ifdef VECTOR_SCALE
  /**
   * Calculate the multiple of the current vector by a value.
   * @memberof Vector
   * @function scale
   *
   * @param {Number} value - Value to scale the current Vector.
   *
   * @returns {Vector} A new Vector instance whose value is multiplied by the scalar.
   */
  scale(value) {
    return new Vector(
      this.x * value,
      this.y * value
    );
  }
  // @endif

  // @ifdef VECTOR_NORMALIZE
  /**
   * Calculate the normalized value of the current vector. Requires the Vector [length](/api/vector#length) function.
   * @memberof Vector
   * @function normalize
   *
   * @returns {Vector} A new Vector instance whose value is the normalized vector.
   */
  // @see https://github.com/jed/140bytes/wiki/Byte-saving-techniques#use-placeholder-arguments-instead-of-var
  normalize(length = this.length()) {
    return new Vector(
      this.x / length,
      this.y / length
    );
  }
  // @endif

  // @ifdef VECTOR_DOT||VECTOR_ANGLE
  /**
   * Calculate the dot product of the current vector with the given vector.
   * @memberof Vector
   * @function dot
   *
   * @param {Vector|{x: number, y: number}} vector - Vector to dot product against.
   *
   * @returns {Number} The dot product of the vectors.
   */
  dot(vec) {
    return this.x * vec.x + this.y * vec.y;
  }
  // @endif

  // @ifdef VECTOR_LENGTH||VECTOR_NORMALIZE||VECTOR_ANGLE
  /**
   * Calculate the length (magnitude) of the Vector.
   * @memberof Vector
   * @function length
   *
   * @returns {Number} The length of the vector.
   */
  length() {
    return Math.hypot(this.x, this.y);
  }
  // @endif

  // @ifdef VECTOR_DISTANCE
  /**
   * Calculate the distance between the current vector and the given vector.
   * @memberof Vector
   * @function distance
   *
   * @param {Vector|{x: number, y: number}} vector - Vector to calculate the distance between.
   *
   * @returns {Number} The distance between the two vectors.
   */
  distance(vec) {
    return Math.hypot(this.x - vec.x, this.y - vec.y);
  }
  // @endif

  // @ifdef VECTOR_ANGLE
  /**
   * Calculate the angle (in radians) between the current vector and the given vector. Requires the Vector [dot](/api/vector#dot) and [length](/api/vector#length) functions.
   * @memberof Vector
   * @function angle
   *
   * @param {Vector} vector - Vector to calculate the angle between.
   *
   * @returns {Number} The angle (in radians) between the two vectors.
   */
  angle(vec) {
    return Math.acos(this.dot(vec) / (this.length() * vec.length()));
  }
  // @endif

  // @ifdef VECTOR_CLAMP
  /**
   * Clamp the Vector between two points, preventing `x` and `y` from going below or above the minimum and maximum values. Perfect for keeping a sprite from going outside the game boundaries.
   *
   * ```js
   * import { Vector } from 'kontra';
   *
   * let vector = Vector(100, 200);
   * vector.clamp(0, 0, 200, 300);
   *
   * vector.x += 200;
   * console.log(vector.x);  //=> 200
   *
   * vector.y -= 300;
   * console.log(vector.y);  //=> 0
   *
   * vector.add({x: -500, y: 500});
   * console.log(vector);    //=> {x: 0, y: 300}
   * ```
   * @memberof Vector
   * @function clamp
   *
   * @param {Number} xMin - Minimum x value.
   * @param {Number} yMin - Minimum y value.
   * @param {Number} xMax - Maximum x value.
   * @param {Number} yMax - Maximum y value.
   */
  clamp(xMin, yMin, xMax, yMax) {
    this._c = true;
    this._a = xMin;
    this._b = yMin;
    this._d = xMax;
    this._e = yMax;
  }

  /**
   * X coordinate of the vector.
   * @memberof Vector
   * @property {Number} x
   */
  get x() {
    return this._x;
  }

  /**
   * Y coordinate of the vector.
   * @memberof Vector
   * @property {Number} y
   */
  get y() {
    return this._y;
  }

  set x(value) {
    this._x = (this._c ? clamp(this._a, this._d, value) : value);
  }

  set y(value) {
    this._y = (this._c ? clamp(this._b, this._e, value) : value);
  }
  // @endif
}

export default function factory() {
  return new Vector(...arguments);
}
factory.prototype = Vector.prototype;
factory.class = Vector;