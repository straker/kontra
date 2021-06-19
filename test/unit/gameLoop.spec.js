import GameLoop from '../../src/gameLoop.js'
import { getContext } from '../../src/core.js'
import { on } from '../../src/events.js'
import { noop } from '../../src/utils.js'

// --------------------------------------------------
// gameloop
// --------------------------------------------------
describe('gameLoop', () => {
  let loop;

  /**
   * Simulate an event.
   * @param {string} type - Type of keyboard event.
   */
  function simulateEvent(type) {
    let evt;

    // PhantomJS <2.0.0 throws an error for the `new Event` call, so we need to supply an
    // alternative form of creating an event just for PhantomJS
    // @see https://github.com/ariya/phantomjs/issues/11289#issuecomment-38880333
    try {
      evt = new Event(type);
    } catch(e) {
      evt = document.createEvent('Event');
      evt.initEvent(type, true, false);
    }

    window.dispatchEvent(evt);
  }

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
  // start
  // --------------------------------------------------
  describe('start', () => {
    it('should call requestAnimationFrame', () => {
      sinon.stub(window, 'requestAnimationFrame').callsFake(noop);

      loop = GameLoop({
        render: noop,
        clearCanvas: false
      });

      loop.start();

      expect(window.requestAnimationFrame.called).to.be.true;

      window.requestAnimationFrame.restore();
    });

    it('should unset isStopped', () => {
      loop.isStopped = true;
      loop.start();

      expect(loop.isStopped).to.be.false;
    });

  });





  // --------------------------------------------------
  // stop
  // --------------------------------------------------
  describe('stop', () => {
    it('should call cancelAnimationFrame', () => {
      sinon.stub(window, 'cancelAnimationFrame').callsFake(noop);

      loop = GameLoop({
        render: noop,
        clearCanvas: false
      });

      loop.stop();

      expect(window.cancelAnimationFrame.called).to.be.true;

      window.cancelAnimationFrame.restore();
    });

    it('should set isStopped', () => {
      loop.isStopped = false;
      loop.stop();

      expect(loop.isStopped).to.be.true;
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
        expect(loop.update.called).to.be.true;
        expect(loop.update.getCall(0).args[0]).to.equal(1/60);
        done();
      }, 250);
    });

    it('should call the render function', (done) => {
      loop = GameLoop({
        render: sinon.spy(),
        clearCanvas: false
      });

      loop.start();

      setTimeout(() => {
        expect(loop.render.called).to.be.true;
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

    it('should change the frame rate if passed fps', function() {
      let count = 0;

      loop = GameLoop({
        update: function(time) { count++; },
        render: noop,
        clearCanvas: false,
        fps: 30
      });

      loop._last = performance.now() - (1E3/60) * 2.5;
      loop._frame();

      expect(count).to.equal(1);
    });

    it('should call clearCanvas by default', () => {
      loop = GameLoop({
        render: noop
      });
      let context = getContext();

      sinon.stub(context, 'clearRect').callsFake(noop);

      loop._last = performance.now() - (1E3/60);
      loop._frame();

      expect(context.clearRect.called).to.be.true;

      context.clearRect.restore();
    });

    it('should not clear the canvas if clearCanvas is false', function() {
      loop = GameLoop({
        render: noop,
        clearCanvas: false
      });
      let context = getContext();

      sinon.stub(context, 'clearRect').callsFake(noop);

      loop._last = performance.now() - (1E3/60);
      loop._frame();

      expect(context.clearRect.called).to.be.false;

      context.clearRect.restore();
    });

    it('should call clearCanvas on the passed in context', () => {
      let context = {
        canvas: {
          width: 0,
          height: 0,
        },
        clearRect: sinon.stub().callsFake(noop)
      };

      loop = GameLoop({
        render: noop,
        context
      });

      loop._last = performance.now() - (1E3/60);
      loop._frame();

      expect(context.clearRect.called).to.be.true;
    });

    it('should emit the tick event', done => {
      on('tick', done);

      loop = GameLoop({
        render: noop
      });
      loop._last = performance.now() - (1E3/60);
      loop._frame();

      throw new Error('should not get here');
    });

    it('should not update if page is blurred', (done) => {
      loop = GameLoop({
        update() {
          throw new Error('should not get here');
        },
        render: noop
      });
      simulateEvent('blur');
      loop._last = performance.now() - (1E3/60);
      loop._frame();

      setTimeout(done, 100);
    });

    it('should update if page is blurred when blur is true', (done) => {
      loop = GameLoop({
        blur: true,
        update() {
          done();
        },
        render: noop
      });
      simulateEvent('blur');
      loop._last = performance.now() - (1E3/60);
      loop._frame();

      throw new Error('should not get here');
    });

  });

});