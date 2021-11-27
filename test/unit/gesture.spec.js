import * as gesture from '../../src/gesture.js';
import { emit, on, callbacks as eventCallbacks } from '../../src/events.js';

// --------------------------------------------------
// gesture
// --------------------------------------------------
describe('gesture', () => {
  afterEach(() => {
    emit('touchEnd');
  });

  it('should export api', () => {
    expect(gesture.gestureMap).to.be.an('object');
    expect(gesture.initGesture).to.be.an('function');
    expect(gesture.onGesture).to.be.an('function');
  });

  // --------------------------------------------------
  // initGesture
  // --------------------------------------------------
  describe('initGesture', () => {
    it('should listen for touchChanged and touchEnd', () => {
      expect(eventCallbacks.touchChanged).to.not.exist;
      expect(eventCallbacks.touchEnd).to.not.exist;

      gesture.initGesture();

      expect(eventCallbacks.touchChanged).to.exist;
      expect(eventCallbacks.touchEnd).to.exist;
    });

    it('should only listen to events once', () => {
      gesture.initGesture();
      gesture.initGesture();

      expect(eventCallbacks.touchChanged.length).to.equal(1);
      expect(eventCallbacks.touchEnd.length).to.equal(1);
    });
  });

  // --------------------------------------------------
  // onGesture
  // --------------------------------------------------
  describe('onGesture', () => {
    before(() => {
      gesture.initGesture();
    });

    it('should add the listener to callbacks', () => {
      function foo() {}
      gesture.onGesture('swipeleft', foo);
      expect(gesture.callbacks.swipeleft).to.equal(foo);
    });
  });

  // --------------------------------------------------
  // swipe
  // --------------------------------------------------
  describe('swipe', () => {
    before(() => {
      gesture.initGesture();
    });

    it('should call swipeleft callback', () => {
      let spy = sinon.spy();
      gesture.onGesture('swipeleft', spy);

      let evt = { type: 'touchend' };
      let touches = {
        length: 1,
        0: {
          start: {
            x: 50,
            y: 50
          },
          x: 30,
          y: 50
        }
      };

      emit('touchChanged', evt, touches);

      expect(spy.calledWith(evt, touches)).to.be.true;
    });

    it('should call swiperight callback', () => {
      let spy = sinon.spy();
      gesture.onGesture('swiperight', spy);

      let evt = { type: 'touchend' };
      let touches = {
        length: 1,
        0: {
          start: {
            x: 50,
            y: 50
          },
          x: 90,
          y: 50
        }
      };

      emit('touchChanged', evt, touches);

      expect(spy.calledWith(evt, touches)).to.be.true;
    });

    it('should call swipeup callback', () => {
      let spy = sinon.spy();
      gesture.onGesture('swipeup', spy);

      let evt = { type: 'touchend' };
      let touches = {
        length: 1,
        0: {
          start: {
            x: 50,
            y: 50
          },
          x: 50,
          y: 30
        }
      };

      emit('touchChanged', evt, touches);

      expect(spy.calledWith(evt, touches)).to.be.true;
    });

    it('should call swipedown callback', () => {
      let spy = sinon.spy();
      gesture.onGesture('swipedown', spy);

      let evt = { type: 'touchend' };
      let touches = {
        length: 1,
        0: {
          start: {
            x: 50,
            y: 50
          },
          x: 50,
          y: 90
        }
      };

      emit('touchChanged', evt, touches);

      expect(spy.calledWith(evt, touches)).to.be.true;
    });

    it('should not call callback if threshold is not great enough', () => {
      let spy = sinon.spy();
      gesture.onGesture('swipeleft', spy);

      let evt = { type: 'touchend' };
      let touches = {
        length: 1,
        0: {
          start: {
            x: 50,
            y: 50
          },
          x: 45,
          y: 50
        }
      };

      emit('touchChanged', evt, touches);

      expect(spy.called).to.be.false;
    });

    it('should not call callback if there are too many touches', () => {
      let spy = sinon.spy();
      gesture.onGesture('swipeleft', spy);

      let evt = { type: 'touchend' };
      let touches = {
        length: 2,
        0: {
          start: {
            x: 50,
            y: 50
          },
          x: 45,
          y: 50
        },
        1: {
          start: {
            x: 90,
            y: 90
          },
          x: 30,
          y: 40
        }
      };

      emit('touchChanged', evt, touches);

      expect(spy.called).to.be.false;
    });

    it('should not call callback on wrong touch event', () => {
      let spy = sinon.spy();
      gesture.onGesture('swipeleft', spy);

      let evt = { type: 'touchmove' };
      let touches = {
        length: 1,
        0: {
          start: {
            x: 50,
            y: 50
          },
          x: 30,
          y: 50
        }
      };

      emit('touchChanged', evt, touches);

      expect(spy.called).to.be.false;
    });

    it('should not call callback if touch is wrong index', () => {
      let spy = sinon.spy();
      gesture.onGesture('swipeleft', spy);

      let evt = { type: 'touchend' };
      let touches = {
        length: 1,
        1: {
          start: {
            x: 50,
            y: 50
          },
          x: 30,
          y: 50
        }
      };

      emit('touchChanged', evt, touches);

      expect(spy.called).to.be.false;
    });
  });

  // --------------------------------------------------
  // pinch
  // --------------------------------------------------
  describe('pinch', () => {
    before(() => {
      gesture.initGesture();
    });

    it('should call pinchout callback', () => {
      let spy = sinon.spy();
      gesture.onGesture('pinchout', spy);

      let evt = { type: 'touchmove' };
      let touches = {
        length: 2,
        0: {
          start: {
            x: 50,
            y: 50
          },
          x: 60,
          y: 50
        },
        1: {
          start: {
            x: 25,
            y: 25
          },
          x: 15,
          y: 25
        }
      };

      emit(
        'touchChanged',
        { type: 'touchstart' },
        {
          length: 2,
          0: {
            x: 50,
            y: 50
          },
          1: {
            x: 25,
            y: 25
          }
        }
      );
      emit('touchChanged', evt, touches);

      expect(spy.calledWith(evt, touches)).to.be.true;
    });

    it('should call pinchin callback', () => {
      let spy = sinon.spy();
      gesture.onGesture('pinchin', spy);

      let evt = { type: 'touchmove' };
      let touches = {
        length: 2,
        0: {
          start: {
            x: 50,
            y: 50
          },
          x: 40,
          y: 50
        },
        1: {
          start: {
            x: 25,
            y: 25
          },
          x: 30,
          y: 25
        }
      };

      emit(
        'touchChanged',
        { type: 'touchstart' },
        {
          length: 2,
          0: {
            x: 50,
            y: 50
          },
          1: {
            x: 25,
            y: 25
          }
        }
      );
      emit('touchChanged', evt, touches);

      expect(spy.calledWith(evt, touches)).to.be.true;
    });

    it('should not call callback if threshold is not great enough', () => {
      let spy = sinon.spy();
      gesture.onGesture('pinchout', spy);

      let evt = { type: 'touchmove' };
      let touches = {
        length: 2,
        0: {
          start: {
            x: 50,
            y: 50
          },
          x: 49,
          y: 50
        },
        1: {
          start: {
            x: 25,
            y: 25
          },
          x: 25,
          y: 25
        }
      };

      emit(
        'touchChanged',
        { type: 'touchstart' },
        {
          length: 2,
          0: {
            x: 50,
            y: 50
          },
          1: {
            x: 25,
            y: 25
          }
        }
      );
      emit('touchChanged', evt, touches);

      expect(spy.called).to.be.false;
    });

    it('should not call callback if there not enough touches', () => {
      let spy = sinon.spy();
      gesture.onGesture('pinchout', spy);

      let evt = { type: 'touchmove' };
      let touches = {
        length: 1,
        0: {
          start: {
            x: 50,
            y: 50
          },
          x: 49,
          y: 50
        }
      };

      emit(
        'touchChanged',
        { type: 'touchstart' },
        {
          length: 1,
          0: {
            x: 50,
            y: 50
          }
        }
      );
      emit('touchChanged', evt, touches);

      expect(spy.called).to.be.false;
    });

    it('should not call callback on wrong touch event', () => {
      let spy = sinon.spy();
      gesture.onGesture('pinchout', spy);

      let evt = { type: 'touchend' };
      let touches = {
        length: 2,
        0: {
          start: {
            x: 50,
            y: 50
          },
          x: 60,
          y: 50
        },
        1: {
          start: {
            x: 25,
            y: 25
          },
          x: 15,
          y: 25
        }
      };

      emit(
        'touchChanged',
        { type: 'touchstart' },
        {
          length: 2,
          0: {
            x: 50,
            y: 50
          },
          1: {
            x: 25,
            y: 25
          }
        }
      );
      emit('touchChanged', evt, touches);

      expect(spy.called).to.be.false;
    });

    it('should not call swipe at end of a pinch if 1 finger calls touchend', () => {
      let spy = sinon.spy();
      gesture.onGesture('pinchin', sinon.stub());
      gesture.onGesture('swipeleft', spy);

      let evt = { type: 'touchend' };
      let touches = {
        length: 1,
        0: {
          start: {
            x: 50,
            y: 50
          },
          x: 30,
          y: 50
        }
      };

      emit(
        'touchChanged',
        { type: 'touchstart' },
        {
          length: 2,
          0: {
            x: 50,
            y: 50
          },
          1: {
            x: 25,
            y: 25
          }
        }
      );
      emit(
        'touchChanged',
        { type: 'touchmove' },
        {
          length: 2,
          0: {
            x: 20,
            y: 50
          },
          1: {
            x: 20,
            y: 25
          }
        }
      );

      emit('touchChanged', evt, touches);
      expect(spy.called).to.be.false;
    });

    it('should not call callback if touch is wrong index', () => {
      let spy = sinon.spy();
      gesture.onGesture('pinchout', spy);

      let evt = { type: 'touchmove' };
      let touches = {
        length: 2,
        0: {
          start: {
            x: 50,
            y: 50
          },
          x: 60,
          y: 50
        },
        2: {
          start: {
            x: 25,
            y: 25
          },
          x: 15,
          y: 25
        }
      };

      emit(
        'touchChanged',
        { type: 'touchstart' },
        {
          length: 2,
          0: {
            x: 50,
            y: 50
          },
          1: {
            x: 25,
            y: 25
          }
        }
      );
      emit('touchChanged', evt, touches);

      expect(spy.called).to.be.false;
    });
  });
});
