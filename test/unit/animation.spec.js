import Animation from '../../src/animation.js'
import { init, getCanvas, getContext } from '../../src/core.js'

// --------------------------------------------------
// animation
// --------------------------------------------------
describe('animation', () => {
  let animation;

  before(() => {
    if (!getCanvas()) {
      let canvas = document.createElement('canvas');
      canvas.width = canvas.height = 600;
      init(canvas);
    }
  });

  beforeEach(() => {
    animation = Animation({
      frames: [1,2,3,4],
      frameRate: 30,
      spriteSheet: {
        image: new Image(),
        _f: 2,
        frame: {
          width: 5,
          height: 5
        }
      }
    });
  });


  // --------------------------------------------------
  // init
  // --------------------------------------------------
  describe('init', () => {

    it('should set properties on the animation', () => {
      expect(animation.frames).to.eql([1,2,3,4]);
      expect(animation.frameRate).to.equal(30);
      expect(animation.width).to.equal(5);
      expect(animation.height).to.equal(5);
      expect(animation.loop).to.equal(true);
    });

  });





  // --------------------------------------------------
  // clone
  // --------------------------------------------------
  describe('clone', () => {

    it('should return a new animation with the same properties', () => {
      let anim = animation.clone();

      expect(anim).to.not.equal(animation);
      expect(anim).to.eql(animation);
    });

  });





  // --------------------------------------------------
  // update
  // --------------------------------------------------
  describe('update', () => {

    it('should not update the current frame if not enough time has passed', () => {
      animation.update();

      expect(animation._f).to.equal(0);
    });

    it('should take no parameter and update the current frame correctly', () => {
      for (let i = 0; i < 3; i++) {
        animation.update();
      }

      expect(animation._f).to.equal(1);
    });

    it('should take dt as a parameter and update the current frame correctly', () => {
      animation.update(1/30);

      expect(animation._f).to.equal(1);
    });

    it('should restart the animation when finished', () => {
      for (let i = 0; i < 7; i++) {
        animation.update();
      }

      expect(animation._f).to.equal(3);

      animation.update();

      expect(animation._f).to.equal(0);
    });

    it('should not reset the animation if loop is false', () => {
      animation.loop = false;

      for (let i = 0; i < 7; i++) {
        animation.update();
      }

      expect(animation._f).to.equal(3);

      animation.update();

      expect(animation._f).to.equal(3);
    });

  });





  // --------------------------------------------------
  // draw
  // --------------------------------------------------
  describe('draw', () => {

    it('should draw the spriteSheet at its initial frame', () => {
      let context = {drawImage: sinon.stub()};

      animation.render({
        x: 10,
        y: 10,
        context: context
      });

      expect(context.drawImage.called).to.be.ok;
      expect(context.drawImage.calledWith(
        animation.spriteSheet.image,
        5, 0, 5, 5, 10, 10, 5, 5
      )).to.be.ok;
    });

    it('should use the default context', () => {
      let context = getContext();
      sinon.stub(context, 'drawImage');

      animation.render({
        x: 10,
        y: 10
      });

      expect(context.drawImage.called).to.be.ok;

      context.drawImage.restore();
    });

    it('should draw the spriteSheet in the middle of the animation', () => {
      let context = {drawImage: sinon.stub()};

      animation._f = 2;

      animation.render({
        x: 10,
        y: 10,
        context: context
      });

      expect(context.drawImage.called).to.be.ok;
      expect(context.drawImage.calledWith(
        animation.spriteSheet.image,
        5, 5, 5, 5, 10, 10, 5, 5
      )).to.be.ok;
    });

  });

});