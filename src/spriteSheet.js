/*jshint -W084 */

var kontra = (function(kontra, undefined) {
  'use strict';

  /**
   * Single animation from a sprite sheet.
   * @memberof kontra
   *
   * @see kontra.pool._proto.set for list of parameters.
   */
  kontra.animation = function(properties) {
    var animation = Object.create(kontra.animation._proto);
    animation.set(properties);

    return animation;
  };

  kontra.animation._proto = {
    /**
     * Set properties on the animation.
     * @memberof kontra.animation
     *
     * @param {object} properties - Properties of the animation.
     * @param {spriteSheet} properties.spriteSheet - Sprite sheet for the animation.
     * @param {number[]} properties.frames - List of frames of the animation.
     * @param {number}  properties.frameSpeed - Time to wait before transitioning the animation to the next frame.
     */
    set: function set(properties) {
      properties = properties || {};

      this.spriteSheet = properties.spriteSheet;
      this.frames = properties.frames;
      this.frameSpeed = properties.frameSpeed;

      this.width = properties.spriteSheet.frame.width;
      this.height = properties.spriteSheet.frame.height;

      this.currentFrame = 0;
      this._accumulator = 0;
      this.update = this.advance;
      this.render = this.draw;
    },

    /**
     * Update the animation. Used when the animation is not paused or stopped.
     * @memberof kontra.animation
     * @private
     *
     * @param {number} dt=1 - Time since last update.
     */
    advance: function advance(dt) {
      // normalize dt to work with milliseconds as a decimal or an integer
      dt = (dt < 1 ? dt * 1E3 : dt) || 1;

      this._accumulator += dt;

      // update to the next frame if it's time
      while (this._accumulator >= this.frameSpeed) {
        this.currentFrame = ++this.currentFrame % this.frames.length;

        this._accumulator -= this.frameSpeed;
      }
    },

    /**
     * Draw the current frame. Used when the animation is not stopped.
     * @memberof kontra.animation
     * @private
     *
     * @param {object} properties - How to draw the animation.
     * @param {integer} properties.x - X position to draw
     * @param {integer} properties.y - Y position to draw
     * @param {Context} [properties.context=kontra.context] - Provide a context for the sprite to draw on.
     */
    draw: function draw(properties) {
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
    },

    /**
     * Play the animation.
     * @memberof kontra.animation
     */
    play: function play() {
      // restore references to update and render functions only if overridden
      this.update = this.advance;
      this.render = this.draw;
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
      this.update = kontra.noop;
      this.render = kontra.noop;
    },

    /**
     * Pause the animation and prevent update.
     * @memberof kontra.animation
     */
    pause: function pause() {
      this.update = kontra.noop;
    }
  };






  /**
   * Create a sprite sheet from an image.
   * @memberof kontra
   *
   * @see kontra.spriteSheet._proto.set for list of parameters.
   */
  kontra.spriteSheet = function(properties) {
    var spriteSheet = Object.create(kontra.spriteSheet._proto);
    spriteSheet.set(properties);

    return spriteSheet;
  };

  kontra.spriteSheet._proto = {
    /**
     * Set properties on the spriteSheet.
     * @memberof kontra
     * @constructor
     *
     * @param {object} properties - Configure the sprite sheet.
     * @param {Image|Canvas} properties.image - Image for the sprite sheet.
     * @param {number} properties.frameWidth - Width (in px) of each frame.
     * @param {number} properties.frameHeight - Height (in px) of each frame.
     */
    set: function set(properties) {
      properties = properties || {};

      this.animations = {};

      if (kontra.isImage(properties.image) || kontra.isCanvas(properties.image)) {
        this.image = properties.image;
        this.frame = {
          width: properties.frameWidth,
          height: properties.frameHeight
        };

        this.framesPerRow = properties.image.width / properties.frameWidth | 0;
      }
      else {
        var error = new SyntaxError('Invalid image.');
        kontra.logError(error, 'You must provide an Image for the SpriteSheet.');
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
     * @param {number} animations.animationName.frameSpeed=1 - Number of frames to wait before transitioning the animation to the next frame.
     *
     * @example
     * var sheet = kontra.spriteSheet(img, 16, 16);
     * sheet.createAnimations({
     *   idle: {
     *     frames: 1  // single frame animation
     *   },
     *   walk: {
     *     frames: '2..6',  // ascending consecutive frame animation (frames 2-6, inclusive)
     *     frameSpeed: 4
     *   },
     *   moonWalk: {
     *     frames: '6..2',  // descending consecutive frame animation
     *     frameSpeed: 4
     *   },
     *   jump: {
     *     frames: [7, 12, 2],  // non-consecutive frame animation
     *     frameSpeed: 3
     *   },
     *   attack: {
     *     frames: ['8..10', 13, '10..8'],  // you can also mix and match, in this case frames [8,9,10,13,10,9,8]
     *     frameSpeed: 2
     *   }
     * });
     */
    createAnimations: function createAnimations(animations) {
      var error;

      if (!animations || Object.keys(animations).length === 0) {
        error = new ReferenceError('No animations found.');
        kontra.logError(error, 'You must provide at least one named animation to create an Animation.');
        return;
      }

      // create each animation by parsing the frames
      var animation, frames, frameSpeed, sequence;
      for (var name in animations) {
        if (!animations.hasOwnProperty(name)) {
          continue;
        }

        animation = animations[name];
        frames = animation.frames;
        frameSpeed = animation.frameSpeed;

        // array that holds the order of the animation
        sequence = [];

        if (frames === undefined) {
          error = new ReferenceError('No animation frames found.');
          kontra.logError(error, 'Animation ' + name + ' must provide a frames property.');
          return;
        }

        // single frame
        if (kontra.isNumber(frames)) {
          sequence.push(frames);
        }
        // consecutive frames
        else if (kontra.isString(frames)) {
          sequence = this._parseFrames(frames);
        }
        // non-consecutive frames
        else if (kontra.isArray(frames)) {
          for (var i = 0, frame; frame = frames[i]; i++) {

            // consecutive frames
            if (kontra.isString(frame)) {

              // add new frames to the end of the array
              sequence.push.apply(sequence, this._parseFrames(frame));
            }
            // single frame
            else {
              sequence.push(frame);
            }
          }
        }

        this.animations[name] = kontra.animation({
          spriteSheet: this,
          frames: sequence,
          frameSpeed: frameSpeed
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