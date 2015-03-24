/*jshint -W084 */

var kontra = (function(kontra) {
  kontra.Pool = Pool;

  /**
   * Object pool.
   * Unused items are at the front of the pool and in use items are at the of the pool.
   * @memberOf kontra
   *
   * @param {object} properties - Properties of the pool.
   * @param {number} properties.size - Size of the pool.
   * @param {object} properties.Object - Object to put in the pool.
   *
   * Objects inside the pool must implement <code>draw()</code>, <code>update()</code>,
   * <code>set()</code>, and <code>isAlive()</code> functions.
   */
  function Pool(properties) {
    properties = properties || {};

    // ensure objects for the pool have required functions
    var obj = new properties.Object();
    if (typeof obj.draw !== 'function' || typeof obj.update !== 'function' ||
        typeof obj.set !== 'function' || typeof obj.isAlive !== 'function') {
      var error = new ReferenceError('Required function not found.');
      kontra.logError(error, 'Objects to be pooled must implement draw(), update(), set() and isAlive() functions.');
      return;
    }

    this.size = properties.size;
    this.lastIndex = properties.size - 1;
    this.objects = [];

    // populate the pool
    this.objects[0] = obj;
    for (var i = 1; i < this.size; i++) {
      this.objects[i] = new properties.Object();
    }
  }

  /**
   * Get an object from the pool.
   * @memberOf kontra.Pool
   *
   * @param {object} properties - Properties to pass to object.set().
   *
   * @returns {boolean} True if the pool had an object to get.
   */
  Pool.prototype.get = function(properties) {
    // the pool is out of objects if the first object is in use
    if (this.objects[0].isAlive()) {
      return false;
    }

    // save off first object in pool to reassign to last object after unshift
    var obj = this.objects[0];

    // unshift the array
    for (var i = 1; i < this.size; i++) {
      this.objects[i-1] = this.objects[i];
    }

    this.objects[this.lastIndex] = obj.set(properties);

    return true;
  };

  /**
   * Update all alive pool objects.
   * @memberOf kontra.Pool
   */
  Pool.prototype.update = function() {
    var i = this.lastIndex;
    var obj;

    while (obj = this.objects[i]) {

      // once we find the first object that is not alive we can stop
      if (!obj.isAlive()) {
        return;
      }

      obj.update();

      // if the object is dead, move it to the front of the pool
      if (!obj.isAlive()) {

        // push an object from the middle of the pool to the front of the pool
        // without returning a new array through Array#splice to avoid garbage
        // collection of the old array
        // @see http://jsperf.com/object-pools-array-vs-loop
        for (var j = i; j > 0; j--) {
          this.objects[j] = this.objects[j-1];
        }

        this.objects[0] = obj;
      }
      else {
        i--;
      }
    }
  };

  /**
   * Draw all alive pool objects.
   * @memberOf kontra.Pool
   */
  Pool.prototype.draw = function() {
    for (var i = this.lastIndex, obj; obj = this.objects[i]; i--) {

      // once we find the first object that is not alive we can stop
      if (!obj.isAlive()) {
        return;
      }

      obj.draw();
    }
  };

  return kontra;
})(kontra || {});