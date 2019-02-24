class Pool {
  /**
   * Object pool. The pool will grow in size to accommodate as many objects as are needed.
   * Unused items are at the front of the pool and in use items are at the end of the pool.
   * @memberof kontra
   *
   * @param {object} properties - Properties of the pool.
   * @param {function} properties.create - Function that returns the object to use in the pool.
   * @param {number} properties.maxSize - The maximum size that the pool will grow to.
   */
  constructor(properties) {
    properties = properties || {};

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

    // c = create, i = inUse
    this._c = properties.create;
    this._i = 0;

    // start the pool with an object
    this.objects = [properties.create()];
    this.size = 1;
    this.maxSize = properties.maxSize || 1024;
  }

  /**
   * Get an object from the pool.
   * @memberof kontra.pool
   *
   * @param {object} properties - Properties to pass to object.init().
   *
   * @returns {object}
   */
  get(properties) {
    properties = properties || {};
    // the pool is out of objects if the first object is in use and it can't grow
    if (this.objects.length == this._i) {
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
    this._i++;
    return obj
  }

  /**
   * Return all objects that are alive from the pool.
   * @memberof kontra.pool
   *
   * @returns {object[]}
   */
  getAliveObjects() {
    return this.objects.slice(this.objects.length - this._i);
  }

  /**
   * Clear the object pool.
   * @memberof kontra.pool
   */
  clear() {
    this._i = this.objects.length = 0;
    this.size = 1;
    this.objects.push(this._c());
  }

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
    // the change until the next update and this._i won't be decremented. If the user then
    // gets an object when this._i is the same size as objects.length, this._i will increment
    // and this statement will evaluate to -1.
    //
    // I don't like having to go through the pool to kill an object as it forces you to
    // know which object came from which pool. Instead, we'll just prevent the index from
    // going below 0 and accept the fact that this._i may be out of sync for a frame.
    let index = Math.max(this.objects.length - this._i, 0);

    // only iterate over the objects that are alive
    while (i >= index) {
      obj = this.objects[i];

      obj.update(dt);

      // if the object is dead, move it to the front of the pool
      if (!obj.isAlive()) {
        this.objects = this.objects.splice(i, 1).concat(this.objects);
        this._i--;
        index++;
      }
      else {
        i--;
      }
    }
  }

  /**
   * render all alive pool objects.
   * @memberof kontra.pool
   */
  render() {
    let index = Math.max(this.objects.length - this._i, 0);

    for (let i = this.size - 1; i >= index; i--) {
      this.objects[i].render();
    }
  }
}


export default function PoolFactory(properties) {
  return new Pool(properties);
}
PoolFactory.prototype = Pool.prototype;