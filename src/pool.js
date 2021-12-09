/**
 * A fast and memory efficient [object pool](https://gameprogrammingpatterns.com/object-pool.html) for sprite reuse. Perfect for particle systems or SHUMPs. The pool starts out with just one object, but will grow in size to accommodate as many objects as are needed.
 *
 * <canvas width="600" height="200" id="pool-example"></canvas>
 * <script src="assets/js/pool.js"></script>
 * @class Pool
 *
 * @param {Object} properties - Properties of the pool.
 * @param {() => {update: (dt?: number) => void, render: Function, init: (properties?: object) => void, isAlive: () => boolean}} properties.create - Function that returns a new object to be added to the pool when there are no more alive objects.
 * @param {Number} [properties.maxSize=1024] - The maximum number of objects allowed in the pool. The pool will never grow beyond this size.
 */
class Pool {
  /**
   * @docs docs/api_docs/pool.js
   */

  constructor({ create, maxSize = 1024 } = {}) {
    // @ifdef DEBUG
    // check for the correct structure of the objects added to pools
    // so we know that the rest of the pool code will work without
    // errors
    let obj;
    if (
      !create ||
      !(obj = create()) ||
      !(obj.update && obj.init && obj.isAlive && obj.render)
    ) {
      throw Error(
        'Must provide create() function which returns an object with init(), update(), render(), and isAlive() functions'
      );
    }
    // @endif

    // c = create
    this._c = create;

    /**
     * All objects currently in the pool, both alive and not alive.
     * @memberof Pool
     * @property {Object[]} objects
     */
    this.objects = [create()]; // start the pool with an object

    /**
     * The number of alive objects.
     * @memberof Pool
     * @property {Number} size
     */
    this.size = 0;

    /**
     * The maximum number of objects allowed in the pool. The pool will never grow beyond this size.
     * @memberof Pool
     * @property {Number} maxSize
     */
    this.maxSize = maxSize;
  }

  /**
   * Get and return an object from the pool. The properties parameter will be passed directly to the objects `init()` function. If you're using a [Sprite](api/sprite), you should also pass the `ttl` property to designate how many frames you want the object to be alive for.
   *
   * If you want to control when the sprite is ready for reuse, pass `Infinity` for `ttl`. You'll need to set the sprites `ttl` to `0` when you're ready for the sprite to be reused.
   *
   * ```js
   * // exclude-tablist
   * let sprite = pool.get({
   *   // the object will get these properties and values
   *   x: 100,
   *   y: 200,
   *   width: 20,
   *   height: 40,
   *   color: 'red',
   *
   *   // pass Infinity for ttl to prevent the object from being reused
   *   // until you set it back to 0
   *   ttl: Infinity
   * });
   * ```
   * @memberof Pool
   * @function get
   *
   * @param {Object} [properties] - Properties to pass to the objects `init()` function.
   *
   * @returns {Object} The newly initialized object.
   */
  get(properties = {}) {
    // the pool is out of objects if the first object is in use and
    // it can't grow
    if (this.size == this.objects.length) {
      if (this.size == this.maxSize) {
        return;
      }

      // double the size of the array by adding twice as many new
      // objects to the end
      for (
        let i = 0;
        i < this.size && this.objects.length < this.maxSize;
        i++
      ) {
        this.objects.push(this._c());
      }
    }

    // save off first object in pool to reassign to last object after
    // unshift
    let obj = this.objects[this.size];
    this.size++;
    obj.init(properties);
    return obj;
  }

  /**
   * Returns an array of all alive objects. Useful if you need to do special processing on all alive objects outside of the pool, such as to add all alive objects to a [Quadtree](api/quadtree).
   * @memberof Pool
   * @function getAliveObjects
   *
   * @returns {Object[]} An Array of all alive objects.
   */
  getAliveObjects() {
    return this.objects.slice(0, this.size);
  }

  /**
   * Clear the object pool. Removes all objects from the pool and resets its [size](api/pool#size) to 1.
   * @memberof Pool
   * @function clear
   */
  clear() {
    this.size = this.objects.length = 0;
    this.objects.push(this._c());
  }

  /**
   * Update all alive objects in the pool by calling the objects `update()` function. This function also manages when each object should be recycled, so it is recommended that you do not call the objects `update()` function outside of this function.
   * @memberof Pool
   * @function update
   *
   * @param {Number} [dt] - Time since last update.
   */
  update(dt) {
    let obj;
    let doSort = false;
    for (let i = this.size; i--; ) {
      obj = this.objects[i];

      obj.update(dt);

      if (!obj.isAlive()) {
        doSort = true;
        this.size--;
      }
    }
    // sort all dead elements to the end of the pool
    if (doSort) {
      this.objects.sort((a, b) => b.isAlive() - a.isAlive());
    }
  }

  /**
   * Render all alive objects in the pool by calling the objects `render()` function.
   * @memberof Pool
   * @function render
   */
  render() {
    for (let i = this.size; i--; ) {
      this.objects[i].render();
    }
  }
}

export default function factory() {
  return new Pool(...arguments);
}
export { Pool as PoolClass };
