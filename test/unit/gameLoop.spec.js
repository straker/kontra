import GameLoop from '../../src/gameLoop.js'
import { init, getCanvas, getContext } from '../../src/core.js'
import { on } from '../../src/events.js'
import { noop } from '../../src/utils.js'

// --------------------------------------------------
// gameloop
// --------------------------------------------------
describe('gameLoop', () => {
  let loop;

  before(() => {
    if (!getCanvas()) {
      let canvas = document.createElement('canvas');
      canvas.width = canvas.height = 600;
      init(canvas);
    }
  });

  afterEach(() => {
    loop && loop.stop();
  });

  // --------------------------------------------------
  // init
  // --------------------------------------------------
  describe('init', () => {

    it('should log an error if not passed required functions', () => {
      function func() {
        GameLoop();
      }

      expect(func).to.throw();
    });

  });





  // --------------------------------------------------
  // stop
  // --------------------------------------------------
  describe('stop', () => {
    it('should call cancelAnimationFrame', () => {
      sinon.stub(window, 'cancelAnimationFrame').callsFake(noop);

      loop = GameLoop({
        update: noop,
        render: noop,
        clearCanvas: false
      });

      loop.stop();

      expect(window.cancelAnimationFrame.called).to.be.ok;

      window.cancelAnimationFrame.restore();
    });

  });





  // --------------------------------------------------
  // frame
  // --------------------------------------------------
  describe('frame', () => {

    it('should call the update function and pass it dt', (done) => {
      loop = GameLoop({
        update: sinon.spy(),
        render: noop,
        clearCanvas: false
      });

      loop.start();

      setTimeout(() => {
        expect(loop.update.called).to.be.ok;
        expect(loop.update.getCall(0).args[0]).to.equal(1/60);
        done();
      }, 250);
    });

    it('should call the render function', (done) => {
      loop = GameLoop({
        update: noop,
        render: sinon.spy(),
        clearCanvas: false
      });

      loop.start();

      setTimeout(() => {
        expect(loop.render.called).to.be.ok;
        done();
      }, 250);
    });

    it('should exit early if time elapsed is greater than 1000ms', () => {
      let count = 0;

      loop = GameLoop({
        update: function(time) { count++; },
        render: noop,
        clearCanvas: false
      });

      loop._last = performance.now() - 1500;
      loop._frame();

      expect(count).to.equal(0);
    });

    it('should make multiple calls to the update function if enough time has elapsed', () => {
      let count = 0;

      loop = GameLoop({
        update: function(time) { count++; },
        render: noop,
        clearCanvas: false
      });

      loop._last = performance.now() - (1E3/60) * 2.5;
      loop._frame();

      expect(count).to.equal(2);
    });

    it('should call clearCanvas by default', () => {
      loop = GameLoop({
        update: noop,
        render: noop
      });
      let context = getContext();

      sinon.stub(context, 'clearRect').callsFake(noop);

      loop._last = performance.now() - (1E3/60);
      loop._frame();

      expect(context.clearRect.called).to.be.true;

      context.clearRect.restore();
    });

    it('should emit the tick event', done => {
      on('tick', done);

      loop = GameLoop({
        update: noop,
        render: noop
      });
      loop._last = performance.now() - (1E3/60);
      loop._frame();

      throw new Error('should not get here');
    });

  });

});