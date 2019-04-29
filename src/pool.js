/**
 * A fast and memory efficient object pool for sprite reuse. Perfect for particle systems or SHUMPs. The pool starts out with just 1 object, but will grow in size to accommodate as many objects as are needed.
 *
 * ```js
 * import { Pool, Sprite } from 'kontra';
 *
 * let pool = Pool({
 *   create: Sprite,
 *   maxSize: 100
 * });
 * ```
 * @class Pool
 *
 * @param {Object} properties - Properties of the pool.
 * @param {Function} properties.create - Function that returns a new object to be added to the pool when there are no objects able to be reused.
 * @param {Number} [properties.maxSize=1024] - The maximum number of objects allowed in the pool. The pool will never grow beyond this size.
 */
class Pool {

  /**
   * To use the pool, you must pass the `create()` function, which should return a new kontra.Sprite or object. This object will be added to the pool every time there are no more alive objects.
   *
   * The object must implement the functions `update(dt)`, `init(properties)`, and `isAlive()`. If one of these functions is missing the pool will throw an error. kontra.Sprite defines these functions for you.
   *
   * An object is available for reuse when its `isAlive()` function returns `false`. For a sprite, this is typically when its ttl is `0`.
   *
   * When you want an object from the pool, use the pools `get(properties)` function and pass it any properties you want the newly initialized object to have.
   *
   * ```js
   * let pool = Pool({
   *   // create a new sprite every time the pool needs new objects
   *   create: Sprite
   * });
   *
   * // properties will be passed to the sprites init() function
   * pool.get({
   *   x: 100,
   *   y: 200,
   *   width: 20,
   *   height: 40,
   *   color: 'red',
   *   ttl: 60
   * });
   * ```
   *
   * When you want to update or render all alive objects in the pool, use the pools `update()` and `render()` functions.
   *
   * ```js
   * let loop = GameLoop({
   *   update: function() {
   *     pool.update();
   *   },
   *   render: function() {
   *     pool.render();
   *   }
   * });
   * ```
   * @sectionName Basic Use
   */

  constructor({create, maxSize = 1024} = {}) {

    // check for the correct structure of the objects added to pools so we know that the
    // rest of the pool code will work without errors
    // @if DEBUG
    let obj;
    if (!create ||
        ( !( obj = create() ) ||
          !( obj.update && obj.init &&
             obj.isAlive )
       )) {
      throw Error('Must provide create() function which returns an object with init(), update(), and isAlive() functions');
    }
    // @endif

    // c = create, i = inUse
    this._c = create;
    this._i = 0;

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
    this.size = 1;

    /**
     * The maximum number of objects allowed in the pool. The pool will never grow beyond this size.
     * @memberof Pool
     * @property {Number} maxSize
     */
    this.maxSize = maxSize;
  }

  /**
   * Get and return an object from the pool. The properties parameter will be passed directly to the objects `init(properties)` function. If you're using a [Sprite](Sprite.html), you should also pass the `ttl` property to designate how many frames you want the object to be alive for.
   *
   * If you want to control when the sprite is ready for reuse, pass `Infinity` for `ttl`. You'll need to set the sprites `ttl` to `0` when you're ready for the sprite to be reused.
   *
   * ```js
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
   * @param {Object} properties - Properties to pass to the objects `init(properties)` function.
   *
   * @returns {Object} The newly initialized object.
   */
  get(properties = {}) {
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
   * Returns an array of all alive objects. Useful if you need to do special processing on all alive objects outside of the pool, such as add all alive objects to a kontra.Quadtree.
   * @memberof Pool
   * @function getAliveObjects
   *
   * @returns {Object[]} An Array of all alive objects.
   */
  getAliveObjects() {
    return this.objects.slice(this.objects.length - this._i);
  }

  /**
   * Clear the object pool. Removes all objects from the pool and resets its [size](#size) to 1.
   * @memberof Pool
   * @function clear
   */
  clear() {
    this._i = this.objects.length = 0;
    this.size = 1;
    this.objects.push(this._c());
  }

  /**
   * Update all alive objects in the pool by calling the objects update() function. This function also manages when each object should be recycled, so it is recommended that you do not call the objects update() function outside of this function.
   * @memberof Pool
   * @function update
   *
   * @param {Number} [dt] - Time since last update.
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
   * Render all alive objects in the pool by calling the objects `render()` function.
   * @memberof Pool
   * @function render
   */
  render() {
    let index = Math.max(this.objects.length - this._i, 0);

    for (let i = this.size - 1; i >= index; i--) {
      this.objects[i].render();
    }
  }
}


export default function poolFactory(properties) {
  return new Pool(properties);
}
poolFactory.prototype = Pool.prototype;