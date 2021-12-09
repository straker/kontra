import * as gamepad from '../../src/gamepad.js';
import { callbacks as eventCallbacks } from '../../src/events.js';
import {
  simulateEvent,
  getGamepadsStub,
  createGamepad
} from '../utils.js';

// --------------------------------------------------
// gamepad
// --------------------------------------------------
describe('gamepad', () => {
  // simulate gamepad object
  let gamepadStub;

  before(() => {
    gamepadStub = sinon
      .stub(navigator, 'getGamepads')
      .returns(getGamepadsStub);
  });

  beforeEach(() => {
    gamepad.initGamepad();

    // reset pressed buttons before each test
    simulateEvent('blur');

    // start with 1 gamepad connected
    getGamepadsStub.length = 0;
    createGamepad();
  });

  after(() => {
    gamepadStub.restore();
  });

  it('should export api', () => {
    expect(gamepad.gamepadMap).to.be.an('object');
    expect(gamepad.gamepadMap).to.deep.equal({
      0: 'south',
      1: 'east',
      2: 'west',
      3: 'north',
      4: 'leftshoulder',
      5: 'rightshoulder',
      6: 'lefttrigger',
      7: 'righttrigger',
      8: 'select',
      9: 'start',
      10: 'leftstick',
      11: 'rightstick',
      12: 'dpadup',
      13: 'dpaddown',
      14: 'dpadleft',
      15: 'dpadright'
    });

    expect(gamepad.updateGamepad).to.be.an('function');
    expect(gamepad.initGamepad).to.be.an('function');
    expect(gamepad.onGamepad).to.be.an('function');
    expect(gamepad.offGamepad).to.be.an('function');
    expect(gamepad.gamepadPressed).to.be.an('function');
    expect(gamepad.gamepadAxis).to.be.an('function');
  });

  // --------------------------------------------------
  // initGamepad
  // --------------------------------------------------
  describe('initGamepad', () => {
    it('should add event listeners', () => {
      let num = eventCallbacks.tick?.length || 0;
      let spy = sinon.spy(window, 'addEventListener');

      gamepad.initGamepad();

      expect(spy.calledWith('gamepadconnected')).to.be.true;
      expect(spy.calledWith('gamepaddisconnected')).to.be.true;
      expect(spy.calledWith('blur')).to.be.true;
      expect(eventCallbacks.tick.length).to.equal(num + 1);

      spy.restore();
    });
  });

  // --------------------------------------------------
  // onGamepad
  // --------------------------------------------------
  describe('onGamepad', () => {
    describe('handler=gamepaddown', () => {
      it('should call the callback when a button is pressed', () => {
        let spy = sinon.spy();
        gamepad.onGamepad('south', spy);

        getGamepadsStub[0].buttons[0].pressed = true;
        gamepad.updateGamepad();

        expect(
          spy.calledWith(
            getGamepadsStub[0],
            getGamepadsStub[0].buttons[0]
          )
        ).to.be.true;
      });

      it('should accept an array of buttons', () => {
        let spy = sinon.spy();
        gamepad.onGamepad(['south', 'north'], spy);

        getGamepadsStub[0].buttons[0].pressed = true;
        gamepad.updateGamepad();

        expect(
          spy.calledWith(
            getGamepadsStub[0],
            getGamepadsStub[0].buttons[0]
          )
        ).to.be.true;
      });

      it('should accept a gamepad index', () => {
        createGamepad();

        let spy = sinon.spy();
        gamepad.onGamepad('south', spy, { gamepad: 1 });

        getGamepadsStub[1].buttons[0].pressed = true;
        gamepad.updateGamepad();

        expect(
          spy.calledWith(
            getGamepadsStub[1],
            getGamepadsStub[1].buttons[0]
          )
        ).to.be.true;
      });

      it('should allow global and specific callback', () => {
        let globalSpy = sinon.spy();
        let gamepadSpy = sinon.spy();
        gamepad.onGamepad('south', globalSpy);
        gamepad.onGamepad('south', gamepadSpy, { gamepad: 0 });

        getGamepadsStub[0].buttons[0].pressed = true;
        gamepad.updateGamepad();

        expect(globalSpy.called).to.be.true;
        expect(gamepadSpy.called).to.be.true;
      });

      it('should not throw error if gamepad is not connected', () => {
        function fn() {
          gamepad.onGamepad('south', sinon.spy(), { gamepad: 1 });
        }

        expect(fn).to.not.throw();
      });

      describe('multiple controllers', () => {
        it('should call the global callback if any gamepad pressed the button', () => {
          createGamepad();
          createGamepad();
          createGamepad();

          let spy = sinon.spy();
          gamepad.onGamepad('north', spy);

          getGamepadsStub[3].buttons[3].pressed = true;
          gamepad.updateGamepad();

          expect(
            spy.calledWith(
              getGamepadsStub[3],
              getGamepadsStub[3].buttons[3]
            )
          ).to.be.true;
        });

        it('should not call gamepad callback if the gamepad did not press the button', () => {
          createGamepad();
          createGamepad();
          createGamepad();

          let spy = sinon.spy();
          gamepad.onGamepad('north', spy, { gamepad: 1 });

          getGamepadsStub[3].buttons[3].pressed = true;
          gamepad.updateGamepad();

          expect(spy.called).to.be.false;
        });
      });
    });

    describe('handler=gamepadup', () => {
      it('should call the callback when a button is released', () => {
        let spy = sinon.spy();
        gamepad.onGamepad('south', spy, { handler: 'gamepadup' });

        getGamepadsStub[0].buttons[0].pressed = true;
        gamepad.updateGamepad();

        expect(spy.called).to.be.false;

        getGamepadsStub[0].buttons[0].pressed = false;
        gamepad.updateGamepad();

        expect(
          spy.calledWith(
            getGamepadsStub[0],
            getGamepadsStub[0].buttons[0]
          )
        ).to.be.true;
      });

      it('should accept an array of buttons', () => {
        let spy = sinon.spy();
        gamepad.onGamepad(['south', 'north'], spy, {
          handler: 'gamepadup'
        });

        getGamepadsStub[0].buttons[0].pressed = true;
        gamepad.updateGamepad();

        expect(spy.called).to.be.false;

        getGamepadsStub[0].buttons[0].pressed = false;
        gamepad.updateGamepad();

        expect(
          spy.calledWith(
            getGamepadsStub[0],
            getGamepadsStub[0].buttons[0]
          )
        ).to.be.true;
      });

      it('should accept a gamepad index', () => {
        createGamepad();

        let spy = sinon.spy();
        gamepad.onGamepad('south', spy, {
          handler: 'gamepadup',
          gamepad: 1
        });

        getGamepadsStub[1].buttons[0].pressed = true;
        gamepad.updateGamepad();
        getGamepadsStub[1].buttons[0].pressed = false;
        gamepad.updateGamepad();

        expect(
          spy.calledWith(
            getGamepadsStub[1],
            getGamepadsStub[1].buttons[0]
          )
        ).to.be.true;
      });

      it('should allow global and specific callback', () => {
        let globalSpy = sinon.spy();
        let gamepadSpy = sinon.spy();
        gamepad.onGamepad('south', globalSpy, {
          handler: 'gamepadup'
        });
        gamepad.onGamepad('south', gamepadSpy, {
          handler: 'gamepadup',
          gamepad: 0
        });

        getGamepadsStub[0].buttons[0].pressed = true;
        gamepad.updateGamepad();
        getGamepadsStub[0].buttons[0].pressed = false;
        gamepad.updateGamepad();

        expect(globalSpy.called).to.be.true;
        expect(gamepadSpy.called).to.be.true;
      });

      it('should not throw error if gamepad is not connected', () => {
        function fn() {
          gamepad.onGamepad('south', sinon.spy(), {
            handler: 'gamepadup',
            gamepad: 1
          });
        }

        expect(fn).to.not.throw();
      });
    });
  });

  // --------------------------------------------------
  // offGamepad
  // --------------------------------------------------
  describe('offGamepad', () => {
    describe('handler=gamepaddown', () => {
      it('should not call the callback when a button is pressed', () => {
        let spy = sinon.spy();
        gamepad.onGamepad('south', spy);
        gamepad.offGamepad('south');

        getGamepadsStub[0].buttons[0].pressed = true;
        gamepad.updateGamepad();

        expect(spy.called).to.be.false;
      });

      it('should accept an array of buttons', () => {
        let spy = sinon.spy();
        gamepad.onGamepad('south', spy);
        gamepad.offGamepad(['south', 'north'], spy);

        getGamepadsStub[0].buttons[0].pressed = true;
        gamepad.updateGamepad();

        expect(spy.called).to.be.false;
      });

      it('should accept a gamepad index', () => {
        createGamepad();

        let spy = sinon.spy();
        gamepad.onGamepad('south', spy, { gamepad: 1 });
        gamepad.offGamepad('south', { gamepad: 1 });

        getGamepadsStub[1].buttons[0].pressed = true;
        gamepad.updateGamepad();

        expect(spy.called).to.be.false;
      });

      it('should allow global and specific callback', () => {
        let globalSpy = sinon.spy();
        let gamepadSpy = sinon.spy();
        gamepad.onGamepad('south', globalSpy);
        gamepad.onGamepad('south', gamepadSpy, { gamepad: 0 });

        gamepad.offGamepad('south');
        gamepad.offGamepad('south', { gamepad: 0 });

        getGamepadsStub[0].buttons[0].pressed = true;
        gamepad.updateGamepad();

        expect(globalSpy.called).to.be.false;
        expect(gamepadSpy.called).to.be.false;
      });

      it('should not throw error if gamepad is not connected', () => {
        function fn() {
          gamepad.offGamepad('south', { gamepad: 1 });
        }

        expect(fn).to.not.throw();
      });
    });

    describe('handler=gamepadup', () => {
      it('should not call the callback when a button is released', () => {
        let spy = sinon.spy();
        gamepad.onGamepad('south', spy, { handler: 'gamepadup' });
        gamepad.offGamepad('south', { handler: 'gamepadup' });

        getGamepadsStub[0].buttons[0].pressed = true;
        gamepad.updateGamepad();
        getGamepadsStub[0].buttons[0].pressed = false;
        gamepad.updateGamepad();

        expect(spy.called).to.be.false;
      });

      it('should accept an array of buttons', () => {
        let spy = sinon.spy();
        gamepad.onGamepad('south', spy, { handler: 'gamepadup' });
        gamepad.offGamepad(['south', 'north'], {
          handler: 'gamepadup'
        });

        getGamepadsStub[0].buttons[0].pressed = true;
        gamepad.updateGamepad();
        getGamepadsStub[0].buttons[0].pressed = false;
        gamepad.updateGamepad();

        expect(spy.called).to.be.false;
      });

      it('should accept a gamepad index', () => {
        createGamepad();

        let spy = sinon.spy();
        gamepad.onGamepad('south', spy, {
          handler: 'gamepadup',
          gamepad: 1
        });
        gamepad.offGamepad('south', {
          handler: 'gamepadup',
          gamepad: 1
        });

        getGamepadsStub[1].buttons[0].pressed = true;
        gamepad.updateGamepad();
        getGamepadsStub[1].buttons[0].pressed = false;
        gamepad.updateGamepad();

        expect(spy.called).to.be.false;
      });

      it('should allow global and specific callback', () => {
        let globalSpy = sinon.spy();
        let gamepadSpy = sinon.spy();
        gamepad.onGamepad('south', globalSpy, {
          handler: 'gamepadup'
        });
        gamepad.onGamepad('south', gamepadSpy, {
          handler: 'gamepadup',
          gamepad: 0
        });

        gamepad.offGamepad('south', { handler: 'gamepadup' });
        gamepad.offGamepad('south', {
          handler: 'gamepadup',
          gamepad: 0
        });

        getGamepadsStub[0].buttons[0].pressed = true;
        gamepad.updateGamepad();
        getGamepadsStub[0].buttons[0].pressed = false;
        gamepad.updateGamepad();

        expect(globalSpy.called).to.be.false;
        expect(gamepadSpy.called).to.be.false;
      });

      it('should not throw error if gamepad is not connected', () => {
        function fn() {
          gamepad.offGamepad('south', {
            handler: 'gamepadup',
            gamepad: 1
          });
        }

        expect(fn).to.not.throw();
      });
    });
  });

  // --------------------------------------------------
  // gampadPressed
  // --------------------------------------------------
  describe('gamepadPressed', () => {
    it('should return false if button is not pressed', () => {
      expect(gamepad.gamepadPressed('south')).to.be.false;
    });

    it('should return true if button is pressed', () => {
      getGamepadsStub[0].buttons[10].pressed = true;
      gamepad.updateGamepad();

      expect(gamepad.gamepadPressed('leftstick')).to.be.true;
    });

    it('should return false if button is released', () => {
      getGamepadsStub[0].buttons[10].pressed = true;
      gamepad.updateGamepad();
      getGamepadsStub[0].buttons[10].pressed = false;
      gamepad.updateGamepad();

      expect(gamepad.gamepadPressed('leftstick')).to.be.false;
    });

    it('should allow gamepad index', () => {
      createGamepad();

      getGamepadsStub[1].buttons[0].pressed = true;
      gamepad.updateGamepad();

      expect(gamepad.gamepadPressed('south', { gamepad: 1 })).to.be
        .true;
    });

    it('should return true if any gamepad has button pressed', () => {
      createGamepad();

      getGamepadsStub[1].buttons[0].pressed = true;
      gamepad.updateGamepad();

      expect(gamepad.gamepadPressed('south')).to.be.true;
    });

    it('should return false if gamepad is not connected', () => {
      expect(gamepad.gamepadPressed('south', { gamepad: 1 })).to.be
        .false;
    });
  });

  // --------------------------------------------------
  // gamepadAxis
  // --------------------------------------------------
  describe('gamepadAxis', () => {
    it('should return the value of the gamepad axis', () => {
      getGamepadsStub[0].axes[0] = 1;
      gamepad.updateGamepad();

      expect(gamepad.gamepadAxis('leftstickx', 0)).to.equal(1);
    });

    it('should return 0 by default', () => {
      expect(gamepad.gamepadAxis('leftstickx', 0)).to.equal(0);
    });

    it('should not throw error if gamepad is not connected', () => {
      function fn() {
        gamepad.gamepadAxis('leftstickx', 1);
      }

      expect(fn).to.not.throw();
    });
  });

  // --------------------------------------------------
  // updateGamepad
  // --------------------------------------------------
  describe('updateGamepad', () => {
    it('should fire gamepaddown if button was pressed', () => {
      let spy = sinon.spy();
      gamepad.onGamepad('south', spy);

      getGamepadsStub[0].buttons[0].pressed = true;
      gamepad.updateGamepad();

      expect(spy.called).to.be.true;
    });

    it('should not fire gamepaddown if button was pressed already', () => {
      getGamepadsStub[0].buttons[0].pressed = true;
      gamepad.updateGamepad();

      let spy = sinon.spy();
      gamepad.onGamepad('south', spy);

      getGamepadsStub[0].buttons[0].pressed = true;
      gamepad.updateGamepad();

      expect(spy.called).to.be.false;
    });

    it('should fire gamepadup if button was released', () => {
      getGamepadsStub[0].buttons[0].pressed = true;
      gamepad.updateGamepad();

      let spy = sinon.spy();
      gamepad.onGamepad('south', spy, { handler: 'gamepadup' });

      getGamepadsStub[0].buttons[0].pressed = false;
      gamepad.updateGamepad();

      expect(spy.called).to.be.true;
    });

    it('should not fire gamepadup if button was released already', () => {
      getGamepadsStub[0].buttons[0].pressed = false;
      gamepad.updateGamepad();

      let spy = sinon.spy();
      gamepad.onGamepad('south', spy, { handler: 'gamepadup' });

      getGamepadsStub[0].buttons[0].pressed = false;
      gamepad.updateGamepad();

      expect(spy.called).to.be.false;
    });

    it('should set gamepad axes state', () => {
      getGamepadsStub[0].axes[0] = 1;
      getGamepadsStub[0].axes[1] = 2;
      getGamepadsStub[0].axes[2] = 3;
      getGamepadsStub[0].axes[3] = 4;
      gamepad.updateGamepad();

      expect(gamepad.gamepadAxis('leftstickx', 0)).to.equal(1);
      expect(gamepad.gamepadAxis('leftsticky', 0)).to.equal(2);
      expect(gamepad.gamepadAxis('rightstickx', 0)).to.equal(3);
      expect(gamepad.gamepadAxis('rightsticky', 0)).to.equal(4);
    });
  });
});
