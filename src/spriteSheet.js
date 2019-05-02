import Animation from './animation.js'

/**
 * Parse a string of consecutive frames.
 *
 * @param {Number|String} frames - Start and end frame.
 *
 * @returns {Number|Number[]} List of frames.
 */
function parseFrames(consecutiveFrames) {
  // return a single number frame
  // @see https://github.com/jed/140bytes/wiki/Byte-saving-techniques#coercion-to-test-for-types
  if (+consecutiveFrames === consecutiveFrames) {
    return consecutiveFrames;
  }

  let sequence = [];
  let frames = consecutiveFrames.split('..');

  // coerce string to number
  // @see https://github.com/jed/140bytes/wiki/Byte-saving-techniques#coercion-to-test-for-types
  let start = +frames[0];
  let end = +frames[1];
  let i = start;

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

/**
 * A sprite sheet to animate a sequence of images. Used to create [animation sprites](./Sprite#animation-sprite).
 *
 * <figure>
 *   <a href="assets/imgs/character_walk_sheet.png">
 *     <img src="assets/imgs/character_walk_sheet.png" alt="11 frames of a walking pill-like alien wearing a space helmet.">
 *   </a>
 *   <figcaption>Sprite sheet image courtesy of <a href="https://kenney.nl/assets">Kenney</a>.</figcaption>
 * </figure>
 *
 * Typically you create a sprite sheet just to create animations and then use the animations for your sprite.
 *
 * ```js
 * import { Sprite, SpriteSheet } from 'kontra';
 *
 * let image = new Image();
 * image.src = 'assets/imgs/character_walk_sheet.png';
 * image.onload = function() {
 *   let spriteSheet = SpriteSheet({
 *     image: image,
 *     frameWidth: 72,
 *     frameHeight: 97,
 *     animations: {
 *       // create a named animation: walk
 *       walk: {
 *         frames: '0..9',  // frames 0 through 9
 *         frameRate: 30
 *       }
 *     }
 *   });
 *
 *   let sprite = Sprite({
 *     x: 200,
 *     y: 100,
 *
 *     // use the sprite sheet animations for the sprite
 *     animations: spriteSheet.animations
 *   });
 * };
 * ```
 * @class SpriteSheet
 *
 * @param {Object} properties - Properties of the sprite sheet.
 * @param {Image|HTMLCanvasElement} properties.image - The sprite sheet image.
 * @param {Number} properties.frameWidth - The width of a single frame.
 * @param {Number} properties.frameHeight - The height of a single frame.
 * @param {Number} [properties.frameMargin=0] - The amount of whitespace between each frame.
 * @param {Object} [properties.animations] - Animations to create from the sprite sheet using kontra.Animation. Passed directly into the sprite sheets [createAnimations()](#createAnimations) function.
 */
class SpriteSheet {
  constructor({image, frameWidth, frameHeight, frameMargin, animations} = {}) {
    // @if DEBUG
    if (!image) {
      throw Error('You must provide an Image for the SpriteSheet');
    }
    // @endif

    /**
     * An object of named kontra.Animation objects. Typically you pass this object into kontra.Sprite to create an [animation sprites](./Sprite#animation-sprite).
     * @memberof SpriteSheet
     * @property {Object} animations
     */
    this.animations = {};

    /**
     * The sprite sheet image.
     * @memberof SpriteSheet
     * @property {Image|HTMLCanvasElement} image
     */
    this.image = image;

    /**
     * An object that defines properties of a single frame in the sprite sheet. It has properties of `width`, `height`, and `margin`.
     *
     * `width` and `height` are the width of a single frame, while `margin` defines the amount of whitespace between each frame.
     * @memberof SpriteSheet
     * @property {Object} frame
     */
    this.frame = {
      width: frameWidth,
      height: frameHeight,
      margin: frameMargin
    };

    // f = framesPerRow
    this._f = image.width / frameWidth | 0;

    this.createAnimations(animations);
  }

  /**
   * Create named animations from the sprite sheet. Called from the constructor if the `animations` argument is passed.
   *
   * This function populates the sprite sheets `animations` property with kontra.Animation objects. Each animation is accessible by its name.
   *
   * ```js
   * import { Sprite, SpriteSheet } from 'kontra';
   *
   * let image = new Image();
   * image.src = 'assets/imgs/character_walk_sheet.png';
   * image.onload = function() {
   *
   *   let spriteSheet = SpriteSheet({
   *     image: image,
   *     frameWidth: 72,
   *     frameHeight: 97,
   *
   *     // this will also call createAnimations()
   *     animations: {
   *       // create 1 animation: idle
   *       idle: {
   *         // a single frame
   *         frames: 1
   *       }
   *     }
   *   });
   *
   *   spriteSheet.createAnimations({
   *     // create 4 animations: jump, walk, moonWalk, attack
   *     jump: {
   *       // sequence of frames (can be non-consecutive)
   *       frames: [1, 10, 1],
   *       frameRate: 10,
   *       loop: false,
   *     },
   *     walk: {
   *       // ascending consecutive frame animation (frames 2-6, inclusive)
   *       frames: '2..6',
   *       frameRate: 20
   *     },
   *     moonWalk: {
   *       // descending consecutive frame animation (frames 6-2, inclusive)
   *       frames: '6..2',
   *       frameRate: 20
   *     },
   *     attack: {
   *       // you can also mix and match, in this case frames [8,9,10,13,10,9,8]
   *       frames: ['8..10', 13, '10..8'],
   *       frameRate: 10,
   *       loop: false,
   *     }
   *   });
   * };
   * ```
   * @memberof SpriteSheet
   * @function createAnimations
   *
   * @param {Object} animations - Object of named animations to create from the sprite sheet.
   * @param {Number|String|Number[]|String[]} animations.<name>.frames - The sequence of frames to use from the sprite sheet. It can either be a single frame (`1`), a sequence of frames (`[1,2,3,4]`), or a consecutive frame notation (`'1..4'`). Sprite sheet frames are `0` indexed.
   * @param {Number} animations.<name>.frameRate - The number frames to display per second.
   * @param {Boolean} [animations.<name>.loop=true] - If the animation should loop back to the beginning once completed.
   */
  createAnimations(animations) {
    let sequence, name;

    for (name in animations) {
      let { frames, frameRate, loop } = animations[name];

      // array that holds the order of the animation
      sequence = [];

      // @if DEBUG
      if (frames === undefined) {
        throw Error('Animation ' + name + ' must provide a frames property');
      }
      // @endif

      // add new frames to the end of the array
      [].concat(frames).map(frame => {
        sequence = sequence.concat(parseFrames(frame));
      });

      this.animations[name] = Animation({
        spriteSheet: this,
        frames: sequence,
        frameRate,
        loop
      });
    }
  }
}

export default function spriteSheetFactory(properties) {
  return new SpriteSheet(properties);
}
spriteSheetFactory.prototype = SpriteSheet.prototype;
spriteSheetFactory.class = SpriteSheet;