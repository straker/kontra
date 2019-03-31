import * as pointer from '../../src/pointer.js'
import { init, getCanvas } from '../../src/core.js'
import { emit } from '../../src/events.js'
import { noop } from '../../src/utils.js'

// --------------------------------------------------
// pointer
// --------------------------------------------------
describe('pointer', () => {
  let object;
  let canvas;

  /**
   * Simulate a mouse event.
   * @param {string} type - Type of mouse event.
   * @param {object} [config] - Additional settings for the event.
   * @param {number} [config.button]
   */
  function simulateEvent(type, config) {
    let evt;

    // PhantomJS <2.0.0 throws an error for the `new Event` call, so we need to supply an
    // alternative form of creating an event just for PhantomJS
    // @see https://github.com/ariya/phantomjs/issues/11289#issuecomment-38880333
    try {
      evt = new Event(type, {bubbles: true});
    } catch(e) {
      evt = document.createEvent('Event');
      evt.initEvent(type, true, false);
    }

    config = config || {};
    for (let prop in config) {
      evt[prop] = config[prop];
    }

    canvas.dispatchEvent(evt);
  }

  before(() => {
    if (!getCanvas()) {
      canvas = document.createElement('canvas');
      init(canvas);
    }
    else {
      canvas = getCanvas();
    }

    // reset canvas offsets
    canvas.width = canvas.height = 600;
    canvas.style.position = 'absolute';
    canvas.style.top = 0;
    canvas.style.left = 0;
  });

  // reset pressed buttons before each test
  beforeEach(() => {
    document.body.appendChild(canvas);
    simulateEvent('blur');

    object = {
      x: 100,
      y: 50,
      width: 10,
      height: 20,
      render: sinon.spy()
    };
  });

  afterEach(() => {
    // make sure there's no canvas in the DOM for core tests
    canvas.remove();
    pointer.untrack(object);
  });

  it('should export api', () => {
    expect(pointer.pointer).to.be.an('object');
    expect(pointer.initPointer).to.be.an('function');
    expect(pointer.track).to.be.an('function');
    expect(pointer.untrack).to.be.an('function');
    expect(pointer.pointerOver).to.be.an('function');
    expect(pointer.onPointerDown).to.be.an('function');
    expect(pointer.onPointerUp).to.be.an('function');
    expect(pointer.pointerPressed).to.be.an('function');
  });

  // --------------------------------------------------
  // initPointer
  // --------------------------------------------------
  describe('initPointer', () => {

    it('should add event listeners', () => {
      let spy = sinon.spy(getCanvas(), 'addEventListener');

      pointer.initPointer();

      expect(spy.called).to.equal(true);

      spy.restore();
    });

  });





  // --------------------------------------------------
  // pointerPressed
  // --------------------------------------------------
  describe('pressed', () => {

    it('should return false when a button is not pressed', () => {
      expect(pointer.pointerPressed('left')).to.be.not.ok;
      expect(pointer.pointerPressed('middle')).to.be.not.ok;
      expect(pointer.pointerPressed('right')).to.be.not.ok;
    });

    it('should return true for a button', () => {
      simulateEvent('mousedown', {button: 1});

      expect(pointer.pointerPressed('middle')).to.be.true;
    });

    it('should return false if the button is no longer pressed', () => {
      simulateEvent('mousedown', {button: 2});
      simulateEvent('mouseup', {button: 2});

      expect(pointer.pointerPressed('right')).to.be.not.ok;
    });

    it('should return true for touchstart', () => {
      simulateEvent('touchstart', {touches: [{clientX: 100, clientY: 50}]});

      expect(pointer.pointerPressed('left')).to.be.true;
    });

    it('should return false for a touchend', () => {
      simulateEvent('touchstart', {touches: [{clientX: 100, clientY: 50}]});
      simulateEvent('touchend', {touches: [{clientX: 100, clientY: 50}]});

      expect(pointer.pointerPressed('left')).to.be.not.ok;
    });

  });





  // --------------------------------------------------
  // track
  // --------------------------------------------------
  describe('track', () => {

    it('should override the objects render function to track render order', () => {
      let obj = { render: noop };
      pointer.track(obj);

      expect(obj.render).to.not.equal(noop);
      expect(obj._r).to.exist;
    });

    it('should take multiple objects', () => {
      let obj = { render: noop };
      let obj2 = { render: noop };
      pointer.track([obj, obj2]);

      expect(obj.render).to.not.equal(noop);
      expect(obj._r).to.exist;
      expect(obj2.render).to.not.equal(noop);
      expect(obj2._r).to.exist;
    });

    it('should call the objects original render function', () => {
      let render = sinon.spy();
      let obj = { render: render };
      pointer.track(obj);
      obj.render();

      expect(render.called).to.be.ok;
    });

    it('should do nothing if the object is already tracked', () => {
      let obj = { render: noop };
      let render;

      function func() {
        pointer.track(obj);

        render = obj._r;

        pointer.track(obj);
      }

      expect(func).to.not.throw();
      expect(render).to.equal(obj._r);
    });

  });





  // --------------------------------------------------
  // untrack
  // --------------------------------------------------
  describe('untrack', () => {

    it('should restore the objects original render function', () => {
      let obj = { render: noop };
      pointer.track(obj);
      pointer.untrack(obj);

      expect(obj.render).to.equal(noop);
      expect(obj._r).to.not.be.ok;
    });

    it('should take multiple objects', () => {
      let obj = { render: noop };
      let obj2 = { render: noop }
      pointer.track([obj, obj2]);
      pointer.untrack([obj, obj2]);

      expect(obj.render).to.equal(noop);
      expect(obj._r).to.not.be.ok;
      expect(obj2.render).to.equal(noop);
      expect(obj2._r).to.not.be.ok;
    });

    it('should do nothing if the object was never tracked', () => {
      function func() {
        pointer.untrack({foo: 1});
      }

      expect(func).to.not.throw();
    });

  });





  describe('events', () => {

    beforeEach(() => {
      pointer.track(object);
      object.render();
      emit('tick');
    });

    // --------------------------------------------------
    // pointerOver
    // --------------------------------------------------
    describe('pointerOver', () => {

      it('should return false is object is not being tracked', () => {
        expect(pointer.pointerOver()).to.equal(false);
      });

      it('should return false if the pointer is not over the object', () => {
        pointer.pointer.x = 50;
        pointer.pointer.y = 55;

        expect(pointer.pointerOver(object)).to.equal(false);
      });

      it('should return true if the pointer is over the object', () => {
        pointer.pointer.x = 105;
        pointer.pointer.y = 55;

        expect(pointer.pointerOver(object)).to.equal(true);
      });

    });





    // --------------------------------------------------
    // getCurrentObject
    // --------------------------------------------------
    describe('getCurrentObject', () => {

      it('should correctly return the object under the pointer', () => {
        let obj = {
          x: 110,
          y: 50,
          width: 10,
          height: 20,
          render: sinon.spy()
        };
        pointer.track(obj);
        emit('tick');

        object.render();
        obj.render();
        emit('tick');

        pointer.pointer.x = 100;
        pointer.pointer.y = 50;

        expect(pointer.pointerOver(object)).to.equal(true);

        pointer.pointer.x = 108;

        // object rendered first so obj is on top
        expect(pointer.pointerOver(obj)).to.equal(true);
      });

      it('should take into account object anchor', () => {
        object.anchor = {
          x: 0.5,
          y: 0.5
        };

        pointer.pointer.x = 95;
        pointer.pointer.y = 55;

        expect(pointer.pointerOver(object)).to.equal(true);
      });

      it('should call the objects collidesWithPointer function', () => {
        object.collidesWithPointer = sinon.spy();
        pointer.pointerOver(object);

        expect(object.collidesWithPointer.called).to.be.ok;
      });

    });





    // --------------------------------------------------
    // mousemove
    // --------------------------------------------------
    describe('mousemove', () => {

      it('should update the x and y pointer coordinates', () => {
        pointer.pointer.x = pointer.pointer.y = 0;
        simulateEvent('mousemove', {clientX: 100, clientY: 50});

        expect(pointer.pointer.x).to.equal(100);
        expect(pointer.pointer.y).to.equal(50);
      });

      it('should call the objects onOver function if it is the target', () => {
        object.onOver = sinon.spy();
        simulateEvent('mousemove', {clientX: 105, clientY: 55});

        expect(object.onOver.called).to.be.ok;
      });

      it('should take into account object anchor', () => {
        object.anchor = {
          x: 0.5,
          y: 0.5
        };
        object.onOver = sinon.spy();
        simulateEvent('mousemove', {clientX: 110, clientY: 55});

        expect(object.onOver.called).to.not.be.ok;

        simulateEvent('mousemove', {clientX: 95, clientY: 55});

        expect(object.onOver.called).to.be.ok;
      });

    });





    // --------------------------------------------------
    // mousedown
    // --------------------------------------------------
    describe('mousedown', () => {

      it('should update the x and y pointer coordinates', () => {
        pointer.pointer.x = pointer.pointer.y = 0;
        simulateEvent('mousedown', {clientX: 100, clientY: 50});

        expect(pointer.pointer.x).to.equal(100);
        expect(pointer.pointer.y).to.equal(50);
      });

      it('should call the onDown function', () => {
        let onDown = sinon.spy();
        pointer.onPointerDown(onDown);
        simulateEvent('mousedown', {clientX: 100, clientY: 50});

        expect(onDown.called).to.be.ok;
      });

      it('should call the objects onDown function if it is the target', () => {
        object.onDown = sinon.spy();
        simulateEvent('mousedown', {clientX: 105, clientY: 55});

        expect(object.onDown.called).to.be.ok;
      });

      it('should take into account object anchor', () => {
        object.anchor = {
          x: 0.5,
          y: 0.5
        };
        object.onDown = sinon.spy();
        simulateEvent('mousedown', {clientX: 110, clientY: 55});

        expect(object.onDown.called).to.not.be.ok;

        simulateEvent('mousedown', {clientX: 95, clientY: 55});

        expect(object.onDown.called).to.be.ok;
      });

    });






    // --------------------------------------------------
    // touchstart
    // --------------------------------------------------
    describe('touchstart', () => {

      it('should update the x and y pointer coordinates', () => {
        pointer.pointer.x = pointer.pointer.y = 0;
        simulateEvent('touchstart', {touches: [{clientX: 100, clientY: 50}]});

        expect(pointer.pointer.x).to.equal(100);
        expect(pointer.pointer.y).to.equal(50);
      });

      it('should call the onDown function', () => {
        let onDown = sinon.spy();
        pointer.onPointerDown(onDown);
        simulateEvent('touchstart', {touches: [{clientX: 100, clientY: 50}]});

        expect(onDown.called).to.be.ok;
      });

      it('should call the objects onDown function if it is the target', () => {
        object.onDown = sinon.spy();
        simulateEvent('touchstart', {touches: [{clientX: 105, clientY: 55}]});

        expect(object.onDown.called).to.be.ok;
      });

      it('should take into account object anchor', () => {
        object.anchor = {
          x: 0.5,
          y: 0.5
        };
        object.onDown = sinon.spy();
        simulateEvent('touchstart', {touches: [{clientX: 110, clientY: 55}]});

        expect(object.onDown.called).to.not.be.ok;

        simulateEvent('touchstart', {touches: [{clientX: 95, clientY: 55}]});

        expect(object.onDown.called).to.be.ok;
      });

    });





    // --------------------------------------------------
    // mouseup
    // --------------------------------------------------
    describe('mouseup', () => {

      it('should update the x and y pointer coordinates', () => {
        pointer.pointer.x = pointer.pointer.y = 0;
        simulateEvent('mouseup', {clientX: 100, clientY: 50});

        expect(pointer.pointer.x).to.equal(100);
        expect(pointer.pointer.y).to.equal(50);
      });

      it('should call the onUp function', () => {
        let onUp = sinon.spy();
        pointer.onPointerUp(onUp);
        simulateEvent('mouseup', {clientX: 100, clientY: 50});

        expect(onUp.called).to.be.ok;
      });

      it('should call the objects onUp function if it is the target', () => {
        object.onUp = sinon.spy();
        simulateEvent('mouseup', {clientX: 105, clientY: 55});

        expect(object.onUp.called).to.be.ok;
      });

      it('should take into account object anchor', () => {
        object.anchor = {
          x: 0.5,
          y: 0.5
        };
        object.onUp = sinon.spy();
        simulateEvent('mouseup', {clientX: 110, clientY: 55});

        expect(object.onUp.called).to.not.be.ok;

        simulateEvent('mouseup', {clientX: 95, clientY: 55});

        expect(object.onUp.called).to.be.ok;
      });

    });





    // --------------------------------------------------
    // touchend
    // --------------------------------------------------
    describe('touchend', () => {

      it('should update the x and y pointer coordinates', () => {
        pointer.pointer.x = pointer.pointer.y = 0;
        simulateEvent('touchend', {touches: [], changedTouches: [{clientX: 100, clientY: 50}]});

        expect(pointer.pointer.x).to.equal(100);
        expect(pointer.pointer.y).to.equal(50);
      });

      it('should call the onUp function', () => {
        let onUp = sinon.spy();
        pointer.onPointerUp(onUp);
        simulateEvent('touchend', {touches: [], changedTouches: [{clientX: 100, clientY: 50}]});

        expect(onUp.called).to.be.ok;
      });

      it('should call the objects onUp function if it is the target', () => {
        object.onUp = sinon.spy();
        simulateEvent('touchend', {touches: [], changedTouches: [{clientX: 105, clientY: 55}]});

        expect(object.onUp.called).to.be.ok;
      });

      it('should take into account object anchor', () => {
        object.anchor = {
          x: 0.5,
          y: 0.5
        };
        object.onUp = sinon.spy();
        simulateEvent('touchend', {touches: [{clientX: 110, clientY: 55}]});

        expect(object.onUp.called).to.not.be.ok;

        simulateEvent('touchend', {touches: [{clientX: 95, clientY: 55}]});

        expect(object.onUp.called).to.be.ok;
      });

    });

  });

});
