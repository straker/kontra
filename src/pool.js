(function(kontra) {

  /**
   * Object pool. The pool will grow in size to accommodate as many objects as are needed.
   * Unused items are at the front of the pool and in use items are at the of the pool.
   * @memberof kontra
   *
   * @param {object} properties - Properties of the pool.
   * @param {function} properties.create - Function that returns the object to use in the pool.
   * @param {number} properties.maxSize - The maximum size that the pool will grow to.
   */
  kontra.pool = function(properties) {
    properties = properties || {};

    var lastIndex = 0;
    var inUse = 0;
    var obj;

    // check for the correct structure of the objects added to pools so we know that the
    // rest of the pool code will work without errors
    if (!kontra._isFunc(properties.create) ||
        ( !( obj = properties.create() ) ||
          !( kontra._isFunc(obj.update) && kontra._isFunc(obj.init) &&
             kontra._isFunc(obj.isAlive) )
       )) {
      throw Error('Must provide create() function which returns an object with init(), update(), and isAlive() functions');
    }

    return {
      create: properties.create,

      // start the pool with an object
      objects: [obj],
      size: 1,
      maxSize: properties.maxSize || Infinity,

      /**
       * Get an object from the pool.
       * @memberof kontra.pool
       *
       * @param {object} properties - Properties to pass to object.init().
       */
      get: function get(properties) {
        properties = properties || {};

        // the pool is out of objects if the first object is in use and it can't grow
        if (this.objects[0].isAlive()) {
          if (this.size === this.maxSize) {
            return;
          }
          // double the size of the array by filling it with twice as many objects
          else {
            for (var x = 0; x < this.size && this.objects.length < this.maxSize; x++) {
              this.objects.unshift(this.create());
            }

            this.size = this.objects.length;
            lastIndex = this.size - 1;
          }
        }

        // save off first object in pool to reassign to last object after unshift
        var obj = this.objects[0];
        obj.init(properties);

        // unshift the array
        for (var i = 1; i < this.size; i++) {
          this.objects[i-1] = this.objects[i];
        }

        this.objects[lastIndex] = obj;
        inUse++;
      },

      /**
       * Return all objects that are alive from the pool.
       * @memberof kontra.pool
       *
       * @returns {object[]}
       */
      getAliveObjects: function getAliveObjects() {
        return this.objects.slice(this.objects.length - inUse);
      },

      /**
       * Clear the object pool.
       * @memberof kontra.pool
       */
      clear: function clear() {
        inUse = lastIndex = this.objects.length = 0;
        this.size = 1;
        this.objects.push(this.create());
      },

      /**
       * Update all alive pool objects.
       * @memberof kontra.pool
       *
       * @param {number} dt - Time since last update.
       */
      update: function update(dt) {
        var i = lastIndex;
        var obj;

        // If the user kills an object outside of the update cycle, the pool won't know of
        // the change until the next update and inUse won't be decremented. If the user then
        // gets an object when inUse is the same size as objects.length, inUse will increment
        // and this statement will evaluate to -1.
        //
        // I don't like having to go through the pool to kill an object as it forces you to
        // know which object came from which pool. Instead, we'll just prevent the index from
        // going below 0 and accept the fact that inUse may be out of sync for a frame.
        var index = Math.max(this.objects.length - inUse, 0);

        // only iterate over the objects that are alive
        while (i >= index) {
          obj = this.objects[i];

          obj.update(dt);

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
            inUse--;
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
        var index = Math.max(this.objects.length - inUse, 0);

        for (var i = lastIndex; i >= index; i--) {
          this.objects[i].render && this.objects[i].render();
        }
      }
    };
  };
})(kontra);