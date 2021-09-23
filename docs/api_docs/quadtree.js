/**
 * Every frame you should remove all objects from the quadtree using its [clear()](api/quadtree/#clear) function and then add all objects back using its [add()](api/quadtree/#add) function. You can add a single object, a list of objects, or an array of objects.
 *
 * ```js
 * import { Quadtree, Sprite, GameLoop } from 'kontra';
 *
 * let quadtree = Quadtree();
 * let player = Sprite({
 *   // ...
 * });
 * let enemy = Sprite({
 *   // ...
 * });
 *
 * let loop = GameLoop({
 *   update: function() {
 *     quadtree.clear();
 *     quadtree.add(player, enemy);
 *   }
 * });
 * ```
 *
 * You should clear the quadtree each frame since the quadtree is only a snapshot of the position of the objects when they were added. Since the quadtree doesn't know anything about those objects, it doesn't know when an object moved or when it should be removed from the tree.
 *
 * Objects added to the tree must have the properties `x`, `y`, `width`, and `height` so that their position in the quadtree can be calculated. [Sprite](api/sprite) defines these properties for you.
 *
 * When you need to get all objects in the same node as another object, use the quadtrees [get()](api/quadtree#get) function.
 *
 * ```js
 * // exclude-tablist
 * let objects = quadtree.get(player);  //=> [enemy]
 * ```
 * @sectionName Basic Use
 */
