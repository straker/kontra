import Animation from '../../src/animation.js';
import { getContext } from '../../src/core.js';

// --------------------------------------------------
// animation
// --------------------------------------------------
describe('animation', () => {
  let animation;

  beforeEach(() => {
    animation = Animation({
      frames: [1, 2, 3, 4],
      frameRate: 30,
      spriteSheet: {
        image: new Image(),
        _f: 2,
        frame: {
          width: 5,
          height: 5,
          margin: 0
        }
      }
    });
  });

  // --------------------------------------------------
  // init
  // --------------------------------------------------
  describe('init', () => {
    it('should set properties on the animation', () => {
      expect(animation.frames).to.deep.equal([1, 2, 3, 4]);
      expect(animation.frameRate).to.equal(30);
      expect(animation.width).to.equal(5);
      expect(animation.height).to.equal(5);
      expect(animation.loop).to.equal(true);
      expect(animation.margin).to.equal(0);
    });
  });

  // --------------------------------------------------
  // clone
  // --------------------------------------------------
  describe('clone', () => {
    it('should return a new animation with the same properties', () => {
      let anim = animation.clone();

      expect(anim).to.not.equal(animation);
      expect(anim).to.deep.equal(animation);
    });
  });

  // --------------------------------------------------
  // reset
  // --------------------------------------------------
  describe('reset', () => {
    it('should reset the animation', () => {
      animation._f = 4;
      animation._a = 4;

      animation.reset();

      expect(animation._f).to.equal(0);
      expect(animation._a).to.equal(0);
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
      animation.update(1 / 30);

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

    it('should not restart the animation if loop is false', () => {
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
  // render
  // --------------------------------------------------
  describe('render', () => {
    it('should render the spriteSheet at its initial frame', () => {
      let context = { drawImage: sinon.stub() };

      animation.render({
        x: 10,
        y: 10,
        context: context
      });

      expect(context.drawImage.called).to.be.true;
      expect(context.drawImage.calledWith(animation.spriteSheet.image, 5, 0, 5, 5, 10, 10, 5, 5)).to
        .be.true;
    });

    it('should use the default context', () => {
      let context = getContext();
      sinon.stub(context, 'drawImage');

      animation.render({
        x: 10,
        y: 10
      });

      expect(context.drawImage.called).to.be.true;

      context.drawImage.restore();
    });

    it('should render the spriteSheet in the middle of the animation', () => {
      let context = { drawImage: sinon.stub() };

      animation._f = 2;

      animation.render({
        x: 10,
        y: 10,
        context: context
      });

      expect(context.drawImage.called).to.be.true;
      expect(context.drawImage.calledWith(animation.spriteSheet.image, 5, 5, 5, 5, 10, 10, 5, 5)).to
        .be.true;
    });
  });
});
