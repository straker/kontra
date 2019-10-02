/**
 * A collection of collision detection functions.
 *
 * @sectionName Collision
 */

/**
 * Check if the sprite collide with the object. Uses a simple [Axis-Aligned Bounding Box (AABB) collision check](https://developer.mozilla.org/en-US/docs/Games/Techniques/2D_collision_detection#Axis-Aligned_Bounding_Box). Takes into account the sprites [anchor](api/sprite/#anchor).
 *
 * **NOTE:** Does not take into account sprite rotation. If you need collision detection between rotated sprites, I suggest looking at the Separate Axis Theorem.
 *
 * ```js
 * import { Sprite, spriteCollidesWith } from 'kontra';
 *
 * let sprite = Sprite({
 *   x: 100,
 *   y: 200,
 *   width: 20,
 *   height: 40,
 *   collidesWith: function (object) {
 *     return spriteCollidesWith(this, object);
 *   },
 * });
 *
 * let sprite2 = Sprite({
 *   x: 150,
 *   y: 200,
 *   width: 20,
 *   height: 20
 * });
 *
 * sprite.collidesWith(sprite2);  //=> false
 *
 * sprite2.x = 115;
 *
 * sprite.collidesWith(sprite2);  //=> true
 * ```
 * @function spriteCollidesWith
 *
 * @param {Sprite} sprite - Sprite base object.
 * @param {Object} object - Object to check collision against.
 *
 * @returns {Boolean|null} `true` if the objects collide, `false` otherwise. Will return `null` if the either of the two objects are rotated.
 */

export function spriteCollidesWith(sprite, object) {
  if (sprite.rotation || object.rotation) return null;

  // take into account sprite anchors
  let x = sprite.x - sprite.width * sprite.anchor.x;
  let y = sprite.y - sprite.height * sprite.anchor.y;

  let objX = object.x;
  let objY = object.y;
  if (object.anchor) {
    objX -= object.width * object.anchor.x;
    objY -= object.height * object.anchor.y;
  }

  return x < objX + object.width &&
         x + sprite.width > objX &&
         y < objY + object.height &&
         y + sprite.height > objY;
}

