/**
 * To use the pool, you must pass the `create()` function argument, which should return a new [Sprite](api/sprite) or object. This object will be added to the pool every time there are no more alive objects.
 *
 * The object must implement the functions `update()`, `render()`, `init()`, and `isAlive()`. If one of these functions is missing the pool will throw an error. [Sprite](api/sprite) defines these functions for you.
 *
 * An object is available for reuse when its `isAlive()` function returns `false`. For a sprite, this is typically when its ttl is `0`.
 *
 * When you want an object from the pool, use the pools [get()](api/pool/#get) function and pass it any properties you want the newly initialized object to have.
 *
 * ```js
 * import { Pool, Sprite } from 'kontra';
 *
 * let pool = Pool({
 *   // create a new sprite every time the pool needs a new object
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
 * When you want to update or render all alive objects in the pool, use the pools [update()](api/pool/#update) and [render()](api/pool/#render) functions.
 *
 * ```js
 * import { GameLoop } from 'kontra';
 *
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