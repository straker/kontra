import Sprite from '../../src/sprite.js'
import { init, getCanvas, getContext } from '../../src/core.js'
import { noop } from '../../src/utils.js'

// --------------------------------------------------
// sprite
// --------------------------------------------------
describe('sprite', () => {

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

    it('should set default properties on the sprite when passed no arguments', () => {
      let sprite = Sprite();

      expect(sprite.context).to.equal(getContext());
      expect(sprite.width).to.equal(0);
      expect(sprite.height).to.equal(0);
      expect(sprite.position.constructor.name).to.equal('Vector');
      expect(sprite.velocity.constructor.name).to.equal('Vector');
      expect(sprite.acceleration.constructor.name).to.equal('Vector');
      expect(sprite.ttl).to.equal(Infinity);
    });

    it('should set basic properties of width, height, color, x, and y', () => {
      let sprite = Sprite({
        x: 10,
        y: 20,
        color: 'red',
        width: 5,
        height: 15
      });

      expect(sprite.x).to.equal(10);
      expect(sprite.y).to.equal(20);
      expect(sprite.color).to.equal('red');
      expect(sprite.width).to.equal(5);
      expect(sprite.height).to.equal(15);
    });

    it('should set properties of velocity, acceleration, and a different context', () => {
      let context = {foo: 'bar'};

      let sprite = Sprite({
        dx: 2,
        dy: 1,
        ddx: 0.5,
        ddy: 0.2,
        context: context
      });

      expect(sprite.dx).to.equal(2);
      expect(sprite.dy).to.equal(1);
      expect(sprite.ddx).to.equal(0.5);
      expect(sprite.ddy).to.equal(0.2);
      expect(sprite.context).to.equal(context);
    });

    it('should keep the position, velocity, and acceleration vectors in sync', () => {
      let sprite = Sprite();

      sprite.x = 10;
      sprite.y = 20;
      sprite.dx = 2;
      sprite.dy = 1;
      sprite.ddx = 0.5;
      sprite.ddy = 0.2;

      expect(sprite.position.x).to.equal(10);
      expect(sprite.position.y).to.equal(20);
      expect(sprite.velocity.x).to.equal(2);
      expect(sprite.velocity.y).to.equal(1);
      expect(sprite.acceleration.x).to.equal(0.5);
      expect(sprite.acceleration.y).to.equal(0.2);
    });

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

    it('should set all additional properties on the sprite', () => {
      let sprite = Sprite({
        foo: 'bar',
        alive: true
      });

      expect(sprite.foo).to.equal('bar');
      expect(sprite.alive).to.be.true;
    });

    it('should have required properties for kontra.pool', () => {
      let sprite = Sprite();
      expect(typeof sprite.init).to.equal('function');
      expect(typeof sprite.update).to.equal('function');
      expect(typeof sprite.isAlive).to.equal('function');
    });

  });





  // --------------------------------------------------
  // update
  // --------------------------------------------------
  describe('update', () => {

    it('should move a rect sprite by its velocity and acceleration', () => {
      let sprite = Sprite({
        x: 10,
        y: 20,
        dx: 2,
        dy: 1,
        ddx: 0.5,
        ddy: 0.2
      });

      sprite.update();

      expect(sprite.dx).to.equal(2.5);
      expect(sprite.dy).to.equal(1.2);
      expect(sprite.x).to.equal(12.5);
      expect(sprite.y).to.equal(21.2);
    });

    it('should move an image sprite by its velocity and acceleration', () => {
      let img = new Image();
      img.width = 10;
      img.height = 20;

      let sprite = Sprite({
        x: 10,
        y: 20,
        dx: 2,
        dy: 1,
        ddx: 0.5,
        ddy: 0.2,
        image: img
      });

      sprite.update();

      expect(sprite.dx).to.equal(2.5);
      expect(sprite.dy).to.equal(1.2);
      expect(sprite.x).to.equal(12.5);
      expect(sprite.y).to.equal(21.2);
    });

    it('should move an animation sprite by its velocity and acceleration', () => {
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
        dx: 2,
        dy: 1,
        ddx: 0.5,
        ddy: 0.2,
        animations: animations
      });

      sprite.update();

      expect(sprite.dx).to.equal(2.5);
      expect(sprite.dy).to.equal(1.2);
      expect(sprite.x).to.equal(12.5);
      expect(sprite.y).to.equal(21.2);
    });

  });





  // --------------------------------------------------
  // render
  // --------------------------------------------------
  describe('render', () => {

    it('should draw a rect sprite', () => {
      let sprite = Sprite({
        x: 10,
        y: 20
      });

      sinon.stub(sprite.context, 'fillRect').callsFake(noop);

      sprite.render();

      expect(sprite.context.fillRect.called).to.be.ok;

      sprite.context.fillRect.restore();
    });

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

    it('should rotate the sprite', () => {
      let sprite = Sprite({
        x: 10,
        y: 20,
        rotation: Math.PI
      });

      sinon.stub(sprite.context, 'rotate').callsFake(noop);

      sprite.render();

      expect(sprite.context.rotate.called).to.be.ok;

      sprite.context.rotate.restore();
    });

    it('should draw a rect sprite and take into account sprite.anchor', () => {
      let sprite = Sprite({
        x: 10,
        y: 20,
        width: 100,
        height: 50,
        anchor: {
          x: 0.5,
          y: 0.5
        }
      });

      sinon.stub(sprite.context, 'fillRect').callsFake(noop);

      sprite.render();

      expect(sprite.context.fillRect.calledWith(-50, -25, 100, 50)).to.be.ok;

      sprite.anchor = {x: 1, y: 1};
      sprite.render();

      expect(sprite.context.fillRect.calledWith(-100, -50, 100, 50)).to.be.ok;

      sprite.context.fillRect.restore();
    });

    it('should draw an image sprite and take into account sprite.anchor and custom width', () => {
      let img = new Image();
      img.width = 10;
      img.height = 20;

      let sprite = Sprite({
        x: 10,
        y: 20,
        image: img,
        anchor: {
          x: 0.5,
          y: 0.5
        }
      });

      sinon.stub(sprite.context, 'drawImage').callsFake(noop);

      sprite.render();
      expect(sprite.context.drawImage.calledWith(img, 0, 0, 10, 20, -5, -10, 10, 20)).to.be.ok;

      sprite.anchor = {x: 1, y: 1};
      sprite.render();

      expect(sprite.context.drawImage.calledWith(img, 0, 0, 10, 20, -10, -20, 10, 20)).to.be.ok;

      sprite.width = 20;
      sprite.render();

      expect(sprite.context.drawImage.calledWith(img, 0, 0, 10, 20, -20, -20, 20, 20)).to.be.ok;

      sprite.context.drawImage.restore();
    });

    it('should draw an animation sprite and take into account sprite.anchor', () => {
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
        animations: animations,
        anchor: {
          x: 0.5,
          y: 0.5
        }
      });

      sinon.stub(sprite.currentAnimation, 'render').callsFake(noop);

      sprite.render();

      expect(sprite.currentAnimation.render.calledWithMatch({x: -5, y: -10, context: sprite.context})).to.be.ok;

      sprite.anchor = {x: 1, y: 1};
      sprite.render();

      expect(sprite.currentAnimation.render.calledWithMatch({x: -10, y: -20, context: sprite.context})).to.be.ok;

      sprite.currentAnimation.render.restore();
    });

    it('should draw the sprite and at the viewX and viewY', () => {
      let sprite = Sprite({
        x: 10,
        y: 20
      });

      sinon.stub(sprite.context, 'translate').callsFake(noop);

      sprite.render();

      expect(sprite.context.translate.calledWith(10, 20)).to.be.ok;

      sprite.sx = 200;
      sprite.sy = 200;

      sprite.render();

      expect(sprite.context.translate.calledWith(-190, -180)).to.be.ok;

      sprite.context.translate.restore();
    });

  });





  // --------------------------------------------------
  // collidesWith
  // --------------------------------------------------
  describe('collidesWith', () => {

    it('should correctly detect collision between two objects', () => {
      let sprite1 = Sprite({
        x: 10,
        y: 20,
        width: 10,
        height: 20
      });

      let sprite2 = Sprite({
        x: 19,
        y: 39,
        width: 10,
        height: 20
      });

      expect(sprite1.collidesWith(sprite2)).to.be.true;

      sprite2.x = 10;
      sprite2.y = 20;

      expect(sprite1.collidesWith(sprite2)).to.be.true;

      sprite2.x = 1;
      sprite2.y = 1;

      expect(sprite1.collidesWith(sprite2)).to.be.true;

      sprite2.x = 20;
      sprite2.y = 40;

      expect(sprite1.collidesWith(sprite2)).to.be.false;

      sprite2.x = 0;
      sprite2.y = 0;

      expect(sprite1.collidesWith(sprite2)).to.be.false;
    });

    it('should take into account sprite.anchor', () => {
      let sprite1 = Sprite({
        x: 10,
        y: 20,
        width: 10,
        height: 20,
        anchor: {
          x: 0.5,
          y: 0.5
        }
      });

      let sprite2 = Sprite({
        x: 10,
        y: 20,
        width: 10,
        height: 20
      });

      expect(sprite1.collidesWith(sprite2)).to.be.true;

      sprite1.anchor = {x: 1, y: 0};

      expect(sprite1.collidesWith(sprite2)).to.be.false;

      sprite2.anchor = {x: 1, y: 0};

      expect(sprite1.collidesWith(sprite2)).to.be.true;
    });

    it('should return null if either sprite is rotated', () => {
      let sprite1 = Sprite({
        x: 10,
        y: 20,
        width: 10,
        height: 20,
        rotation: 1
      });

      let sprite2 = Sprite({
        x: 19,
        y: 39,
        width: 10,
        height: 20
      });

      expect(sprite1.collidesWith(sprite2)).to.equal(null);

      sprite1.rotation = 0;
      sprite2.rotation = 1;

      expect(sprite1.collidesWith(sprite2)).to.equal(null);
    });

    it('should work for non-sprite objects', () => {
      let sprite1 = Sprite({
        x: 10,
        y: 20,
        width: 10,
        height: 20
      });

      let obj = {
        x: 10,
        y: 20,
        width: 10,
        height: 20
      };

      expect(sprite1.collidesWith(obj)).to.be.true;
    });

  });





  // --------------------------------------------------
  // isAlive
  // --------------------------------------------------
  describe('isAlive', () => {

    it('should return true when the sprite is alive', () => {
      let sprite = Sprite();

      expect(sprite.isAlive()).to.be.true;

      sprite.ttl = 1;

      expect(sprite.isAlive()).to.be.true;
    });

    it('should return false when the sprite is not alive', () => {
      let sprite = Sprite({
        ttl: 0
      });

      expect(sprite.isAlive()).to.be.false;
    });

  });





  // --------------------------------------------------
  // playAnimation
  // --------------------------------------------------
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





  // --------------------------------------------------
  // viewX/Y
  // --------------------------------------------------
  describe('viewX/Y', () => {

    it('should return the position + camera', () => {
      let sprite = Sprite({
        x: 10,
        y: 20
      });

      expect(sprite.viewX).to.equal(10);
      expect(sprite.viewY).to.equal(20);

      sprite.sx = 50;
      sprite.sy = 50;

      expect(sprite.viewX).to.equal(-40);
      expect(sprite.viewY).to.equal(-30);
    });

    it('should be readonly', () => {
      let sprite = Sprite({
        x: 10,
        y: 20
      });

      sprite.viewX = 100;
      sprite.viewY = 100;

      expect(sprite.viewX).to.equal(10);
      expect(sprite.viewY).to.equal(20);
    });

  });





  // --------------------------------------------------
  // scale
  // --------------------------------------------------
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

    it('should scale the sprite at its center', () => {
      let sprite = Sprite({
        x: 10,
        y: 20,
        width: -10,
        height: 20
      });

      sinon.stub(sprite.context, 'translate').callsFake(noop);

      sprite.render();

      expect(sprite.context.translate.secondCall.calledWith(sprite.width / 2, sprite.height / 2)).to.be.ok;

      sprite.context.translate.resetHistory();
      sprite.anchor = {x: 0.5, y: 0.5};

      sprite.render();

      expect(sprite.context.translate.secondCall.calledWith(0, 0)).to.be.ok;

      sprite.context.translate.resetHistory();
      sprite.anchor = {x: 1, y: 1};

      sprite.render();

      expect(sprite.context.translate.secondCall.calledWith(-sprite.width / 2, -sprite.height / 2)).to.be.ok;

      sprite.context.translate.restore();
    });

  });

});