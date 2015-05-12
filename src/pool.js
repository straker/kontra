/*jshint -W084 */

var kontra = (function(kontra) {
  'use strict';

  /**
   * Object pool. The pool will grow in size to accommodate as many objects as are needed.
   * Unused items are at the front of the pool and in use items are at the of the pool.
   * @memberof kontra
   *
   * @see kontra.pool._proto.set for list of parameters.
   */
  kontra.pool = function(properties) {
    var pool = Object.create(kontra.pool._proto);
    pool.set(properties);

    return pool;
  };

  kontra.pool._proto = {
    /**
     * Set properties on the pool.
     *
     * @param {object} properties - Properties of the pool.
     * @param {object} properties.create - Function that returns the object to use in the pool.
     * @param {number} properties.maxSize - The maximum size that the pool will grow to.
     *
     * Objects inside the pool must implement <code>render()</code>, <code>update()</code>,
     * <code>set()</code>, and <code>isAlive()</code> functions.
     */
    set: function set(properties) {
      properties = properties || {};

      // ensure objects for the pool have required functions
      var obj;
      try {
        obj = properties.create({});

        if (typeof obj.render !== 'function' || typeof obj.update !== 'function' ||
            typeof obj.set !== 'function' || typeof obj.isAlive !== 'function') {
          throw new ReferenceError('Required functions not found.');
        }
      }
      catch (error) {
        var message;

        if (error.name === 'TypeError') {
          message = 'The parameter \'create\' must be a function that returns an object.';
        }
        else {
          message = 'Objects to be pooled must implement render(), update(), set() and isAlive() functions.';
        }

        kontra.logError(error, message);
        return;
      }

      this.create = properties.create;

      // start the pool with an object
      this.objects = [obj];
      this.size = 1;
      this.maxSize = properties.maxSize || Infinity;
      this.lastIndex = 0;
      this.inUse = 0;
    },

    /**
     * Get an object from the pool.
     * @memberof kontra.pool
     *
     * @param {object} properties - Properties to pass to object.set().
     */
    get: function get(properties) {
      var _this = this;

      // the pool is out of objects if the first object is in use and it can't grow
      if (_this.objects[0].isAlive() && _this.size === _this.maxSize) {
        return;
      }
      // 'double' the size of the array by filling it with twice as many objects
      else {
        for (var x = 0; x < _this.size && _this.objects.length < _this.maxSize; x++) {
          _this.objects.unshift(_this.create({}));
        }

        _this.size = _this.objects.length;
        _this.lastIndex = _this.size - 1;
      }

      // save off first object in pool to reassign to last object after unshift
      var obj = _this.objects[0];
      obj.set(properties);

      // unshift the array
      for (var i = 1; i < _this.size; i++) {
        _this.objects[i-1] = _this.objects[i];
      }

      _this.objects[_this.lastIndex] = obj;
      _this.inUse++;
    },

    /**
     * Return all objects that are alive from the pool.
     * @memberof kontra.pool
     *
     * @returns {object[]}
     */
    getAliveObjects: function getAliveObjects() {
      return this.objects.slice(this.objects.length - this.inUse);
    },

    /**
     * Clear the object pool.
     * @memberof kontra.pool
     */
    clear: function clear() {
      this.inUse = 0;
      this.size = 1;
      this.lastIndex = 0;
      this.objects.length = 0;
      this.objects.push(this.create({}));
    },

    /**
     * Update all alive pool objects.
     * @memberof kontra.pool
     */
    update: function update() {
      var i = this.lastIndex;
      var obj;

      // only iterate over the objects that are alive
      var index = this.objects.length - this.inUse;

      while (i >= index) {
        obj = this.objects[i];

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
          this.inUse--;
          index++;
        }
        else {
          i--;
        }
      }
    },

    /**
     * render all alive pool objects.
     * @memberof kontra.pool
     */
    render: function render() {
      var index = this.objects.length - this.inUse;

      for (var i = this.lastIndex; i >= index; i--) {
        this.objects[i].render();
      }
    }
  };

  return kontra;
})(kontra || {});