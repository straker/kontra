class Vector {
  /**
   * Initialize the vectors x and y position.
   * @memberof kontra.vector
   * @private
   *
   * @param {number} [x=0] - X coordinate.
   * @param {number} [y=0] - Y coordinate.
   *
   * @returns {vector}
   */
  constructor(x, y) {
    this._x = x || 0;
    this._y = y || 0;
  }

  /**
   * Add a vector to this vector.
   * @memberof kontra.vector
   *
   * @param {vec} vector - Vector to add.
   * @param {number} dt=1 - Time since last update.
   *
   * @returns {vector}
   */
  add(vec, dt) {
    return VectorFactory(
      this.x + (vec.x || 0) * (dt || 1),
      this.y + (vec.y || 0) * (dt || 1)
    );
  }

  /**
   * Clamp the vector between two points that form a rectangle.
   * @memberof kontra.vector
   *
   * @param {number} xMin - Min x value.
   * @param {number} yMin - Min y value.
   * @param {number} xMax - Max x value.
   * @param {number} yMax - Max y value.
   */
  clamp(xMin, yMin, xMax, yMax) {
    this._c = true;
    this._a = xMin;
    this._b = yMin;
    this._d = xMax;
    this._e = yMax;
  }

  /**
   * Vector x
   * @memberof kontra.vector
   *
   * @property {number} x
   */
  get x() {
    return this._x;
  }

  /**
   * Vector y
   * @memberof kontra.vector
   *
   * @property {number} y
   */
  get y() {
    return this._y;
  }

  set x(value) {
    this._x = (this._c ? Math.min( Math.max(this._a, value), this._d ) : value);
  }

  set y(value) {
    this._y = (this._c ? Math.min( Math.max(this._b, value), this._e ) : value);
  }
}

export default function VectorFactory(x, y) {
  return new Vector(x, y);
}
VectorFactory.prototype = Vector.prototype;