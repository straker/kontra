import * as input from '../../src/input.js';
import { getCanvas } from '../../src/core.js';
import { emit, callbacks as eventCallbacks } from '../../src/events.js';
import { keyMap } from '../../src/keyboard.js';
import { gamepadMap, updateGamepad } from '../../src/gamepad.js';
import { gestureMap } from '../../src/gesture.js';
import { getPointer, resetPointers } from '../../src/pointer.js';
import { simulateEvent, simulateGamepadEvent, createGamepad, getGamepadsStub } from '../utils.js';

// --------------------------------------------------
// input
// --------------------------------------------------
describe('input', () => {
  let gamepadStub;

  before(() => {
    gamepadStub = sinon.stub(navigator, 'getGamepads').returns(getGamepadsStub);
  });

  beforeEach(() => {
    input.initInput();
  });

  afterEach(() => {
    resetPointers();
  });

  after(() => {
    gamepadStub.restore();
  });

  it('should export api', () => {
    expect(input.initInput).to.be.an('function');
    expect(input.onInput).to.be.an('function');
    expect(input.offInput).to.be.an('function');
  });

  it('should have unique input names for each input type', () => {
    // if keyboard, gamepad, gesture, or pointer share an input name
    // it will cause problems
    let inputNames = [
      // keyboard can have non-unique keys
      ...Object.values(keyMap).filter((name, index, array) => {
        return array.indexOf(name) === index;
      }),
      ...Object.values(gamepadMap),
      ...Object.keys(gestureMap),
      ...['down', 'up']
    ];

    let isUnique = inputNames.every((name, index) => {
      return inputNames.indexOf(name) === index;
    });
    expect(isUnique).to.be.true;
  });

  // --------------------------------------------------
  // initInput
  // --------------------------------------------------
  describe('initInput', () => {
    it('should init inputs', () => {
      let windowSpy = sinon.spy(window, 'addEventListener');
      let canvasSpy = sinon.spy(getCanvas(), 'addEventListener');

      input.initInput();

      // keyboard
      expect(windowSpy.calledWith('keydown')).to.be.true;
      // gamepad
      expect(windowSpy.calledWith('gamepadconnected')).to.be.true;
      // gesture
      expect(eventCallbacks.touchChanged).to.exist;
      // pointer
      expect(canvasSpy.calledWith('mousedown')).to.be.true;

      windowSpy.restore();
      canvasSpy.restore();
    });

    it('should pass pointer options', () => {
      resetPointers();
      input.initInput({
        pointer: { radius: 10 }
      });

      expect(getPointer().radius).to.equal(10);
    });

    it('should return init objects', () => {
      let object = input.initInput();

      expect(object.pointer).to.exist;
    });
  });

  // --------------------------------------------------
  // onInput
  // --------------------------------------------------
  describe('onInput', () => {
    it('should call the callback for keyboard event', () => {
      let spy = sinon.spy();
      input.onInput('arrowleft', spy);

      simulateEvent('keydown', { code: 'ArrowLeft' });

      expect(spy.called).to.be.true;
    });

    it('should call the callback for gamepad event', () => {
      let spy = sinon.spy();
      input.onInput('south', spy);

      createGamepad();
      getGamepadsStub[0].buttons[0].pressed = true;
      updateGamepad();

      expect(spy.called).to.be.true;
    });

    it('should call the callback for gesture event', () => {
      let spy = sinon.spy();
      input.onInput('swipeleft', spy);

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

      expect(spy.called).to.be.true;
    });

    it('should call the callback for pointer event', () => {
      let spy = sinon.spy();
      input.onInput('down', spy);

      simulateEvent(
        'mousedown',
        {
          identifier: 0,
          clientX: 1000,
          clientY: 50
        },
        getCanvas()
      );

      expect(spy.called).to.be.true;
    });

    it('should accept an array of inputs', () => {
      let spy = sinon.spy();
      input.onInput(['dpadleft', 'arrowleft', 'swipeleft'], spy);

      simulateEvent('keydown', { code: 'ArrowLeft' });

      expect(spy.called).to.be.true;
    });

    it('should pass keyboard options', () => {
      let spy = sinon.spy();
      input.onInput('arrowleft', spy, {
        key: { handler: 'keyup' }
      });

      simulateEvent('keyup', { code: 'ArrowLeft' });

      expect(spy.called).to.be.true;
    });

    it('should pass gamepad options', () => {
      let spy = sinon.spy();
      input.onInput('south', spy, {
        gamepad: { handler: 'gamepadup' }
      });

      createGamepad();
      getGamepadsStub[0].buttons[0].pressed = true;
      updateGamepad();

      expect(spy.called).to.be.false;

      getGamepadsStub[0].buttons[0].pressed = false;
      updateGamepad();

      expect(spy.called).to.be.true;
    });

    it('should throw error if input name is invalid', () => {
      function fn() {
        input.onInput('foo', () => {});
      }

      expect(fn).to.throw();
    });
  });

  // --------------------------------------------------
  // offInput
  // --------------------------------------------------
  describe('offInput', () => {
    it('should not call the callback for keyboard event', () => {
      let spy = sinon.spy();
      input.onInput('arrowleft', spy);
      input.offInput('arrowleft');

      simulateEvent('keydown', { code: 'ArrowLeft' });

      expect(spy.called).to.be.false;
    });

    it('should not call the callback for gamepad event', () => {
      let spy = sinon.spy();
      input.onInput('south', spy);
      input.offInput('south');

      createGamepad();
      getGamepadsStub[0].buttons[0].pressed = true;
      updateGamepad();

      expect(spy.called).to.be.false;
    });

    it('should not call the callback for gesture event', () => {
      let spy = sinon.spy();
      input.onInput('swipeleft', spy);
      input.offInput('swipeleft');

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

      expect(spy.called).to.be.false;
    });

    it('should not call the callback for pointer event', () => {
      let spy = sinon.spy();
      input.onInput('down', spy);
      input.offInput('down');

      simulateEvent(
        'mousedown',
        {
          identifier: 0,
          clientX: 1000,
          clientY: 50
        },
        getCanvas()
      );

      expect(spy.called).to.be.false;
    });

    it('should accept an array of inputs', () => {
      let spy = sinon.spy();
      input.onInput(['dpadleft', 'arrowleft', 'swipeleft'], spy);
      input.offInput(['dpadleft', 'arrowleft']);

      simulateEvent('keydown', { code: 'ArrowLeft' });

      expect(spy.called).to.be.false;
    });

    it('should pass keyboard options', () => {
      let spy = sinon.spy();
      input.onInput('arrowleft', spy, {
        key: { handler: 'keyup' }
      });
      input.offInput('arrowleft', {
        key: { handler: 'keyup' }
      });

      simulateEvent('keyup', { code: 'ArrowLeft' });

      expect(spy.called).to.be.false;
    });

    it('should pass gamepad options', () => {
      let spy = sinon.spy();
      input.onInput('south', spy, {
        gamepad: { handler: 'gamepadup' }
      });
      input.offInput('south', {
        gamepad: { handler: 'gamepadup' }
      });

      createGamepad();
      getGamepadsStub[0].buttons[0].pressed = true;
      updateGamepad();
      getGamepadsStub[0].buttons[0].pressed = false;
      updateGamepad();

      expect(spy.called).to.be.false;
    });
  });
});
