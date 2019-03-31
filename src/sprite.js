import { getContext } from './core.js'
import Vector from './vector.js'

class Sprite {

  constructor(properties) {
    this.init(properties);
  }

  /**
   * Initialize properties on the sprite.
   *
   * @param {object} properties - Properties of the sprite.
   * @param {number} properties.x - X coordinate of the sprite.
   * @param {number} properties.y - Y coordinate of the sprite.
   * @param {number} [properties.dx] - Change in X position.
   * @param {number} [properties.dy] - Change in Y position.
   * @param {number} [properties.ddx] - Change in X velocity.
   * @param {number} [properties.ddy] - Change in Y velocity.
   *
   * @param {number} [properties.ttl=Infinity] - How may frames the sprite should be alive.
   * @param {number} [properties.rotation=0] - Rotation in radians of the sprite.
   * @param {number} [properties.anchor={x:0,y:0}] - The x and y origin of the sprite. {0,0} is the top left corner of the sprite, {1,1} is the bottom right corner.
   * @param {Context} [properties.context=context] - Provide a context for the sprite to draw on.
   *
   * @param {Image|Canvas} [properties.image] - Image for the sprite.
   *
   * @param {object} [properties.animations] - Animations for the sprite instead of an image.
   *
   * @param {string} [properties.color] - If no image or animation is provided, use color to draw a rectangle for the sprite.
   * @param {number} [properties.width] - Width of the sprite for drawing a rectangle.
   * @param {number} [properties.height] - Height of the sprite for drawing a rectangle.
   *
   * @param {function} [properties.update] - Function to use to update the sprite.
   * @param {function} [properties.render] - Function to use to render the sprite.
   *
   * If you need the sprite to live forever, or just need it to stay on screen until you
   * decide when to kill it, you can set <code>ttl</code> to <code>Infinity</code>.
   * Just be sure to set <code>ttl</code> to 0 when you want the sprite to die.
   */
  init(properties = {}) {
    let { x, y, dx, dy, ddx, ddy, width, height, image } = properties;
    this.position = Vector(x, y);
    this.velocity = Vector(dx, dy);
    this.acceleration = Vector(ddx, ddy);

    // defaults
    this.width = this.height = this.rotation = 0;
    this.ttl = Infinity;
    this.anchor = {x: 0, y: 0};
    this.context = getContext();

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
   * Sprite position.x
   *
   * @property {number} x
   */
  get x() {
    return this.position.x;
  }

  /**
   * Sprite position.y
   *
   * @property {number} y
   */
  get y() {
    return this.position.y;
  }

  /**
   * Sprite velocity.x
   *
   * @property {number} dx
   */
  get dx() {
    return this.velocity.x;
  }

  /**
   * Sprite velocity.y
   *
   * @property {number} dy
   */
  get dy() {
    return this.velocity.y;
  }

  /**
   * Sprite acceleration.x
   *
   * @property {number} ddx
   */
  get ddx() {
    return this.acceleration.x;
  }

  /**
   * Sprite acceleration.y
   *
   * @property {number} ddy
   */
  get ddy() {
    return this.acceleration.y;
  }

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

    this.currentAnimation = firstAnimation;
    this.width = this.width || firstAnimation.width;
    this.height = this.height || firstAnimation.height;
  }

  /**
   * Determine if the sprite is alive.
   *
   * @returns {boolean}
   */
  isAlive() {
    return this.ttl > 0;
  }

  /**
   * Simple bounding box collision test.
   * NOTE: Does not take into account sprite rotation. If you need collision
   * detection between rotated sprites you will need to implement your own
   * CollidesWith() function. I suggest looking at the Separate Axis Theorem.
   *
   * @param {object} object - Object to check collision against.
   *
   * @returns {boolean|null} True if the objects collide, false otherwise.
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
   * Update the sprites velocity and position.
   * @abstract
   *
   * @param {number} dt - Time since last update.
   *
   * This function can be overridden on a per sprite basis if more functionality
   * is needed in the update step. Just call <code>this.advance()</code> when you need
   * the sprite to update its position.
   *
   * @example
   * sprite = sprite({
   *   update: function update(dt) {
   *     // do some logic
   *
   *     this.advance(dt);
   *   }
   * });
   */
  update(dt) {
    this.advance(dt);
  }

  /**
   * Render the sprite..
   * @abstract
   *
   * This function can be overridden on a per sprite basis if more functionality
   * is needed in the render step. Just call <code>this.draw()</code> when you need the
   * sprite to draw its image.
   *
   * @example
   * sprite = sprite({
   *   render: function render() {
   *     // do some logic
   *
   *     this.draw();
   *   }
   * });
   */
  render() {
    this.draw();
  }

  /**
   * Play an animation.
   *
   * @param {string} name - Name of the animation to play.
   */
  playAnimation(name) {
    this.currentAnimation = this.animations[name];

    if (!this.currentAnimation.loop) {
      this.currentAnimation.reset();
    }
  }

  /**
   * Advance the sprites position, velocity, and current animation (if it
   * has one).
   *
   * @param {number} dt - Time since last update.
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
   * Draw the sprite to the canvas.
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