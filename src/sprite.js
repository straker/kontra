import { getContext } from './core.js'
import Vector from './vector.js'

/**
 * A versatile way to update and draw your game objects. It can handle simple rectangles, images, and sprite sheet animations. It can be used for your main player object as well as tiny particles in a particle engine.
 * @class Sprite
 *
 * @param {Object} properties - Properties of the sprite.
 * @param {Number} properties.x - X coordinate of the position vector.
 * @param {Number} properties.y - Y coordinate of the position vector.
 * @param {Number} [properties.dx] - X coordinate of the velocity vector.
 * @param {Number} [properties.dy] - Y coordinate of the velocity vector.
 * @param {Number} [properties.ddx] - X coordinate of the acceleration vector.
 * @param {Number} [properties.ddy] - Y coordinate of the acceleration vector.
 *
 * @param {String} [properties.color] - Fill color for the sprite if no image or animation is provided.
 * @param {Number} [properties.width] - Width of the sprite.
 * @param {Number} [properties.height] - Height of the sprite.
 *
 * @param {Number} [properties.ttl=Infinity] - How many frames the sprite should be alive. Used by kontra.Pool.
 * @param {Number} [properties.rotation=0] - Sprites rotation around the origin in radians.
 * @param {Number} [properties.anchor={x:0,y:0}] - The x and y origin of the sprite. {x:0, y:0} is the top left corner of the sprite, {x:1, y:1} is the bottom right corner.
 *
 * @param {Canvas​Rendering​Context2D} [properties.context] - The context the sprite should draw to. Defaults to [core.getContext()](api/core#getContext).
 *
 * @param {Image|HTMLCanvasElement} [properties.image] - Use an image to draw the sprite.
 * @param {Object} [properties.animations] - An object of [Animations](api/animation) from a kontra.Spritesheet to animate the sprite.
 *
 * @param {Function} [properties.update] - Function called every frame to update the sprite.
 * @param {Function} [properties.render] - Function called every frame to render the sprite.
 * @param {*} [properties.*] - Any additional properties you need added to the sprite. For example, if you pass `Sprite({type: 'player'})` then the sprite will also have a property of the same name and value. You can pass as many additional properties as you want.
 */
class Sprite {
  /**
   * @docs docs/api_docs/sprite.js
   */

  constructor(properties) {
    this.init(properties);
  }

  /**
   * Use this function to reinitialize a sprite. It takes the same properties object as the constructor. Useful it you want to repurpose a sprite.
   * @memberof Sprite
   * @function init
   *
   * @param {Object} properties - Properties of the sprite.
   */
  init(properties = {}) {

    // --------------------------------------------------
    // defaults
    // --------------------------------------------------

    /**
     * The sprites position vector. The sprites position is its position in the world, as opposed to the position in the [viewport](api/sprite#viewX). Typically the position in the world and the viewport are the same value. If the sprite has been [added to a tileEngine](/api/tileEngine#addObject), the position vector represents where in the tile world the sprite is while the viewport represents where to draw the sprite in relation to the top-left corner of the canvas.
     * @memberof Sprite
     * @property {kontra.Vector} position
     */
    this.position = Vector();

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
    this.width = this.height = 0;

    /**
     * The context the sprite will draw to.
     * @memberof Sprite
     * @property {Canvas​Rendering​Context2D} context
     */
    this.context = getContext();

    /**
     * The color of the sprite if it was passed as an argument.
     * @memberof Sprite
     * @property {String} color
     */

    // --------------------------------------------------
    // optionals
    // --------------------------------------------------

    // @ifdef SPRITE_VELOCITY
    /**
     * The sprites velocity vector.
     * @memberof Sprite
     * @property {kontra.Vector} velocity
     */
    this.velocity = Vector();
    // @endif

    // @ifdef SPRITE_ACCELERATION
    /**
     * The sprites acceleration vector.
     * @memberof Sprite
     * @property {kontra.Vector} acceleration
     */
    this.acceleration = Vector();
    // @endif

    // @ifdef SPRITE_ROTATION
    /**
     * The rotation of the sprite around the origin in radians.
     * @memberof Sprite
     * @property {Number} rotation
     */
    this.rotation = 0;
    // @endif

    // @ifdef SPRITE_TTL
    /**
     * How may frames the sprite should be alive. Primarily used by kontra.Pool to know when to recycle an object.
     * @memberof Sprite
     * @property {Number} ttl
     */
    this.ttl = Infinity;
    // @endif

    // @ifdef SPRITE_ANCHOR
    /**
     * The x and y origin of the sprite. {x:0, y:0} is the top left corner of the sprite, {x:1, y:1} is the bottom right corner.
     * @memberof Sprite
     * @property {Object} anchor
     *
     * @example
     * // exclude-code:start
     * let { Sprite } = kontra;
     * // exclude-code:end
     * // exclude-script:start
     * import { Sprite } from 'kontra';
     * // exclude-script:end
     *
     * let sprite = Sprite({
     *   x: 150,
     *   y: 100,
     *   color: 'red',
     *   width: 50,
     *   height: 50,
     *   // exclude-code:start
     *   context: context,
     *   // exclude-code:end
     *   render: function() {
     *     this.draw();
     *
     *     // draw origin
     *     this.context.fillStyle = 'yellow';
     *     this.context.beginPath();
     *     this.context.arc(this.x, this.y, 3, 0, 2*Math.PI);
     *     this.context.fill();
     *   }
     * });
     * sprite.render();
     *
     * sprite.anchor = {x: 0.5, y: 0.5};
     * sprite.x = 300;
     * sprite.render();
     *
     * sprite.anchor = {x: 1, y: 1};
     * sprite.x = 450;
     * sprite.render();
     */
    this.anchor = {x: 0, y: 0};
    // @endif

    // @ifdef SPRITE_CAMERA
    /**
     * The X coordinate of the camera. Used to determine [viewX](api/sprite#viewX).
     * @memberof Sprite
     * @property {Number} sx
     */

    /**
     * The Y coordinate of the camera. Used to determine [viewY](api/sprite#viewY).
     * @memberof Sprite
     * @property {Number} sy
     */
    this.sx = this.sy = 0;
    // @endif

    // @ifdef SPRITE_IMAGE||SPRITE_ANIMATION
    // fx = flipX, fy = flipY
    this._fx = this._fy = 1;
    // @endif

    // add all properties to the sprite, overriding any defaults
    Object.assign(this, properties);

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

  // define getter and setter shortcut functions to make it easier to work with the
  // position, velocity, and acceleration vectors.

  /**
   * X coordinate of the position vector.
   * @memberof Sprite
   * @property {Number} x
   */
  get x() {
    return this.position.x;
  }

  /**
   * Y coordinate of the position vector.
   * @memberof Sprite
   * @property {Number} y
   */
  get y() {
    return this.position.y;
  }

  set x(value) {
    this.position.x = value;
  }

  set y(value) {
    this.position.y = value;
  }

  // @ifdef SPRITE_VELOCITY
  /**
   * X coordinate of the velocity vector.
   * @memberof Sprite
   * @property {Number} dx
   */
  get dx() {
    return this.velocity.x;
  }

  /**
   * Y coordinate of the velocity vector.
   * @memberof Sprite
   * @property {Number} dy
   */
  get dy() {
    return this.velocity.y;
  }

  set dx(value) {
    this.velocity.x = value;
  }

  set dy(value) {
    this.velocity.y = value;
  }
  // @endif

  // @ifdef SPRITE_ACCELERATION
  /**
   * X coordinate of the acceleration vector.
   * @memberof Sprite
   * @property {Number} ddx
   */
  get ddx() {
    return this.acceleration.x;
  }

  /**
   * Y coordinate of the acceleration vector.
   * @memberof Sprite
   * @property {Number} ddy
   */
  get ddy() {
    return this.acceleration.y;
  }

  set ddx(value) {
    this.acceleration.x = value;
  }

  set ddy(value) {
    this.acceleration.y = value;
  }
  // @endif

  // @ifdef SPRITE_CAMERA
  /**
   * Readonly. X coordinate of where to draw the sprite. Typically the same value as the [position vector](api/sprite#position) unless the sprite has been [added to a tileEngine](api/tileEngine#addObject).
   * @memberof Sprite
   * @property {Number} viewX
   */
  get viewX() {
    return this.x - this.sx;
  }

  /**
   * Readonly. Y coordinate of where to draw the sprite. Typically the same value as the [position vector](api/sprite#position) unless the sprite has been [added to a tileEngine](api/tileEngine#addObject).
   * @memberof Sprite
   * @property {Number} viewY
   */
  get viewY() {
    return this.y - this.sy;
  }

  // readonly
  set viewX(value) {
    return;
  }

  set viewY(value) {
    return;
  }
  // @endif

  // @ifdef SPRITE_TTL
  /**
   * Check if the sprite is alive. Primarily used by kontra.Pool to know when to recycle an object.
   * @memberof Sprite
   * @function isAlive
   *
   * @returns {Boolean} `true` if the sprites [ttl](api/sprite#ttl) property is above `0`, `false` otherwise.
   */
  isAlive() {
    return this.ttl > 0;
  }
  // @endif

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

  /**
   * Update the sprites position based on its velocity and acceleration. Calls the sprites [advance()](api/sprite#advance) function.
   * @memberof Sprite
   * @function update
   *
   * @param {Number} [dt] - Time since last update.
   */
  update(dt) {
    // @ifdef SPRITE_VELOCITY||SPRITE_ACCELERATION||SPRITE_TTL||SPRITE_ANIMATION
    this.advance(dt)
    // @endif
  }

  // @ifdef SPRITE_VELOCITY||SPRITE_ACCELERATION||SPRITE_TTL
  /**
   * Move the sprite by its acceleration and velocity. If the sprite is an [animation sprite](api/sprite#animation-sprite), it also advances the animation every frame.
   *
   * If you override the sprites [update()](api/sprite#update) function with your own update function, you can call this function to move the sprite normally.
   *
   * ```js
   * import { Sprite } from 'kontra';
   *
   * let sprite = Sprite({
   *   x: 100,
   *   y: 200,
   *   width: 20,
   *   height: 40,
   *   dx: 5,
   *   dy: 2,
   *   update: function() {
   *     // move the sprite normally
   *     sprite.advance();
   *
   *     // change the velocity at the edges of the canvas
   *     if (this.x < 0 ||
   *         this.x + this.width > this.context.canvas.width) {
   *       this.dx = -this.dx;
   *     }
   *     if (this.y < 0 ||
   *         this.y + this.height > this.context.canvas.height) {
   *       this.dy = -this.dy;
   *     }
   *   }
   * });
   * ```
   * @memberof Sprite
   * @function advance
   *
   * @param {Number} [dt] - Time since last update.
   *
   */
  advance(dt) {
    // @ifdef SPRITE_VELOCITY

    // @ifdef SPRITE_ACCELERATION
    this.velocity = this.velocity.add(this.acceleration, dt);
    // @endif

    this.position = this.position.add(this.velocity, dt);
    // @endif

    // @ifdef SPRITE_TTL
    this.ttl--;
    // @endif

    // @ifdef SPRITE_ANIMATION
    if (this.currentAnimation) {
      this.currentAnimation.update(dt);
    }
    // @endif
  }
  // @endif

  /**
   * Render the sprite. Calls the sprites [draw()](api/sprite#draw) function.
   * @memberof Sprite
   * @function render
   */
  render() {
    this.draw();
  }

  /**
   * Draw the sprite at its X and Y position. This function changes based on the type of the sprite. For a [rectangle sprite](api/sprite#rectangle-sprite), it uses `context.fillRect()`, for an [image sprite](api/sprite#image-sprite) it uses `context.drawImage()`, and for an [animation sprite](api/sprite#animation-sprite) it uses the [currentAnimation](api/sprite#currentAnimation) `render()` function.
   *
   * If you override the sprites `render()` function with your own render function, you can call this function to draw the sprite normally.
   *
   * ```js
   * import { Sprite } from 'kontra';
   *
   * let sprite = Sprite({
   *  x: 290,
   *  y: 80,
   *  color: 'red',
   *  width: 20,
   *  height: 40,
   *
   *  render: function() {
   *    // draw the rectangle sprite normally
   *    this.draw();
   *
   *    // outline the sprite
   *    this.context.strokeStyle = 'yellow';
   *    this.context.lineWidth = 2;
   *    this.context.strokeRect(this.x, this.y, this.width, this.height);
   *  }
   * });
   *
   * sprite.render();
   * ```
   * @memberof Sprite
   * @function draw
   */
  draw() {
    let anchorWidth = 0;
    let anchorHeight = 0;
    let viewX = this.x;
    let viewY = this.y;

    // @ifdef SPRITE_ANCHOR
    anchorWidth = -this.width * this.anchor.x;
    anchorHeight = -this.height * this.anchor.y;
    // @endif

    // @ifdef SPRITE_CAMERA
    viewX = this.viewX;
    viewY = this.viewY;
    // @endif

    this.context.save();
    this.context.translate(viewX, viewY);

    // @ifdef SPRITE_ROTATION
    // rotate around the anchor
    if (this.rotation) {
      this.context.rotate(this.rotation);
    }
    // @endif

    // @ifdef SPRITE_IMAGE||SPRITE_ANIMATION
    // flip sprite around the center so the x/y position does not change
    if (this._fx == -1 || this._fy == -1) {
      let x = this.width / 2 + anchorWidth;
      let y = this.height / 2 + anchorHeight;

      this.context.translate(x, y);
      this.context.scale(this._fx, this._fy);
      this.context.translate(-x, -y);
    }
    // @endif

    // @ifdef SPRITE_IMAGE
    if (this.image) {
      this.context.drawImage(
        this.image,
        0, 0, this.image.width, this.image.height,
        anchorWidth, anchorHeight, this.width, this.height
      );
    }
    // @endif

    // @ifdef SPRITE_ANIMATION
    if (this.currentAnimation) {
      this.currentAnimation.render({
        x: anchorWidth,
        y: anchorHeight,
        width: this.width,
        height: this.height,
        context: this.context
      });
    }
    // @endif

    if (this.color) {
      this.context.fillStyle = this.color;
      this.context.fillRect(anchorWidth, anchorHeight, this.width, this.height);
    }

    this.context.restore();
  }
}

export default function spriteFactory(properties) {
  return new Sprite(properties);
}
spriteFactory.prototype = Sprite.prototype;
spriteFactory.class = Sprite;
