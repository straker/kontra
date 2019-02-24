import kontra from '../../src/core.js'
import gameLoop from '../../src/gameLoop.js'

// --------------------------------------------------
// gameloop
// --------------------------------------------------
describe('gameLoop', () => {
  let loop;

  before(() => {
    if (!kontra.canvas) {
      let canvas = document.createElement('canvas');
      canvas.width = canvas.height = 600;
      kontra.init(canvas);
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
        gameLoop();
      }

      expect(func).to.throw();
    });

  });





  // --------------------------------------------------
  // stop
  // --------------------------------------------------
  describe('stop', () => {
    it('should call cancelAnimationFrame', () => {
      sinon.stub(window, 'cancelAnimationFrame').callsFake(kontra._noop);

      loop = gameLoop({
        update: kontra._noop,
        render: kontra._noop,
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
      loop = gameLoop({
        update: sinon.spy(),
        render: kontra._noop,
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
      loop = gameLoop({
        update: kontra._noop,
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

      loop = gameLoop({
        update: function(time) { count++; },
        render: kontra._noop,
        clearCanvas: false
      });

      loop._last = performance.now() - 1500;
      loop._frame();

      expect(count).to.equal(0);
    });

    it('should make multiple calls to the update function if enough time has elapsed', () => {
      let count = 0;

      loop = gameLoop({
        update: function(time) { count++; },
        render: kontra._noop,
        clearCanvas: false
      });

      loop._last = performance.now() - (1E3/60) * 2.5;
      loop._frame();

      expect(count).to.equal(2);
    });

    it('should call clearCanvas by default', () => {
      loop = gameLoop({
        update: kontra._noop,
        render: kontra._noop
      });

      sinon.stub(kontra.context, 'clearRect').callsFake(kontra._noop);

      loop._last = performance.now() - (1E3/60);
      loop._frame();

      expect(kontra.context.clearRect.called).to.be.true;

      kontra.context.clearRect.restore();
    });

    it('should emit the tick event', () => {
      let stub = sinon.stub(kontra, 'emit');

      loop = gameLoop({
        update: kontra._noop,
        render: kontra._noop
      });
      loop._last = performance.now() - (1E3/60);
      loop._frame();

      expect(stub.called).to.equal(true);
      expect(stub.calledWith('tick')).to.equal(true);

      stub.restore();
    });

  });

});