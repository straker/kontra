import * as gamepad from '../../src/gamepad.js';
import { callbacks as eventCallbacks } from '../../src/events.js';

// --------------------------------------------------
// gamepad
// --------------------------------------------------
describe.only('gamepad', () => {
  /**
   * Simulate a gamepad event.
   * @param {string} type - Type of gamepad event.
   * @param {object} [config] - Additional settings for the event.
   */
  function simulateEvent(type, config) {
    let evt;

    // PhantomJS <2.0.0 throws an error for the `new Event` call, so we need to supply an
    // alternative form of creating an event just for PhantomJS
    // @see https://github.com/ariya/phantomjs/issues/11289#issuecomment-38880333
    try {
      evt = new Event(type);
    } catch (e) {
      evt = document.createEvent('Event');
      evt.initEvent(type, true, false);
    }

    config = config || {};
    for (let prop in config) {
      evt[prop] = config[prop];
    }

    window.dispatchEvent(evt);

    return evt;
  }

  // simulate gamepad object
  let gamepads = [];
  let gamepadStub = sinon.stub(navigator, 'getGamepads').returns(gamepads);

  function createGamepad(index) {
    let gamepad = {
      connected: true,
      buttons: [],
      axes: [0, 0, 0, 0]
    };
    for (let i = 0; i < 16; i++) {
      gamepad.buttons[i] = { pressed: false };
    }

    if (index) {
      gamepads[index] = gamepad;
    } else {
      gamepads.push(gamepad);
    }
  }

  beforeEach(() => {
    // reset pressed buttons before each test
    simulateEvent('blur');

    // start with 1 gamepad connected
    gamepads.length = 0;
    createGamepad();
  });

  after(() => {
    gamepadStub.restore();
  });

  it('should export api', () => {
    expect(keyboard.gamepadMap).to.be.an('object');
    expect(keyboard.updateGamepad).to.be.an('function');
    expect(keyboard.initGamepad).to.be.an('function');
    expect(keyboard.onGamepad).to.be.an('function');
    expect(keyboard.offGamepad).to.be.an('function');
    expect(keyboard.gamepadPressed).to.be.an('function');
    expect(keyboard.gamepadAxis).to.be.an('function');
  });

  // --------------------------------------------------
  // initGamepad
  // --------------------------------------------------
  describe('initGamepad', () => {
    it('should add event listeners', () => {
      let spy = sinon.spy(window, 'addEventListener');

      keyboard.initGamepad();

      expect(spy.calledWith('gamepadconnected')).to.be.true;
      expect(spy.calledWith('gamepaddisconnected')).to.be.true;
      expect(spy.calledWith('blur')).to.be.true;
      expect(eventCallbacks.tick.length).to.equal(1);

      spy.restore();
    });
  });

  // --------------------------------------------------
  // pressed
  // --------------------------------------------------
  //   describe('pressed', () => {
  //     it('should return false when a key is not pressed', () => {
  //       expect(keyboard.keyPressed('a')).to.be.false;
  //       expect(keyboard.keyPressed('f1')).to.be.false;
  //       expect(keyboard.keyPressed('numpad0')).to.be.false;
  //     });

  //     it('should return true for a single key', () => {
  //       simulateEvent('keydown', { code: 'KeyA' });

  //       expect(keyboard.keyPressed('a')).to.be.true;
  //     });

  //     it('should return false if the key is no longer pressed', () => {
  //       simulateEvent('keydown', { code: 'KeyA' });
  //       simulateEvent('keyup', { code: 'KeyA' });

  //       expect(keyboard.keyPressed('a')).to.be.false;
  //     });
  //   });

  //   // --------------------------------------------------
  //   // bind
  //   // --------------------------------------------------
  //   describe('bind', () => {
  //     // Defaults to keydown
  //     describe('handler=keydown', () => {
  //       it('should call the callback when a single key combination is pressed', done => {
  //         keyboard.bindKeys('a', evt => {
  //           done();
  //         });

  //         simulateEvent('keydown', { code: 'KeyA' });
  //       });

  //       it('should accept an array of key combinations to bind', done => {
  //         keyboard.bindKeys(['a', 'b'], evt => {
  //           done();
  //         });

  //         simulateEvent('keydown', { code: 'KeyB' });
  //       });
  //     });

  //     describe('handler=keyup', () => {
  //       const handler = 'keyup';

  //       it('should call the callback when a single key combination is pressed', done => {
  //         keyboard.bindKeys(
  //           'a',
  //           evt => {
  //             done();
  //           },
  //           { handler }
  //         );

  //         simulateEvent('keyup', { code: 'KeyA' });
  //       });

  //       it('should accept an array of key combinations to bind', done => {
  //         keyboard.bindKeys(
  //           ['a', 'b'],
  //           evt => {
  //             done();
  //           },
  //           { handler }
  //         );

  //         simulateEvent('keyup', { code: 'KeyB' });
  //       });
  //     });

  //     describe('preventDefault=true', () => {
  //       it('should call preventDefault on the event', done => {
  //         keyboard.initGamepad();
  //         let spy;

  //         keyboard.bindKeys('a', evt => {
  //           expect(spy.called).to.be.true;
  //           done();
  //         });

  //         let event = simulateEvent('keydown', { code: 'KeyA' }, true);
  //         spy = sinon.spy(event, 'preventDefault');
  //       });
  //     });

  //     describe('preventDefault=false', () => {
  //       it('should not call preventDefault on the event', done => {
  //         keyboard.bindKeys(
  //           'a',
  //           evt => {
  //             expect(evt.defaultPrevented).to.be.false;
  //             done();
  //           },
  //           { preventDefault: false }
  //         );

  //         simulateEvent('keydown', { code: 'KeyA' });
  //       });
  //     });
  //   });

  //   // --------------------------------------------------
  //   // unbind
  //   // --------------------------------------------------
  //   describe('unbind', () => {
  //     // Defaults to keydown
  //     describe('handler=keydown', () => {
  //       it('should not call the callback when the combination has been unbound', () => {
  //         keyboard.bindKeys('a', () => {
  //           // this should never be called since the key combination was unbound
  //           expect(false).to.be.true;
  //         });

  //         keyboard.unbindKeys('a');

  //         simulateEvent('keydown', { which: 65 });
  //       });

  //       it('should accept an array of key combinations to unbind', () => {
  //         keyboard.bindKeys(['a', 'b'], () => {
  //           // this should never be called since the key combination was unbound
  //           expect(false).to.be.true;
  //         });

  //         keyboard.unbindKeys(['a', 'b']);

  //         simulateEvent('keydown', { which: 65 });
  //         simulateEvent('keydown', { which: 66 });
  //       });
  //     });

  //     describe('handler=keyup', () => {
  //       const handler = 'keyup';

  //       it('should not call the callback when the combination has been unbound', () => {
  //         keyboard.bindKeys(
  //           'a',
  //           () => {
  //             // this should never be called since the key combination was unbound
  //             expect(false).to.be.true;
  //           },
  //           handler
  //         );

  //         keyboard.unbindKeys('a');

  //         simulateEvent('keyup', { which: 65 });
  //       });

  //       it('should accept an array of key combinations to unbind', () => {
  //         keyboard.bindKeys(
  //           ['a', 'b'],
  //           () => {
  //             // this should never be called since the key combination was unbound
  //             expect(false).to.be.true;
  //           },
  //           handler
  //         );

  //         keyboard.unbindKeys(['a', 'b']);

  //         simulateEvent('keyup', { which: 65 });
  //         simulateEvent('keyup', { which: 66 });
  //       });
  //     });
  //   });
});
