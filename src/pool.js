(function() {

  /**
   * Object pool. The pool will grow in size to accommodate as many objects as are needed.
   * Unused items are at the front of the pool and in use items are at the end of the pool.
   * @memberof kontra
   *
   * @param {object} properties - Properties of the pool.
   * @param {function} properties.create - Function that returns the object to use in the pool.
   * @param {number} properties.maxSize - The maximum size that the pool will grow to.
   */
  kontra.pool = function(properties) {
    properties = properties || {};

    let inUse = 0;

    // check for the correct structure of the objects added to pools so we know that the
    // rest of the pool code will work without errors
    // @if DEBUG
    let obj;
    if (!properties.create ||
        ( !( obj = properties.create() ) ||
          !( obj.update && obj.init &&
             obj.isAlive )
       )) {
      throw Error('Must provide create() function which returns an object with init(), update(), and isAlive() functions');
    }
    // @endif

    return {
      _c: properties.create,

      // start the pool with an object
      objects: [properties.create()],
      size: 1,
      maxSize: properties.maxSize || 1024,

      /**
       * Get an object from the pool.
       * @memberof kontra.pool
       *
       * @param {object} properties - Properties to pass to object.init().
       */
      get(properties) {
        properties = properties || {};

        // the pool is out of objects if the first object is in use and it can't grow
        if (this.objects[0].isAlive()) {
          if (this.size === this.maxSize) {
            return;
          }
          // double the size of the array by filling it with twice as many objects
          else {
            for (let x = 0; x < this.size && this.objects.length < this.maxSize; x++) {
              this.objects.unshift(this._c());
            }

            this.size = this.objects.length;
          }
        }

        // save off first object in pool to reassign to last object after unshift
        let obj = this.objects.shift();
        obj.init(properties);
        this.objects.push(obj);
        inUse++;
      },

      /**
       * Return all objects that are alive from the pool.
       * @memberof kontra.pool
       *
       * @returns {object[]}
       */
      getAliveObjects() {
        return this.objects.slice(this.objects.length - inUse);
      },

      /**
       * Clear the object pool.
       * @memberof kontra.pool
       */
      clear() {
        inUse = this.objects.length = 0;
        this.size = 1;
        this.objects.push(this._c());
      },

      /**
       * Update all alive pool objects.
       * @memberof kontra.pool
       *
       * @param {number} dt - Time since last update.
       */
      update(dt) {
        let i = this.size - 1;
        let obj;

        // If the user kills an object outside of the update cycle, the pool won't know of
        // the change until the next update and inUse won't be decremented. If the user then
        // gets an object when inUse is the same size as objects.length, inUse will increment
        // and this statement will evaluate to -1.
        //
        // I don't like having to go through the pool to kill an object as it forces you to
        // know which object came from which pool. Instead, we'll just prevent the index from
        // going below 0 and accept the fact that inUse may be out of sync for a frame.
        let index = Math.max(this.objects.length - inUse, 0);

        // only iterate over the objects that are alive
        while (i >= index) {
          obj = this.objects[i];

          obj.update(dt);

          // if the object is dead, move it to the front of the pool
          if (!obj.isAlive()) {
            this.objects = this.objects.splice(i, 1).concat(this.objects);
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
      render() {
        let index = Math.max(this.objects.length - inUse, 0);

        for (let i = this.size - 1; i >= index; i--) {
          this.objects[i].render();
        }
      }
    };
  };
})();
