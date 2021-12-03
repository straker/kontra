import Sprite, { SpriteClass } from '../../src/sprite.js';
import { noop } from '../../src/utils.js';

// test-context:start
let testContext = {
  SPRITE_IMAGE: true,
  SPRITE_ANIMATION: true
};
// test-context:end

// --------------------------------------------------
// sprite
// --------------------------------------------------
describe('sprite with context: ' + JSON.stringify(testContext, null, 4), () => {
  it('should export class', () => {
    expect(SpriteClass).to.be.a('function');
  });

  // --------------------------------------------------
  // init
  // --------------------------------------------------
  describe('init', () => {
    if (testContext.SPRITE_IMAGE) {
      it('should set the width and height of the sprite to an image if passed', () => {
        let img = new Image();
        img.width = 10;
        img.height = 20;

        let sprite = Sprite({
          image: img
        });

        expect(sprite.image).to.equal(img);
        expect(sprite.width).to.equal(10);
        expect(sprite.height).to.equal(20);
      });
    }

    if (testContext.SPRITE_IMAGE) {
      it('should allow user to override with and height of image', () => {
        let img = new Image();
        img.width = 10;
        img.height = 20;

        let sprite = Sprite({
          image: img,
          width: 20,
          height: 40
        });

        expect(sprite.image).to.equal(img);
        expect(sprite.width).to.equal(20);
        expect(sprite.height).to.equal(40);
      });
    }

    if (testContext.SPRITE_ANIMATION) {
      it('should set the width and height of the sprite to an animation if passed', () => {
        // simple animation object from spriteSheet
        let animations = {
          walk: {
            width: 10,
            height: 20,
            clone: function () {
              return this;
            }
          }
        };

        let sprite = Sprite({
          animations: animations
        });

        expect(sprite.animations).to.deep.equal(animations);
        expect(sprite.currentAnimation).to.equal(animations.walk);
        expect(sprite.width).to.equal(10);
        expect(sprite.height).to.equal(20);
      });
    }

    if (testContext.SPRITE_ANIMATION) {
      it('should clone any animations to prevent frame corruption', () => {
        let animations = {
          walk: {
            width: 10,
            height: 20,
            clone: function () {
              return this;
            }
          }
        };

        sinon.spy(animations.walk, 'clone');

        let sprite = Sprite({
          animations: animations
        });

        expect(animations.walk.clone.called).to.be.true;
      });
    }
  });

  // --------------------------------------------------
  // update
  // --------------------------------------------------
  describe('update', () => {
    if (testContext.SPRITE_ANIMATION) {
      it('should update the animation', () => {
        // simple animation object from spriteSheet
        let animations = {
          walk: {
            width: 10,
            height: 20,
            update: sinon.stub().callsFake(noop),
            clone: function () {
              return this;
            }
          }
        };

        let sprite = Sprite({
          x: 10,
          y: 20,
          animations: animations
        });
        sprite.update();

        expect(sprite.currentAnimation.update.called).to.be.true;
      });
    } else {
      it('should not update the animation', () => {
        let animations = {
          walk: {
            width: 10,
            height: 20,
            update: sinon.stub().callsFake(noop),
            clone: function () {
              return this;
            }
          }
        };

        let sprite = Sprite({
          x: 10,
          y: 20,
          animations: animations,
          currentAnimation: animations.walk
        });
        sprite.update();

        expect(sprite.currentAnimation.update.called).to.be.false;
      });
    }
  });

  // --------------------------------------------------
  // render
  // --------------------------------------------------
  describe('render', () => {
    it('should draw a rect sprite', () => {
      let sprite = Sprite({
        x: 10,
        y: 20,
        color: true
      });

      sinon.stub(sprite.context, 'fillRect').callsFake(noop);

      sprite.render();

      expect(sprite.context.fillRect.called).to.be.true;

      sprite.context.fillRect.restore();
    });

    if (testContext.SPRITE_IMAGE) {
      it('should draw an image sprite', () => {
        let img = new Image();
        img.width = 10;
        img.height = 20;

        let sprite = Sprite({
          x: 10,
          y: 20,
          image: img
        });

        sinon.stub(sprite.context, 'drawImage').callsFake(noop);

        sprite.render();

        expect(sprite.context.drawImage.called).to.be.true;

        sprite.context.drawImage.restore();
      });
    }

    if (testContext.SPRITE_ANIMATION) {
      it('should draw an animation sprite', () => {
        // simple animation object from spriteSheet
        let animations = {
          walk: {
            width: 10,
            height: 20,
            update: noop,
            render: noop,
            clone: function () {
              return this;
            }
          }
        };

        let sprite = Sprite({
          x: 10,
          y: 20,
          animations: animations
        });

        sinon.stub(sprite.currentAnimation, 'render').callsFake(noop);

        sprite.render();

        expect(sprite.currentAnimation.render.called).to.be.true;

        sprite.currentAnimation.render.restore();
      });
    }
  });

  // --------------------------------------------------
  // playAnimation
  // --------------------------------------------------
  describe('playAnimation', () => {
    if (testContext.SPRITE_ANIMATION) {
      it('should set the animation to play', () => {
        let animations = {
          walk: {
            width: 10,
            height: 20,
            reset: sinon.spy(),
            clone: function () {
              return this;
            }
          },
          idle: {
            width: 10,
            height: 20,
            reset: sinon.spy(),
            clone: function () {
              return this;
            }
          }
        };

        let sprite = Sprite({
          animations: animations
        });

        expect(sprite.currentAnimation).to.equal(animations.walk);

        sprite.playAnimation('idle');

        expect(sprite.currentAnimation).to.equal(animations.idle);
      });

      it("should reset the animation if it doesn't loop", () => {
        let animations = {
          walk: {
            width: 10,
            height: 20,
            loop: false,
            reset: sinon.spy(),
            clone: function () {
              return this;
            }
          }
        };

        let sprite = Sprite({
          animations: animations
        });

        sprite.playAnimation('walk');

        expect(animations.walk.reset.called).to.be.true;
      });
    } else {
      it('should not have animation property', () => {
        let sprite = Sprite();
        expect(sprite.animations).to.not.exist;
      });
    }
  });
});
