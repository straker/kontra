var kontra = (function(kontra, undefined) {
  'use strict';

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

      this.width = properties.spriteSheet.frame.width;
      this.height = properties.spriteSheet.frame.height;

      this.currentFrame = 0;
      this._accumulator = 0;

      // set update and render so we can noop them later to stop the animation
      this.update = this._advance;
      this.render = this._draw;
    },

    /**
     * Play the animation.
     * @memberof kontra.animation
     */
    play: function play() {
      // restore references to update and render functions only if overridden
      this.update = this._advance;
      this.render = this._draw;
    },

    /**
     * Stop the animation and prevent update and render.
     * @memberof kontra.animation
     */
    stop: function stop() {

      // instead of putting an if statement in both render/update functions that checks
      // a variable to determine whether to render or update, we can just reassign the
      // functions to noop and save processing time in the game loop.
      // @see http://jsperf.com/boolean-check-vs-noop
      this.update = kontra._noop;
      this.render = kontra._noop;
    },

    /**
     * Pause the animation and prevent update.
     * @memberof kontra.animation
     */
    pause: function pause() {
      this.update = kontra._noop;
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
    _advance: function advance(dt) {
      dt = dt || 1 / 60;

      this._accumulator += dt;

      // update to the next frame if it's time
      while (this._accumulator * this.frameRate >= 1) {
        this.currentFrame = ++this.currentFrame % this.frames.length;

        this._accumulator -= 1 / this.frameRate;
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
    _draw: function draw(properties) {
      properties = properties || {};

      var context = properties.context || kontra.context;

      // get the row and col of the frame
      var row = this.frames[this.currentFrame] / this.spriteSheet.framesPerRow | 0;
      var col = this.frames[this.currentFrame] % this.spriteSheet.framesPerRow | 0;

      context.drawImage(
        this.spriteSheet.image,
        col * this.spriteSheet.frame.width, row * this.spriteSheet.frame.height,
        this.spriteSheet.frame.width, this.spriteSheet.frame.height,
        properties.x, properties.y,
        this.spriteSheet.frame.width, this.spriteSheet.frame.height
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
     * @param {object} properties.animations - Animations to create from the sprite sheet.
     */
    _init: function init(properties) {
      properties = properties || {};

      this.animations = {};

      if (kontra._isImage(properties.image) || kontra._isCanvas(properties.image)) {
        this.image = properties.image;
        this.frame = {
          width: properties.frameWidth,
          height: properties.frameHeight
        };

        this.framesPerRow = properties.image.width / properties.frameWidth | 0;
      }
      else {
        var error = new SyntaxError('Invalid image.');
        kontra._logError(error, 'You must provide an Image for the SpriteSheet.');
        return;
      }

      if (properties.animations) {
        this.createAnimations(properties.animations);
      }
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
      var error;

      if (!animations || Object.keys(animations).length === 0) {
        error = new ReferenceError('No animations found.');
        kontra._logError(error, 'You must provide at least one named animation to create an Animation.');
        return;
      }

      // create each animation by parsing the frames
      var animation, frames, frameRate, sequence;
      for (var name in animations) {
        if (!animations.hasOwnProperty(name)) {
          continue;
        }

        animation = animations[name];
        frames = animation.frames;
        frameRate = animation.frameRate;

        // array that holds the order of the animation
        sequence = [];

        if (frames === undefined) {
          error = new ReferenceError('No animation frames found.');
          kontra._logError(error, 'Animation ' + name + ' must provide a frames property.');
          return;
        }

        // single frame
        if (kontra._isNumber(frames)) {
          sequence.push(frames);
        }
        // consecutive frames
        else if (kontra._isString(frames)) {
          sequence = this._parseFrames(frames);
        }
        // non-consecutive frames
        else if (Array.isArray(frames)) {
          for (var i = 0, frame; frame = frames[i]; i++) {

            // consecutive frames
            if (kontra._isString(frame)) {

              // add new frames to the end of the array
              sequence.push.apply(sequence, this._parseFrames(frame));
            }
            // single frame
            else {
              sequence.push(frame);
            }
          }
        }
        else {
          error = new SyntaxError('Improper frames value');
          kontra._logError(error, 'The frames property must be a number, string, or array.');
          return;
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
    _parseFrames: function parseFrames(frames) {
      var sequence = [];
      var consecutiveFrames = frames.split('..').map(Number);

      // determine which direction to loop
      var direction = (consecutiveFrames[0] < consecutiveFrames[1] ? 1 : -1);
      var i;

      // ascending frame order
      if (direction === 1) {
        for (i = consecutiveFrames[0]; i <= consecutiveFrames[1]; i++) {
          sequence.push(i);
        }
      }
      // descending order
      else {
        for (i = consecutiveFrames[0]; i >= consecutiveFrames[1]; i--) {
          sequence.push(i);
        }
      }

      return sequence;
    }
  };

  return kontra;
})(kontra || {});