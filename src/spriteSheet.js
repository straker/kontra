(function(kontra) {
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
    var animation = Object.create(kontra.animation.prototype);
    animation._init(properties);

    return animation;
  };

  kontra.animation.prototype = {
    /**
     * Initialize properties on the animation.
     * @memberof kontra.animation
     * @private
     *
     * @param {object} properties - Properties of the animation.
     * @param {object} properties.spriteSheet - Sprite sheet for the animation.
     * @param {number[]} properties.frames - List of frames of the animation.
     * @param {number}  properties.frameRate - Number of frames to display in one second.
     */
    _init: function init(properties) {
      properties = properties || {};

      this.spriteSheet = properties.spriteSheet;
      this.frames = properties.frames;
      this.frameRate = properties.frameRate;

      var frame = properties.spriteSheet.frame;
      this.width = frame.width;
      this.height = frame.height;
      this.margin = frame.margin || 0;

      this._frame = 0;
      this._accum = 0;
    },

    /**
     * Clone an animation to be used more than once.
     * @memberof kontra.animation
     *
     * @returns {object}
     */
    clone: function clone() {
      return kontra.animation(this);
    },

    /**
     * Update the animation. Used when the animation is not paused or stopped.
     * @memberof kontra.animation
     * @private
     *
     * @param {number} [dt=1/60] - Time since last update.
     */
    update: function advance(dt) {
      dt = dt || 1 / 60;

      this._accum += dt;

      // update to the next frame if it's time
      while (this._accum * this.frameRate >= 1) {
        this._frame = ++this._frame % this.frames.length;

        this._accum -= 1 / this.frameRate;
      }
    },

    /**
     * Draw the current frame. Used when the animation is not stopped.
     * @memberof kontra.animation
     * @private
     *
     * @param {object} properties - How to draw the animation.
     * @param {number} properties.x - X position to draw.
     * @param {number} properties.y - Y position to draw.
     * @param {Context} [properties.context=kontra.context] - Provide a context for the sprite to draw on.
     */
    render: function draw(properties) {
      properties = properties || {};

      var context = properties.context || kontra.context;

      // get the row and col of the frame
      var row = this.frames[this._frame] / this.spriteSheet.framesPerRow | 0;
      var col = this.frames[this._frame] % this.spriteSheet.framesPerRow | 0;

      context.drawImage(
        this.spriteSheet.image,
        col * this.width + (col * 2 + 1) * this.margin,
        row * this.height + (row * 2 + 1) * this.margin,
        this.width, this.height,
        properties.x, properties.y,
        this.width, this.height
      );
    }
  };






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
    var spriteSheet = Object.create(kontra.spriteSheet.prototype);
    spriteSheet._init(properties);

    return spriteSheet;
  };

  kontra.spriteSheet.prototype = {
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
    _init: function init(properties) {
      properties = properties || {};

      if (!kontra._isImage(properties.image)) {
        throw Erorr('You must provide an Image for the SpriteSheet');
      }

      this.animations = {};
      this.image = properties.image;
      this.frame = {
        width: properties.frameWidth,
        height: properties.frameHeight,
        margin: properties.frameMargin
      };

      this.framesPerRow = properties.image.width / properties.frameWidth | 0;

      this.createAnimations(properties.animations);
    },

    /**
     * Create animations from the sprite sheet.
     * @memberof kontra.spriteSheet
     *
     * @param {object} animations - List of named animations to create from the Image.
     * @param {number|string|number[]|string[]} animations.animationName.frames - A single frame or list of frames for this animation.
     * @param {number} animations.animationName.frameRate - Number of frames to display in one second.
     *
     * @example
     * var sheet = kontra.spriteSheet({image: img, frameWidth: 16, frameHeight: 16});
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
     *     frameRate: 3
     *   },
     *   attack: {
     *     frames: ['8..10', 13, '10..8'],  // you can also mix and match, in this case frames [8,9,10,13,10,9,8]
     *     frameRate: 2
     *   }
     * });
     */
    createAnimations: function createAnimations(animations) {
      var animation, frames, frameRate, sequence;

      for (var name in animations) {
        animation = animations[name];
        frames = animation.frames;
        frameRate = animation.frameRate;

        // array that holds the order of the animation
        sequence = [];

        if (frames === undefined) {
          throw Error('Animation ' + name + ' must provide a frames property');
        }

        if (!Array.isArray(frames)) {
          frames = [frames];
        }

        for (var i = 0, frame; frame = frames[i]; i++) {
          // add new frames to the end of the array
          sequence.push.apply(sequence, this._parse(frame));
        }

        this.animations[name] = kontra.animation({
          spriteSheet: this,
          frames: sequence,
          frameRate: frameRate
        });
      }
    },

    /**
     * Parse a string of consecutive frames.
     * @memberof kontra.spriteSheet
     * @private
     *
     * @param {string} frames - Start and end frame.
     *
     * @returns {number[]} List of frames.
     */
    _parse: function parse(consecutiveFrames) {
      if (kontra._isNumber(consecutiveFrames)) {
        return [consecutiveFrames];
      }

      var sequence = [];
      var frames = consecutiveFrames.split('..');

      // coerce string to number
      // @see https://github.com/jed/140bytes/wiki/Byte-saving-techniques#coercion-to-test-for-types
      var start = i = +frames[0];
      var end = +frames[1];

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
  };
})(kontra);