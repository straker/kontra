(function() {

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
      return kontra.animation(this);
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

      let context = (properties.context || kontra.context)
      context.drawImage(
        this.spriteSheet.image,
        col * this.spriteSheet.frame.width + (col * 2 + 1) * this.margin,
        row * this.spriteSheet.frame.height + (row * 2 + 1) * this.margin,
        this.spriteSheet.frame.width, this.spriteSheet.frame.height,
        properties.x, properties.y,
        properties.width, properties.height
      );
    }
  }

  /**
   * Single animation from a sprite sheet.
   * @memberof kontra
   *
   * @param {object} properties - Properties of the animation.
   * @param {object} properties.spriteSheet - Sprite sheet for the animation.
   * @param {number[]} properties.frames - List of frames of the animation.
   * @param {number}  properties.frameRate - Number of frames to display in one second.
   */
  kontra.animation = function(properties) {
    return new Animation(properties);
  };
  kontra.animation.prototype = Animation.prototype;





  class SpriteSheet {
    /**
     * Initialize properties on the spriteSheet.
     * @memberof kontra
     * @private
     *
     * @param {object} properties - Properties of the sprite sheet.
     * @param {Image|Canvas} properties.image - Image for the sprite sheet.
     * @param {number} properties.frameWidth - Width (in px) of each frame.
     * @param {number} properties.frameHeight - Height (in px) of each frame.
     * @param {number} properties.frameMargin - Margin (in px) between each frame.
     * @param {object} properties.animations - Animations to create from the sprite sheet.
     */
    constructor(properties) {
      properties = properties || {};

      // @if DEBUG
      if (!properties.image) {
        throw Error('You must provide an Image for the SpriteSheet');
      }
      // @endif

      this.animations = {};
      this.image = properties.image;
      this.frame = {
        width: properties.frameWidth,
        height: properties.frameHeight,
        margin: properties.frameMargin
      };

      // f = framesPerRow
      this._f = properties.image.width / properties.frameWidth | 0;

      this.createAnimations(properties.animations);
    }

    /**
     * Create animations from the sprite sheet.
     * @memberof kontra.spriteSheet
     *
     * @param {object} animations - List of named animations to create from the Image.
     * @param {number|string|number[]|string[]} animations.animationName.frames - A single frame or list of frames for this animation.
     * @param {number} animations.animationName.frameRate - Number of frames to display in one second.
     *
     * @example
     * let sheet = kontra.spriteSheet({image: img, frameWidth: 16, frameHeight: 16});
     * sheet.createAnimations({
     *   idle: {
     *     frames: 1  // single frame animation
     *   },
     *   walk: {
     *     frames: '2..6',  // ascending consecutive frame animation (frames 2-6, inclusive)
     *     frameRate: 4
     *   },
     *   moonWalk: {
     *     frames: '6..2',  // descending consecutive frame animation
     *     frameRate: 4
     *   },
     *   jump: {
     *     frames: [7, 12, 2],  // non-consecutive frame animation
     *     frameRate: 3,
     *     loop: false
     *   },
     *   attack: {
     *     frames: ['8..10', 13, '10..8'],  // you can also mix and match, in this case frames [8,9,10,13,10,9,8]
     *     frameRate: 2,
     *     loop: false
     *   }
     * });
     */
    createAnimations(animations) {
      let animation, frames, frameRate, sequence, name;

      for (name in animations) {
        animation = animations[name];
        frames = animation.frames;

        // array that holds the order of the animation
        sequence = [];

        // @if DEBUG
        if (frames === undefined) {
          throw Error('Animation ' + name + ' must provide a frames property');
        }
        // @endif

        // add new frames to the end of the array
        [].concat(frames).map(function(frame) {
          sequence = sequence.concat(this._p(frame));
        }, this);

        this.animations[name] = kontra.animation({
          spriteSheet: this,
          frames: sequence,
          frameRate: animation.frameRate,
          loop: animation.loop
        });
      }
    }

    /**
     * Parse a string of consecutive frames.
     * @memberof kontra.spriteSheet
     * @private
     *
     * @param {number|string} frames - Start and end frame.
     *
     * @returns {number[]} List of frames.
     */
    _p(consecutiveFrames, i) {
      // @see https://github.com/jed/140bytes/wiki/Byte-saving-techniques#coercion-to-test-for-types
      if (+consecutiveFrames === consecutiveFrames) {
        return consecutiveFrames;
      }

      let sequence = [];
      let frames = consecutiveFrames.split('..');

      // coerce string to number
      // @see https://github.com/jed/140bytes/wiki/Byte-saving-techniques#coercion-to-test-for-types
      let start = i = +frames[0];
      let end = +frames[1];

      // ascending frame order
      if (start < end) {
        for (; i <= end; i++) {
          sequence.push(i);
        }
      }
      // descending order
      else {
        for (; i >= end; i--) {
          sequence.push(i);
        }
      }

      return sequence;
    }
  }

  /**
   * Create a sprite sheet from an image.
   * @memberof kontra
   *
   * @param {object} properties - Properties of the sprite sheet.
   * @param {Image|Canvas} properties.image - Image for the sprite sheet.
   * @param {number} properties.frameWidth - Width (in px) of each frame.
   * @param {number} properties.frameHeight - Height (in px) of each frame.
   * @param {number} properties.frameMargin - Margin (in px) between each frame.
   * @param {object} properties.animations - Animations to create from the sprite sheet.
   */
  kontra.spriteSheet = function(properties) {
    return new SpriteSheet(properties);
  };
  kontra.spriteSheet.prototype = SpriteSheet.prototype;
})();