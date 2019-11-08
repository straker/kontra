import GameObject from './gameObject.js';
import { Factory } from './utils.js';

/**
 * A versatile way to update and draw your sprites. It can handle simple rectangles, images, and sprite sheet animations. It can be used for your main player object as well as tiny particles in a particle engine.
 * @class Sprite
 * @extends GameObject
 *
 * @param {Object} properties - Properties of the sprite.
 * @param {Image|HTMLCanvasElement} [properties.image] - Use an image to draw the sprite.
 * @param {Object} [properties.animations] - An object of [Animations](api/animation) from a kontra.Spritesheet to animate the sprite.
 */
class Sprite extends GameObject {
  /**
   * @docs docs/api_docs/sprite.js
   */

  init(properties = {}) {

    /**
     * The width of the sprite. If the sprite is a [rectangle sprite](api/sprite#rectangle-sprite), it uses the passed in value. For an [image sprite](api/sprite#image-sprite) it is the width of the image. And for an [animation sprite](api/sprite#animation-sprite) it is the width of a single frame of the animation.
     *
     * Setting the value to a negative number will result in the sprite being flipped across the vertical axis while the width will remain a positive value.
     * @memberof Sprite
     * @property {Number} width
     */

    /**
     * The height of the sprite. If the sprite is a [rectangle sprite](api/sprite#rectangle-sprite), it uses the passed in value. For an [image sprite](api/sprite#image-sprite) it is the height of the image. And for an [animation sprite](api/sprite#animation-sprite) it is the height of a single frame of the animation.
     *
     * Setting the value to a negative number will result in the sprite being flipped across the horizontal axis while the height will remain a positive value.
     * @memberof Sprite
     * @property {Number} height
     */

    // @ifdef SPRITE_IMAGE||SPRITE_ANIMATION
    // fx = flipX, fy = flipY
    this._fx = this._fy = 1;
    // @endif

    super.init(properties);

    // @ifdef SPRITE_IMAGE
    /**
     * The image the sprite will use when drawn if passed as an argument.
     * @memberof Sprite
     * @property {Image|HTMLCanvasElement} image
     */

    let { width, height, image } = properties;
    if (image) {
      this.width = (width !== undefined) ? width : image.width;
      this.height = (height !== undefined) ? height : image.height;
    }
    // @endif
  }

  // @ifdef SPRITE_ANIMATION
  /**
   * An object of [Animations](api/animation) from a kontra.SpriteSheet to animate the sprite. Each animation is named so that it can can be used by name for the sprites [playAnimation()](api/sprite#playAnimation) function.
   *
   * ```js
   * import { Sprite, SpriteSheet } from 'kontra';
   *
   * let spriteSheet = SpriteSheet({
   *   // ...
   *   animations: {
   *     idle: {
   *       frames: 1,
   *       loop: false,
   *     },
   *     walk: {
   *       frames: [1,2,3]
   *     }
   *   }
   * });
   *
   * let sprite = Sprite({
   *   x: 100,
   *   y: 200,
   *   animations: spriteSheet.animations
   * });
   *
   * sprite.playAnimation('idle');
   * ```
   * @memberof Sprite
   * @property {Object} animations
   */
  get animations() {
    return this._a;
  }

  set animations(value) {
    let prop, firstAnimation;
    // a = animations
    this._a = {};

    // clone each animation so no sprite shares an animation
    for (prop in value) {
      this._a[prop] = value[prop].clone();

      // default the current animation to the first one in the list
      firstAnimation = firstAnimation || this._a[prop];
    }

    /**
     * The currently playing Animation object if `animations` was passed as an argument.
     * @memberof Sprite
     * @property {kontra.Animation} currentAnimation
     */
    this.currentAnimation = firstAnimation;
    this.width = this.width || firstAnimation.width;
    this.height = this.height || firstAnimation.height;
  }

  /**
   * Set the currently playing animation of an animation sprite.
   *
   * ```js
   * import { Sprite, SpriteSheet } from 'kontra';
   *
   * let spriteSheet = SpriteSheet({
   *   // ...
   *   animations: {
   *     idle: {
   *       frames: 1
   *     },
   *     walk: {
   *       frames: [1,2,3]
   *     }
   *   }
   * });
   *
   * let sprite = Sprite({
   *   x: 100,
   *   y: 200,
   *   animations: spriteSheet.animations
   * });
   *
   * sprite.playAnimation('idle');
   * ```
   * @memberof Sprite
   * @function playAnimation
   *
   * @param {String} name - Name of the animation to play.
   */
  playAnimation(name) {
    this.currentAnimation = this.animations[name];

    if (!this.currentAnimation.loop) {
      this.currentAnimation.reset();
    }
  }

  update(dt) {
    super.update(dt);
  }

  advance(dt) {
    super.advance(dt);

    if (this.currentAnimation) {
      this.currentAnimation.update(dt);
    }
  }
  // @endif

  // @ifdef SPRITE_IMAGE||SPRITE_ANIMATION
  get width() {
    return this._w;
  }

  get height() {
    return this._h;
  }

  set width(value) {
    let sign = value < 0 ? -1 : 1;

    this._fx = sign;
    this._w = value * sign;
  }

  set height(value) {
    let sign = value < 0 ? -1 : 1;

    this._fy = sign;
    this._h = value * sign;
  }
  // @endif

  _dc(x, y) {
    // @ifdef SPRITE_IMAGE||SPRITE_ANIMATION
    // flip sprite around the center so the x/y position does not change
    if (this._fx == -1 || this._fy == -1) {
      let translateX = this.width / 2 + x;
      let translateY = this.height / 2 + y;

      this.context.translate(translateX, translateY);
      this.context.scale(this._fx, this._fy);
      this.context.translate(-translateX, -translateY);
    }
    // @endif

    // @ifdef SPRITE_IMAGE
    if (this.image) {
      this.context.drawImage(
        this.image,
        0, 0, this.image.width, this.image.height,
        x, y, this.width, this.height
      );
    }
    // @endif

    // @ifdef SPRITE_ANIMATION
    if (this.currentAnimation) {
      this.currentAnimation.render({
        x: x,
        y: y,
        width: this.width,
        height: this.height,
        context: this.context
      });
    }
    // @endif

    if (this.color) {
      this.context.fillStyle = this.color;
      this.context.fillRect(x, y, this.width, this.height);
    }
  }
}

export default Factory(Sprite)
