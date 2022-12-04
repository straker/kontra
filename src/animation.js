import { getContext } from './core.js';

/**
 * An object for drawing sprite sheet animations.
 *
 * An animation defines the sequence of frames to use from a sprite sheet. It also defines at what speed the animation should run using `frameRate`.
 *
 * Typically you don't create an Animation directly, but rather you would create them from a [SpriteSheet](api/spriteSheet) by passing the `animations` argument.
 *
 * ```js
 * import { SpriteSheet, Animation } from 'kontra';
 *
 * let image = new Image();
 * image.src = 'assets/imgs/character_walk_sheet.png';
 * image.onload = function() {
 *   let spriteSheet = SpriteSheet({
 *     image: image,
 *     frameWidth: 72,
 *     frameHeight: 97
 *   });
 *
 *   // you typically wouldn't create an Animation this way
 *   let animation = Animation({
 *     spriteSheet: spriteSheet,
 *     frames: [1,2,3,6],
 *     frameRate: 30
 *   });
 * };
 * ```
 * @class Animation
 *
 * @param {Object} properties - Properties of the animation.
 * @param {SpriteSheet} properties.spriteSheet - Sprite sheet for the animation.
 * @param {Number[]} properties.frames - List of frames of the animation.
 * @param {Number}  properties.frameRate - Number of frames to display in one second.
 * @param {Boolean} [properties.loop=true] - If the animation should loop.
 * @param {String} [properties.name] - The name of the animation.
 */
class Animation {
  constructor({ spriteSheet, frames, frameRate, loop = true, name }) {
    let { width, height, margin = 0 } = spriteSheet.frame;

    Object.assign(this, {
      /**
       * The sprite sheet to use for the animation.
       * @memberof Animation
       * @property {SpriteSheet} spriteSheet
       */
      spriteSheet,

      /**
       * Sequence of frames to use from the sprite sheet.
       * @memberof Animation
       * @property {Number[]} frames
       */
      frames,

      /**
       * Number of frames to display per second. Adjusting this value will change the speed of the animation.
       * @memberof Animation
       * @property {Number} frameRate
       */
      frameRate,

      /**
       * If the animation should loop back to the beginning once completed.
       * @memberof Animation
       * @property {Boolean} loop
       */
      loop,

      /**
       * The name of the animation.
       * @memberof Animation
       * @property {String} name
       */
      name,

      /**
       * The width of an individual frame. Taken from the [frame width value](api/spriteSheet#frame) of the sprite sheet.
       * @memberof Animation
       * @property {Number} width
       */
      width,

      /**
       * The height of an individual frame. Taken from the [frame height value](api/spriteSheet#frame) of the sprite sheet.
       * @memberof Animation
       * @property {Number} height
       */
      height,

      /**
       * The space between each frame. Taken from the [frame margin value](api/spriteSheet#frame) of the sprite sheet.
       * @memberof Animation
       * @property {Number} margin
       */
      margin,

      /**
       * If the animation is currently stopped. Stopped animations will not update when the [update()](api/animation#update) function is called.
       *
       * Animations are not considered stopped until either the [stop()](api/animation#stop) function is called or the animation gets to the last frame and does not loop.
       *
       * ```js
       * import { Animation } from 'kontra';
       *
       * let animation = Animation({
       *   // ...
       * });
       * console.log(animation.isStopped);  //=> false
       *
       * animation.start();
       * console.log(animation.isStopped);  //=> false
       *
       * animation.stop();
       * console.log(animation.isStopped);  //=> true
       * ```
       * @memberof Animation
       * @property {Boolean} isStopped
       */
      isStopped: false,

      // f = frame, a = accumulator
      _f: 0,
      _a: 0
    });
  }

  /**
   * Clone an animation so it can be used more than once. By default animations passed to [Sprite](api/sprite) will be cloned so no two sprites update the same animation. Otherwise two sprites who shared the same animation would make it update twice as fast.
   * @memberof Animation
   * @function clone
   *
   * @returns {Animation} A new Animation instance.
   */
  clone() {
    return new Animation(this);
  }

  /**
   * Start the animation.
   * @memberof Animation
   * @function start
   */
  start() {
    this.isStopped = false;

    if (!this.loop) {
      this.reset();
    }
  }

  /**
   * Stop the animation.
   * @memberof Animation
   * @function stop
   */
  stop() {
    this.isStopped = true;
  }

  /**
   * Reset an animation to the first frame.
   * @memberof Animation
   * @function reset
   */
  reset() {
    this._f = 0;
    this._a = 0;
  }

  /**
   * Update the animation.
   * @memberof Animation
   * @function update
   *
   * @param {Number} [dt=1/60] - Time since last update.
   */
  update(dt = 1 / 60) {
    if (this.isStopped) {
      return;
    }

    // if the animation doesn't loop we stop at the last frame
    if (!this.loop && this._f == this.frames.length - 1) {
      this.stop();
      return;
    }

    this._a += dt;

    // update to the next frame if it's time
    while (this._a * this.frameRate >= 1) {
      this._f = ++this._f % this.frames.length;
      this._a -= 1 / this.frameRate;
    }
  }

  /**
   * Draw the current frame of the animation.
   * @memberof Animation
   * @function render
   *
   * @param {Object} properties - Properties to draw the animation.
   * @param {Number} properties.x - X position to draw the animation.
   * @param {Number} properties.y - Y position to draw the animation.
   * @param {Number} [properties.width] - width of the sprite. Defaults to [Animation.width](api/animation#width).
   * @param {Number} [properties.height] - height of the sprite. Defaults to [Animation.height](api/animation#height).
   * @param {CanvasRenderingContext2D} [properties.context] - The context the animation should draw to. Defaults to [core.getContext()](api/core#getContext).
   */
  render({
    x,
    y,
    width = this.width,
    height = this.height,
    context = getContext()
  }) {
    // get the row and col of the frame
    let row = (this.frames[this._f] / this.spriteSheet._f) | 0;
    let col = this.frames[this._f] % this.spriteSheet._f | 0;

    context.drawImage(
      this.spriteSheet.image,
      col * this.width + (col * 2 + 1) * this.margin,
      row * this.height + (row * 2 + 1) * this.margin,
      this.width,
      this.height,
      x,
      y,
      width,
      height
    );
  }
}

export default function factory() {
  return new Animation(...arguments);
}
export { Animation as AnimationClass };
