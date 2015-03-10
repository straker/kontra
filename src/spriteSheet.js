/*jshint -W084 */

var kontra = (function(kontra, window, document) {
  /**
   * Creates a Sprite sheet from an image.
   * @memberOf kontra
   * @constructor
   *
   * @param {object}   options - Configure the sprite sheet.
   * @param {string|Image} options.image - Path to the image or Image object.
   * @param {number} options.frameWidth - Width (in px) of each frame.
   * @param {number} options.frameHeight - Height (in px) of each frame.
   */
  kontra.SpriteSheet = function SpriteSheet(options) {
    options = options || {};

    var _this = this;

    // load an image path
    if (kontra.isString(options.image)) {
      this.image = new Image();
      this.image.onload = calculateFrames;
      this.image.src = options.image;
    }
    // load an image object
    else if (options.image instanceof Image) {
      this.image = options.image;
      calculateFrames();
    }
    else {
      var error = new SyntaxError('Invalid image.');
      kontra.log.error(error, 'You must provide an Image or path to an image as the first parameter.');
      return;
    }

    /**
     * Calculate the number of frames in a row.
     */
    function calculateFrames() {
      _this.frameWidth = options.frameWidth || _this.image.width;
      _this.frameHeight = options.frameHeight || _this.image.height;

      _this.framesPerRow = Math.floor(_this.image.width / _this.frameWidth);
    }
  };

  /**
   * Creates an animation from the sprite sheet.
   * @memberOf kontra.SpriteSheet
   *
   * @param {object} animations - List of named animations to create from the Image.
   * @param {number|string|number[]|string[]} animations.animationName.frames - A single frame or list of frames for this animation.
   * @param {number}  animations.animationName.frameSpeed - Number of frames to wait before transitioning the animation to the next frame.
   * @param {boolean} animations.animationName.repeat - Repeat the animation once completed.
   *
   * @example
   * var animations = {
   *   idle: {
   *     frames: 1  // single frame animation
   *   },
   *   walk: {
   *     frames: '2..6',  // consecutive frame animation (frames 2-6, inclusive)
   *     frameSpeed: 4,
   *     repeat: true
   *   },
   *   moonWalk: {
   *     frames: '6..2',  // descending consecutive frame animations
   *     frameSpeed: 4,
   *     repeat: true
   *   },
   *   jump: {
   *     frames: [7, 12, 2],  // non-consecutive frame animation
   *     frameSpeed: 3
   *   },
   *   attack: {
   *     frames: ['8..10', 13, '10..8'],  // you can also mix and match, in this case frames [8,9,10,13,10,9,8]
   *     frameSpeed: 2
   *   }
   * };
   * sheet.createAnimation(animations);
   */
  kontra.SpriteSheet.prototype.createAnimation = function SpriteSheetCreateAnimation(animations) {
    var error;

    if (!animations || Object.keys(animations).length === 0) {
      error = new SyntaxError('No animations found.');
      kontra.log.error(error, 'You must provide at least one named animation to create an Animation.');
      return;
    }

    this.animations = {};

    // create each animation
    var animation;
    var frames;
    for (var name in animations) {
      animation = animations[name];
      frames = animation.frames;

      // array that holds the order of the animation
      animation.animationSequence = [];

      animation.image = this.image;

      // skip non-own properties
      if (!animations.hasOwnProperty(name)) {
        continue;
      }

      if (frames === undefined) {
        error = new SyntaxError('No animation frames found.');
        kontra.log.error(error, 'Animation ' + name + ' must provide a frames property.');
        return;
      }

      // parse frames

      // single frame
      if (kontra.isNumber(frames)) {
        animation.animationSequence.push(frames);
      }
      // consecutive frames
      else if (kontra.isString(frames)) {
        animation.animationSequence = parseConsecutiveFrames(frames);
      }
      // non-consecutive frames
      else if (kontra.isArray(frames)) {
        for (var i = 0, frame; frame = frames[i]; i++) {

          // consecutive frames
          if (kontra.isString(frame)) {
            var consecutiveFrames = parseConsecutiveFrames(frame);

            // add new frames to the end of the array
            animation.animationSequence.push.apply(animation.animationSequence,consecutiveFrames);
          }
          // single frame
          else {
            animation.animationSequence.push(frame);
          }
        }
      }

      this.animations[name] = new Animation(this, animation);
    }
  };

  /**
   * Get an animation by name.
   * @memberOf kontra.SpriteSheet
   *
   * @param {string} name - Name of the animation.
   *
   * @returns {Animation}
   */
  kontra.SpriteSheet.prototype.getAnimation = function SpriteSheetGetAnimation(name) {
    return this.animations[name];
  };

  // TODO: Do we need an even that fires when the animation is completed?
  // TODO: How do we handle animation chaining (after an attack animation is over, go back to idle animation)?

  /**
   * Parse a string of consecutive frames.
   * @private
   *
   * @param {string} frames - Start and end frame.
   *
   * @returns {number[]} List of frames.
   */
  function parseConsecutiveFrames(frames) {
    var animationSequence = [];
    var consecutiveFrames = frames.split('..');

    // turn each string into a number
    consecutiveFrames[0] = parseInt(consecutiveFrames[0], 10);
    consecutiveFrames[1] = parseInt(consecutiveFrames[1], 10);

    // determine which direction to loop
    var direction = (consecutiveFrames[0] < consecutiveFrames[1] ? 1 : -1);
    var i;

    // ascending frame order
    if (direction === 1) {
      for (i = consecutiveFrames[0]; i <= consecutiveFrames[1]; i++) {
        animationSequence.push(i);
      }
    }
    // descending order
    else {
      for (i = consecutiveFrames[0]; i >= consecutiveFrames[1]; i--) {
        animationSequence.push(i);
      }
    }

    return animationSequence;
  }

  /**
   * Single animation from a sprite sheet.
   * @private
   * @constructor
   *
   * @param {SpriteSheet} spriteSheet - Sprite sheet for the animation.
   * @param {object} animation - Animation object.
   * @param {array} animation.animationSequence - List of frames of the animation.
   * @param {number}  animation.frameSpeed - Number of frames to wait before transitioning the animation to the next frame.
   * @param {boolean} animation.repeat - Repeat the animation once completed.
   * @param {Image} animation.image - Image for the animation.
   */
  function Animation(spriteSheet, animation) {

    this.animationSequence = animation.animationSequence;
    this.frameSpeed = animation.frameSpeed;
    this.repeat = animation.repeat;

    var currentFrame = 0;  // the current frame to draw
    var counter = 0;       // keep track of frame rate

    /**
     * Update the animation.
     * @memberOf Animation
     */
    this.update = function() {

      // TODO: incorporate this.repeat

      // update to the next frame if it is time
      if (counter === (this.frameSpeed - 1)) {
        currentFrame = (currentFrame + 1) % this.animationSequence.length;
      }

      // update the counter
      counter = (counter + 1) % this.frameSpeed;
    };

    /**
     * Draw the current frame.
     * @memberOf Animation
     *
     * @param {integer} x - X position to draw
     * @param {integer} y - Y position to draw
     */
    this.draw = function(x, y) {
      // get the row and col of the frame
      var row = Math.floor(this.animationSequence[currentFrame] / spriteSheet.framesPerRow);
      var col = Math.floor(this.animationSequence[currentFrame] % spriteSheet.framesPerRow);

      ctx.drawImage(
        spriteSheet.image,
        col * spriteSheet.frameWidth, row * spriteSheet.frameHeight,
        spriteSheet.frameWidth, spriteSheet.frameHeight,
        x, y,
        spriteSheet.frameWidth, spriteSheet.frameHeight);
    };
  }

  return kontra;
})(kontra || {}, window, document);