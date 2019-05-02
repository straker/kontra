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
 * @param {Object} [properties.animations] - An object of [Animations](animation) from a kontra.Spritesheet to animate the sprite.
 *
 * @param {Function} [properties.update] - Function called every frame to update the sprite.
 * @param {Function} [properties.render] - Function called every frame to render the sprite.
 * @param {*} [properties.*] - Any additional properties you need added to the sprite. For example, if you pass `Sprite({type: 'player'})` then the sprite will also have a property of the same name and value. You can pass as many additional properties as you want.
 */
class Sprite {

  /**
   * In its most basic form, a sprite is a rectangle with a fill color. To create a rectangle sprite, pass the arguments `width`, `height`, and `color`. A rectangle sprite is great for initial prototyping and particles.
   *
   * @sectionName Rectangle Sprite
   * @example
   * // exclude-code:start
   * let { Sprite } = kontra;
   * // exclude-code:end
   * // exclude-script:start
   * import { Sprite } from 'kontra';
   * // exclude-script:end
   *
   * let sprite = Sprite({
   *   x: 300,
   *   y: 100,
   *   anchor: {x: 0.5, y: 0.5},
   *
   *   // required for a rectangle sprite
   *   width: 20,
   *   height: 40,
   *   color: 'red'
   * });
   * // exclude-code:start
   * sprite.context = context;
   * // exclude-code:end
   *
   * sprite.render();
   */

  /**
   * A sprite can use an image instead of drawing a rectangle. To create an image sprite, pass the `image` argument. The size of the sprite will automatically be set as the width and height of the image.
   *
   * @sectionName Image Sprite
   * @example
   * // exclude-code:start
   * let { Sprite } = kontra;
   * // exclude-code:end
   * // exclude-script:start
   * import { Sprite } from 'kontra';
   * // exclude-script:end
   *
   * let image = new Image();
   * image.src = '../assets/imgs/character.png';
   * image.onload = function() {
   *   let sprite = Sprite({
   *     x: 300,
   *     y: 100,
   *     anchor: {x: 0.5, y: 0.5},
   *
   *     // required for an image sprite
   *     image: image
   *   });
   *   // exclude-code:start
   *   sprite.context = context;
   *   // exclude-code:end
   *
   *   sprite.render();
   * };
   */

  /**
   * A sprite can use a spritesheet animation as well. To create an animation sprite, pass the `animations` argument. The size of the sprite will automatically be set as the width and height of a frame of the spritesheet.
   *
   * A sprite can have multiple named animations. The easiest way to create animations is to use kontra.SpriteSheet. All animations will automatically be [cloned](animation#clone) so no two sprites update the same animation.
   *
   * @sectionName Animation Sprite
   * @example
   * // exclude-code:start
   * let { Sprite, SpriteSheet, GameLoop } = kontra;
   * // exclude-code:end
   * // exclude-script:start
   * import { Sprite, SpriteSheet, GameLoop } from 'kontra';
   * // exclude-script:end
   *
   * let image = new Image();
   * image.src = '../assets/imgs/character_walk_sheet.png';
   * image.onload = function() {
   *
   *   // use spriteSheet to create animations from an image
   *   let spriteSheet = SpriteSheet({
   *     image: image,
   *     frameWidth: 72,
   *     frameHeight: 97,
   *     animations: {
   *       // create a named animation: walk
   *       walk: {
   *         frames: '0..9',  // frames 0 through 9
   *         frameRate: 30
   *       }
   *     }
   *   });
   *
   *   let sprite = Sprite({
   *     x: 300,
   *     y: 100,
   *     anchor: {x: 0.5, y: 0.5},
   *
   *     // required for an animation sprite
   *     animations: spriteSheet.animations
   *   });
   *   // exclude-code:start
   *   sprite.context = context;
   *   // exclude-code:end
   *
   *   // use kontra.gameLoop to play the animation
   *   let loop = GameLoop({
   *   // exclude-code:start
   *   clearCanvas: false,
   *   // exclude-code:end
   *     update: function(dt) {
   *       sprite.update();
   *     },
   *     render: function() {
   *       // exclude-code:start
   *       context.clearRect(0,0,context.canvas.width,context.canvas.height);
   *       // exclude-code:end
   *       sprite.render();
   *     }
   *   });
   *
   *   loop.start();
   * };
   */

  /**
   * If you need to draw a different shape, such as a circle, you can pass in custom properties and a render function to handle drawing the sprite.
   *
   * @sectionName Custom Properties
   * @example
   * // exclude-code:start
   * let { Sprite } = kontra;
   * // exclude-code:end
   * // exclude-script:start
   * import { Sprite } from 'kontra';
   * // exclude-script:end
   *
   * let sprite = Sprite({
   *   x: 300,
   *   y: 100,
   *
   *   color: 'red',
   *
   *   // custom properties
   *   radius: 20,
   *
   *   render: function() {
   *     this.context.fillStyle = this.color;
   *
   *     this.context.beginPath();
   *     this.context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
   *     this.context.fill();
   *   }
   * });
   * // exclude-code:start
   * sprite.context = context;
   * // exclude-code:end
   *
   * sprite.render();
   */

  /**
   * If you want to extend a Sprite, you can do so by extending the Sprite class. The one caveat is that `Sprite` is not the Sprite class, but actually is a factory function.
   *
   * To extend the Sprite class, use the `.class` property of the constructor.
   *
   * ```js
   * import { Sprite } from kontra;
   *
   * class CustomSprite extends Sprite.class {
   *   // ...
   * }
   * ```
   * @sectionName Extending a Sprite
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
    let { x, y, dx, dy, ddx, ddy, width, height, image } = properties;

    /**
     * The sprites position vector.
     * @memberof Sprite
     * @property {kontra.Vector} position
     */
    this.position = Vector(x, y);

    /**
     * The sprites velocity vector.
     * @memberof Sprite
     * @property {kontra.Vector} velocity
     */
    this.velocity = Vector(dx, dy);

    /**
     * The sprites acceleration vector.
     * @memberof Sprite
     * @property {kontra.Vector} acceleration
     */
    this.acceleration = Vector(ddx, ddy);

    // defaults

    /**
     * The width of the sprite. If the sprite is a [rectangle sprite](#rectangle-sprite), it uses the passed in value. For an [image sprite](#image-sprite) it is the width of the image. And for an [animation sprite](#animation-sprite) it is the width of a single frame of the animation.
     * @memberof Sprite
     * @property {Number} width
     */

    /**
     * The height of the sprite. If the sprite is a [rectangle sprite](#rectangle-sprite), it uses the passed in value. For an [image sprite](#image-sprite) it is the height of the image. And for an [animation sprite](#animation-sprite) it is the height of a single frame of the animation.
     * @memberof Sprite
     * @property {Number} height
     */

    /**
     * The rotation of the sprite around the origin in radians.
     * @memberof Sprite
     * @property {Number} rotation
     */
    this.width = this.height = this.rotation = 0;

    /**
     * How may frames the sprite should be alive. Primarily used by kontra.Pool to know when to recycle an object.
     * @memberof Sprite
     * @property {Number} ttl
     */
    this.ttl = Infinity;

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

     /**
     * The image the sprite will use when drawn if passed as an argument.
     * @memberof Sprite
     * @property {Image|HTMLCanvasElement} image
     */

    // add all properties to the sprite, overriding any defaults
    for (let prop in properties) {
      this[prop] = properties[prop];
    }

    // image sprite
    if (image) {
      this.width = (width !== undefined) ? width : image.width;
      this.height = (height !== undefined) ? height : image.height;
    }
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

  /**
   * An object of [Animations](animation) from a kontra.SpriteSheet to animate the sprite. Each animation is named so that it can can be used by name for the sprites [playAnimation()](#playAnimation) function.
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

  set x(value) {
    this.position.x = value;
  }
  set y(value) {
    this.position.y = value;
  }
  set dx(value) {
    this.velocity.x = value;
  }
  set dy(value) {
    this.velocity.y = value;
  }
  set ddx(value) {
    this.acceleration.x = value;
  }
  set ddy(value) {
    this.acceleration.y = value;
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
   * Check if the sprite is alive. Primarily used by kontra.Pool to know when to recycle an object.
   * @memberof Sprite
   * @function isAlive
   *
   * @returns {Boolean} `true` if the sprites [ttl](#ttl) property is above `0`, `false` otherwise.
   */
  isAlive() {
    return this.ttl > 0;
  }

  /**
   * Check if the sprite collide with the object. Uses a simple [Axis-Aligned Bounding Box (AABB) collision check](https://developer.mozilla.org/en-US/docs/Games/Techniques/2D_collision_detection#Axis-Aligned_Bounding_Box). Takes into account the sprites [anchor](#anchor).
   *
   * **NOTE:** Does not take into account sprite rotation. If you need collision detection between rotated sprites you will need to implement your own `collidesWith()` function. I suggest looking at the Separate Axis Theorem.
   *
   * ```js
   * import { Sprite } from 'kontra';
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
   * sprite.collidesWith(sprite2);  //=> false
   *
   * sprite2.x = 115;
   *
   * sprite.collidesWith(sprite2);  //=> true
   * ```
   *
   * If you need a different type of collision check, you can override this function by passing an argument by the same name.
   *
   * ```js
   * // circle collision
   * function collidesWith(object) {
   *   let dx = this.x - object.x;
   *   let dy = this.y - object.y;
   *   let distance = Math.sqrt(dx * dx + dy * dy);
   *
   *   return distance < this.radius + object.radius;
   * }
   *
   * let sprite = Sprite({
   *   x: 100,
   *   y: 200,
   *   radius: 25,
   *   collidesWith: collidesWith
   * });
   *
   * let sprite2 = Sprite({
   *   x: 150,
   *   y: 200,
   *   radius: 30,
   *   collidesWith: collidesWith
   * });
   *
   * sprite.collidesWith(sprite2);  //=> true
   * ```
   * @memberof Sprite
   * @function collidesWith
   *
   * @param {Object} object - Object to check collision against.
   *
   * @returns {Boolean|null} `true` if the objects collide, `false` otherwise. Will return `null` if the either of the two objects are rotated.
   */
  collidesWith(object) {
    if (this.rotation || object.rotation) return null;

    // take into account sprite anchors
    let x = this.x - this.width * this.anchor.x;
    let y = this.y - this.height * this.anchor.y;

    let objX = object.x;
    let objY = object.y;
    if (object.anchor) {
      objX -= object.width * object.anchor.x;
      objY -= object.height * object.anchor.y;
    }

    return x < objX + object.width &&
           x + this.width > objX &&
           y < objY + object.height &&
           y + this.height > objY;
  }

  /**
   * Update the sprites position based on its velocity and acceleration. Calls the sprites [advance()](#advance) function.
   * @memberof Sprite
   * @function update
   *
   * @param {Number} [dt] - Time since last update.
   */
  update(dt) {
    this.advance(dt);
  }

  /**
   * Render the sprite. Calls the sprites [draw()](#draw) function.
   * @memberof Sprite
   * @function render
   */
  render() {
    this.draw();
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

  /**
   * Move the sprite by its acceleration and velocity. If the sprite is an [animation sprite](#animation-sprite), it also advances the animation every frame.
   *
   * If you override the sprites [update()](#update) function with your own update function, you can call this function to move the sprite normally.
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
   *         this.x - this.width > this.context.canvas.width) {
   *       this.dx = -this.dx;
   *     }
   *     if (this.y < 0 ||
   *         this.y - this.height > this.context.canvas.height) {
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
    this.velocity = this.velocity.add(this.acceleration, dt);
    this.position = this.position.add(this.velocity, dt);

    this.ttl--;

    if (this.currentAnimation) {
      this.currentAnimation.update(dt);
    }
  }

  /**
   * Draw the sprite at its X and Y position. This function changes based on the type of the sprite. For a [rectangle sprite](#rectangle-sprite), it uses `context.fillRect()`, for an [image sprite](#image-sprite) it uses `context.drawImage()`, and for an [animation sprite](#animation-sprite) it uses the [currentAnimation](#currentAnimation) `render()` function.
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
    let anchorWidth = -this.width * this.anchor.x;
    let anchorHeight = -this.height * this.anchor.y;

    this.context.save();
    this.context.translate(this.x, this.y);

    if (this.rotation) {
      this.context.rotate(this.rotation);
    }

    if (this.image) {
      this.context.drawImage(
        this.image,
        0, 0, this.image.width, this.image.height,
        anchorWidth, anchorHeight, this.width, this.height
      );
    }
    else if (this.currentAnimation) {
      this.currentAnimation.render({
        x: anchorWidth,
        y: anchorHeight,
        width: this.width,
        height: this.height,
        context: this.context
      });
    }
    else {
      this.context.fillStyle = this.color;
      this.context.fillRect(anchorWidth, anchorHeight, this.width, this.height);
    }

    this.context.restore();
  }
};

export default function spriteFactory(properties) {
  return new Sprite(properties);
}
spriteFactory.prototype = Sprite.prototype;
spriteFactory.class = Sprite;