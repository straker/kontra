import SpriteSheet, { SpriteSheetClass } from '../../src/spriteSheet.js';
import { noop } from '../../src/utils.js';

// --------------------------------------------------
// spriteSheet
// --------------------------------------------------
describe('spriteSheet', () => {
  // --------------------------------------------------
  // init
  // --------------------------------------------------
  describe('init', () => {
    it('should log an error if no image is provided', () => {
      function func() {
        SpriteSheet();
      }

      expect(func).to.throw();
    });

    it('should initialize properties on the spriteSheet when passed an image', () => {
      let spriteSheet = SpriteSheet({
        image: new Image(100, 200),
        frameWidth: 10,
        frameHeight: 10,
        frameMargin: 10
      });

      expect(spriteSheet.frame.width).to.equal(10);
      expect(spriteSheet.frame.height).to.equal(10);
      expect(spriteSheet.frame.margin).to.equal(10);
      expect(spriteSheet._f).to.equal(10);
    });

    it('should create animations if passed an animation object', () => {
      sinon.stub(SpriteSheetClass.prototype, 'createAnimations').callsFake(noop);

      let spriteSheet = SpriteSheet({
        image: new Image(100, 200),
        frameWidth: 10,
        frameHeight: 10,
        animations: {}
      });

      expect(SpriteSheetClass.prototype.createAnimations.called).to.be.true;

      SpriteSheetClass.prototype.createAnimations.restore();
    });
  });

  // --------------------------------------------------
  // createAnimations
  // --------------------------------------------------
  describe('createAnimations', () => {
    let spriteSheet;

    beforeEach(() => {
      spriteSheet = SpriteSheet({
        image: new Image(100, 200),
        frameWidth: 10,
        frameHeight: 10
      });
    });

    it('should log an error if no frames property was passed', () => {
      function func() {
        spriteSheet.createAnimations({
          walk: {}
        });
      }

      expect(func).to.throw();
    });

    it('should accept a single frame', () => {
      spriteSheet.createAnimations({
        walk: {
          frames: 1
        }
      });

      expect(spriteSheet.animations.walk).to.exist;
      expect(spriteSheet.animations.walk.frames).to.deep.equal([1]);
    });

    it('should accept a string of ascending consecutive frames', () => {
      spriteSheet.createAnimations({
        walk: {
          frames: '1..5'
        }
      });

      expect(spriteSheet.animations.walk).to.exist;
      expect(spriteSheet.animations.walk.frames).to.deep.equal([1, 2, 3, 4, 5]);
    });

    it('should accept a string of descending consecutive frames', () => {
      spriteSheet.createAnimations({
        walk: {
          frames: '5..1'
        }
      });

      expect(spriteSheet.animations.walk).to.exist;
      expect(spriteSheet.animations.walk.frames).to.deep.equal([5, 4, 3, 2, 1]);
    });

    it('should accept an array of consecutive frames', () => {
      spriteSheet.createAnimations({
        walk: {
          frames: [1, 2, 3]
        }
      });

      expect(spriteSheet.animations.walk).to.exist;
      expect(spriteSheet.animations.walk.frames).to.deep.equal([1, 2, 3]);
    });

    it('should accept an array of non-consecutive frames', () => {
      spriteSheet.createAnimations({
        walk: {
          frames: [1, 3, 5]
        }
      });

      expect(spriteSheet.animations.walk).to.exist;
      expect(spriteSheet.animations.walk.frames).to.deep.equal([1, 3, 5]);
    });

    it('should accept a mixture of numbers, strings, and arrays', () => {
      spriteSheet.createAnimations({
        walk: {
          frames: [1, '2..3', 4, 5, '4..1']
        }
      });

      expect(spriteSheet.animations.walk).to.exist;
      expect(spriteSheet.animations.walk.frames).to.deep.equal([1, 2, 3, 4, 5, 4, 3, 2, 1]);
    });
  });
});
