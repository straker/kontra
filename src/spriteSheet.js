import Animation from './animation.js'

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

      this.animations[name] = Animation({
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

export default function SpriteSheetFactory(properties) {
  return new SpriteSheet(properties);
}
SpriteSheetFactory.prototype = SpriteSheet.prototype;