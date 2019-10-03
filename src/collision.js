/**
 * A collection of collision detection functions.
 *
 * @sectionName Collision
 */

/**
 * Check if a two objects collide. Uses a simple [Axis-Aligned Bounding Box (AABB) collision check](https://developer.mozilla.org/en-US/docs/Games/Techniques/2D_collision_detection#Axis-Aligned_Bounding_Box). Takes into account the sprites [anchor](api/sprite/#anchor).
 *
 * **NOTE:** Does not take into account object rotation. If you need collision detection between rotated objects you will need to implement your own `collides()` function. I suggest looking at the Separate Axis Theorem.
 *
 *
 * ```js
 * import { Sprite, collides } from 'kontra';
 *
 * let sprite = Sprite({
 *   x: 100,
 *   y: 200,
 *   width: 20,
 *   height: 40
 * });
 *
 * let sprite2 = Sprite({
 *   x: 150,
 *   y: 200,
 *   width: 20,
 *   height: 20
 * });
 *
 * collides(sprite, sprite2);  //=> false
 *
 * sprite2.x = 115;
 *
 * collides(sprite, sprite2);  //=> true
 * ```
 * @function collides
 *
 * @param {Sprite} object - Object reference.
 * @param {Object} object - Object to check collision against.
 *
 * @returns {Boolean|null} `true` if the objects collide, `false` otherwise. Will return `null` if the either of the two objects are rotated.
 */

export function collides(object1, object2) {
  if (object1.rotation || object2.rotation) return null;

  // take into account object1 anchors
  let x = object1.x;
  let y = object1.y;
  if (object1.anchor) {
    x -= object1.width * object1.anchor.x;
    y -= object1.height * object1.anchor.y;
  }

  let objX = object2.x;
  let objY = object2.y;
  if (object2.anchor) {
    objX -= object2.width * object2.anchor.x;
    objY -= object2.height * object2.anchor.y;
  }

  return x < objX + object2.width &&
         x + object1.width > objX &&
         y < objY + object2.height &&
         y + object1.height > objY;
}

