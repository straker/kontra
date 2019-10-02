/**
 * A collection of collision detection functions.
 *
 * @sectionName Collision
 */

/**
 *
 * @function spriteCollidesWith
 *
 * @param {Sprite} sprite - Sprite object.
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

