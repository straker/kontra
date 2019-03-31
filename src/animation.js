import { getContext } from './core.js'

class Animation {
  /**
   * Initialize properties on the animation.
   *
   * @param {object} properties - Properties of the animation.
   * @param {object} properties.spriteSheet - Sprite sheet for the animation.
   * @param {number[]} properties.frames - List of frames of the animation.
   * @param {number}  properties.frameRate - Number of frames to display in one second.
   * @param {boolean} [properties.loop=true] - If the animation should loop.
   */
  constructor({spriteSheet, frames, frameRate, loop = true} = {}) {
    this.spriteSheet = spriteSheet;
    this.frames = frames;
    this.frameRate = frameRate;
    this.loop = loop;

    let { width, height, margin = 0 } = spriteSheet.frame;
    this.width = width;
    this.height = height;
    this.margin = margin;

    // f = frame, a = accumulator
    this._f = 0;
    this._a = 0;
  }

  /**
   * Clone an animation to be used more than once.
   *
   * @returns {object}
   */
  clone() {
    return animationFactory(this);
  }

  /**
   * Reset an animation to the first frame.
   */
  reset() {
    this._f = 0;
    this._a = 0;
  }

  /**
   * Update the animation. Used when the animation is not paused or stopped.
   *
   * @param {number} [dt=1/60] - Time since last update.
   */
  update(dt = 1/60) {

    // if the animation doesn't loop we stop at the last frame
    if (!this.loop && this._f == this.frames.length-1) return;

    this._a += dt;

    // update to the next frame if it's time
    while (this._a * this.frameRate >= 1) {
      this._f = ++this._f % this.frames.length;
      this._a -= 1 / this.frameRate;
    }
  }

  /**
   * Draw the current frame. Used when the animation is not stopped.
   *
   * @param {object} properties - How to draw the animation.
   * @param {number} properties.x - X position to draw.
   * @param {number} properties.y - Y position to draw.
   * @param {number} properties.width - width of the sprite.
   * @param {number} properties.height - height of the sprit.
   * @param {Context} [properties.context=kontra.context] - Provide a context for the sprite to draw on.
   */
  render({x, y, width = this.width, height = this.height, context = getContext()} = {}) {

    // get the row and col of the frame
    let row = this.frames[this._f] / this.spriteSheet._f | 0;
    let col = this.frames[this._f] % this.spriteSheet._f | 0;

    context.drawImage(
      this.spriteSheet.image,
      col * this.width + (col * 2 + 1) * this.margin,
      row * this.height + (row * 2 + 1) * this.margin,
      this.width, this.height,
      x, y,
      width, height
    );
  }
}

export default function animationFactory(properties) {
  return new Animation(properties);
}
animationFactory.prototype = Animation.prototype;