var kontra = (function(kontra, Math) {
  kontra.Vector = Vector;

  /**
   * A vector for 2d space.
   * @memberOf kontra
   * @constructor
   *
   * @param {number} x=0 - Center x coordinate.
   * @param {number} y=0 - Center y coordinate.
   */
  function Vector(x, y) {
    this.set(x, y);
  }

  /**
   * Set the vector's x and y position.
   * @memberOf kontra.Vector
   *
   * @param {number} x - Center x coordinate.
   * @param {number} y - Center y coordinate.
   */
  Vector.prototype.set = function VecotrSet(x, y) {
    this.x = x || 0;
    this.y = y || 0;
  };

  /**
   * Add a vector to this vector.
   * @memberOf kontra.Vector
   *
   * @param {Vector} vector - Vector to add.
   */
  Vector.prototype.add = function VectorAdd(vector) {
    this.x += vector.x;
    this.y += vector.y;
  };

  /**
   * Get the length of the vector.
   * @memberOf kontra.Vector
   *
   * @returns {number}
   */
  Vector.prototype.length = function VecotrLength() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  };

  /**
   * Get the angle of the vector.
   * @memberOf kontra.Vector
   *
   * @returns {number}
   */
  Vector.prototype.angle = function VectorAnagle() {
    return Math.atan2(this.y, this.x);
  };

  /**
   * Get a new vector from an angle and magnitude
   * @memberOf kontra.Vector
   *
   * @returns {Vector}
   */
  Vector.prototype.fromAngle = function VectorFromAngle(angle, magnitude) {
    return new Vector(magnitude * Math.cos(angle), magnitude * Math.sin(angle));
  };

  return kontra;
})(kontra || {}, Math);