import { getContext } from './core.js'

class Animation {
  /**
   * Initialize properties on the animation.
   * @memberof kontra.animation
   * @private
   *
   * @param {object} properties - Properties of the animation.
   * @param {object} properties.spriteSheet - Sprite sheet for the animation.
   * @param {number[]} properties.frames - List of frames of the animation.
   * @param {number}  properties.frameRate - Number of frames to display in one second.
   * @param {boolean} [properties.loop=true] - If the animation should loop.
   */
  // @see https://github.com/jed/140bytes/wiki/Byte-saving-techniques#use-placeholder-arguments-instead-of-var
  constructor(properties, frame) {
    properties = properties || {};

    this.spriteSheet = properties.spriteSheet;
    this.frames = properties.frames;
    this.frameRate = properties.frameRate;
    this.loop = (properties.loop === undefined ? true : properties.loop);

    frame = properties.spriteSheet.frame;
    this.width = frame.width;
    this.height = frame.height;
    this.margin = frame.margin || 0;

    // f = frame, a = accumulator
    this._f = 0;
    this._a = 0;
  }

  /**
   * Clone an animation to be used more than once.
   * @memberof kontra.animation
   *
   * @returns {object}
   */
  clone() {
    return AnimationFactory(this);
  }

  /**
   * Reset an animation to the first frame.
   * @memberof kontra.animation
   */
  reset() {
    this._f = 0;
    this._a = 0;
  }

  /**
   * Update the animation. Used when the animation is not paused or stopped.
   * @memberof kontra.animation
   * @private
   *
   * @param {number} [dt=1/60] - Time since last update.
   */
  update(dt) {

    // if the animation doesn't loop we stop at the last frame
    if (!this.loop && this._f == this.frames.length-1) return;

    dt = dt || 1 / 60;

    this._a += dt;

    // update to the next frame if it's time
    while (this._a * this.frameRate >= 1) {
      this._f = ++this._f % this.frames.length;
      this._a -= 1 / this.frameRate;
    }
  }

  /**
   * Draw the current frame. Used when the animation is not stopped.
   * @memberof kontra.animation
   * @private
   *
   * @param {object} properties - How to draw the animation.
   * @param {number} properties.x - X position to draw.
   * @param {number} properties.y - Y position to draw.
   * @param {number} properties.width - width of the sprite.
   * @param {number} properties.height - height of the sprit.
   * @param {Context} [properties.context=kontra.context] - Provide a context for the sprite to draw on.
   */
  render(properties) {
    properties = properties || {};

    // get the row and col of the frame
    let row = this.frames[this._f] / this.spriteSheet._f | 0;
    let col = this.frames[this._f] % this.spriteSheet._f | 0;
    let width = (properties.width !== undefined) ? properties.width : this.width
    let height = (properties.height !== undefined) ? properties.height : this.height
    let context = (properties.context || getContext())
    context.drawImage(
      this.spriteSheet.image,
      col * this.width + (col * 2 + 1) * this.margin,
      row * this.height + (row * 2 + 1) * this.margin,
      this.width, this.height,
      properties.x, properties.y,
      width, height
    );
  }
}

function animation(properties) {
  return new Animation(properties);
}
animation.prototype = Animation.prototype;

export default animation