import Sprite from '../../src/sprite.js'
import { init, getCanvas, getContext } from '../../src/core.js'
import { noop } from '../../src/utils.js'

let testSprite = Sprite();

// optional properties
let hasImage = testSprite.hasOwnProperty('image');
let hasAnimation = !!testSprite.playAnimation;
let hasAnchor = testSprite.hasOwnProperty('anchor');

let properties = {
  image: hasImage,
  animation: hasAnimation,
  anchor: hasAnchor
};

// --------------------------------------------------
// sprite
// --------------------------------------------------
describe('sprite with properties: ' + JSON.stringify(properties,null,4), () => {

  before(() => {
    if (!getCanvas()) {
      let canvas = document.createElement('canvas');
      canvas.width = canvas.height = 600;
      init(canvas);
    }
  });

  // --------------------------------------------------
  // init
  // --------------------------------------------------
  describe('init', () => {

    if (hasImage) {
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

    if (hasImage) {
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

    if (hasAnimation) {
      it('should set the width and height of the sprite to an animation if passed', () => {
        // simple animation object from spriteSheet
        let animations = {
          'walk': {
            width: 10,
            height: 20,
            clone: function() {
              return this;
            }
          }
        };

        let sprite = Sprite({
          animations: animations
        });

        expect(sprite.animations).to.eql(animations);
        expect(sprite.currentAnimation).to.equal(animations.walk);
        expect(sprite.width).to.equal(10);
        expect(sprite.height).to.equal(20);
      });
    }

    if (hasAnimation) {
      it('should clone any animations to prevent frame corruption', () => {

        let animations = {
          'walk': {
            width: 10,
            height: 20,
            clone: function() {
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

    if (hasAnimation) {
      it('should update the animation', () => {
        // simple animation object from spriteSheet
        let animations = {
          'walk': {
            width: 10,
            height: 20,
            update: noop,
            clone: function() {
              return this;
            }
          }
        };

        let sprite = Sprite({
          x: 10,
          y: 20,
          animations: animations
        });

        sinon.stub(sprite.currentAnimation, 'update').callsFake(noop);

        sprite.update();

        expect(sprite.currentAnimation.update.called).to.be.ok;

        sprite.currentAnimation.update.restore();
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

      expect(sprite.context.fillRect.called).to.be.ok;

      sprite.context.fillRect.restore();
    });

    if (hasImage) {
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

        expect(sprite.context.drawImage.called).to.be.ok;

        sprite.context.drawImage.restore();
      });
    }

    if (hasAnimation) {
      it('should draw an animation sprite', () => {
        // simple animation object from spriteSheet
        let animations = {
          'walk': {
            width: 10,
            height: 20,
            update: noop,
            render: noop,
            clone: function() {
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

        expect(sprite.currentAnimation.render.called).to.be.ok;

        sprite.currentAnimation.render.restore();
      });
    }

  });





  // --------------------------------------------------
  // playAnimation
  // --------------------------------------------------
  if (hasAnimation) {
    describe('playAnimation', () => {

      it('should set the animation to play', () => {
        let animations = {
          'walk': {
            width: 10,
            height: 20,
            reset: sinon.spy(),
            clone: function() {
              return this;
            }
          },
          'idle': {
            width: 10,
            height: 20,
            reset: sinon.spy(),
            clone: function() {
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

      it('should reset the animation if it doesn\'t loop', () => {
        let animations = {
          'walk': {
            width: 10,
            height: 20,
            loop: false,
            reset: sinon.spy(),
            clone: function() {
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

    });
  }





  // --------------------------------------------------
  // scale
  // --------------------------------------------------
  if (hasImage || hasAnimation) {
    describe('scale', () => {

      it('should set _fx to 1 when width is >= 0', () => {
        let sprite = Sprite({
          x: 10,
          y: 20,
        });

        sprite.width = 0;

        expect(sprite._fx).to.equal(1);
        expect(sprite.width).to.equal(0);

        sprite.width = 100;

        expect(sprite._fx).to.equal(1);
        expect(sprite.width).to.equal(100);
      });

      it('should set _fx to -1 when width is < 0', () => {
        let sprite = Sprite({
          x: 10,
          y: 20,
        });

        sprite.width = -20;

        expect(sprite._fx).to.equal(-1);
        expect(sprite.width).to.equal(20);
      });

      it('should set _fy to 1 when height is >= 0', () => {
        let sprite = Sprite({
          x: 10,
          y: 20,
        });

        sprite.height = 0;

        expect(sprite._fy).to.equal(1);
         expect(sprite.height).to.equal(0);

        sprite.height = 100;

        expect(sprite._fy).to.equal(1);
        expect(sprite.height).to.equal(100);
      });

      it('should set _fy to -1 when height is < 0', () => {
        let sprite = Sprite({
          x: 10,
          y: 20,
        });

        sprite.height = -20;

        expect(sprite._fy).to.equal(-1);
        expect(sprite.height).to.equal(20);
      });

      it('should not scale the sprite by default', () => {
        let sprite = Sprite({
          x: 10,
          y: 20,
        });

        sinon.spy(sprite.context, 'scale');

        sprite.render();

        expect(sprite.context.scale.notCalled).to.be.true;

        sprite.context.scale.restore();
      });

      it('should scale the sprite by _fx', () => {
        let sprite = Sprite({
          x: 10,
          y: 20,
          width: -10
        });

        sinon.stub(sprite.context, 'scale').callsFake(noop);

        sprite.render();

        expect(sprite.context.scale.calledWith(-1,1)).to.be.ok;

        sprite.context.scale.restore();
      });

      it('should scale the sprite by _fy', () => {
        let sprite = Sprite({
          x: 10,
          y: 20,
          height: -10
        });

        sinon.stub(sprite.context, 'scale').callsFake(noop);

        sprite.render();

        expect(sprite.context.scale.calledWith(1,-1)).to.be.ok;

        sprite.context.scale.restore();
      });

      if (hasAnchor) {
        it('should scale the sprite at its center', () => {
          let sprite = Sprite({
            x: 10,
            y: 20,
            width: -10,
            height: 20
          });

          sinon.stub(sprite.context, 'translate').callsFake(noop);

          sprite.render();

          expect(sprite.context.translate.thirdCall.calledWith(sprite.width / 2, sprite.height / 2)).to.be.ok;

          sprite.context.translate.restore();
        });
      }
    });
  }

});
