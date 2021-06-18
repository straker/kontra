import * as pointer from '../../src/pointer.js'
import { getCanvas } from '../../src/core.js'
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
  function simulateEvent(type, config, elm) {
    let event;

    // PhantomJS <2.0.0 throws an error for the `new Event` call, so we need to supply an
    // alternative form of creating an event just for PhantomJS
    // @see https://github.com/ariya/phantomjs/issues/11289#issuecomment-38880333
    try {
      event = new Event(type, {bubbles: true});
    } catch(e) {
      event = document.createEvent('Event');
      event.initEvent(type, true, false);
    }

    config = config || {};
    for (let prop in config) {
      event[prop] = config[prop];
    }

    (elm || canvas).dispatchEvent(event);
  }

  // reset pressed buttons before each test
  beforeEach(() => {
    // reset canvas offsets
    canvas = getCanvas();
    canvas.width = canvas.height = 600;
    canvas.style.position = 'absolute';
    canvas.style.top = 0;
    canvas.style.left = 0;

    pointer.initPointer();

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
    pointer.resetPointers();
  });

  it('should export api', () => {
    expect(pointer.getPointer).to.be.an('function');
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

    it('should return the pointer object', () => {
      let pntr = pointer.initPointer();

      expect(pntr.x).to.exist;
      expect(pntr.y).to.exist;
      expect(pntr.radius).to.exist;
    });

    it('should allow multiple canvases', () => {
      let pntr = pointer.initPointer();

      let canvas = document.createElement('canvas');
      let otherPntr = pointer.initPointer({canvas});

      expect(pntr).to.not.equal(otherPntr);
      expect(otherPntr.canvas).to.equal(canvas);
    });

    it('should update radius', () => {
      let pntr = pointer.initPointer();
      let canvas = document.createElement('canvas');
      let otherPntr = pointer.initPointer({canvas, radius: 10});

      expect(pntr.radius).to.not.equal(otherPntr.radius);
      expect(otherPntr.radius).to.equal(10);
    });

  });





  // --------------------------------------------------
  // pointerPressed
  // --------------------------------------------------
  describe('pointerPressed', () => {

    it('should return false when a button is not pressed', () => {
      expect(pointer.pointerPressed('left')).to.be.false;
      expect(pointer.pointerPressed('middle')).to.be.false;
      expect(pointer.pointerPressed('right')).to.be.false;
    });

    it('should return true for a button', () => {
      simulateEvent('mousedown', {button: 1});

      expect(pointer.pointerPressed('middle')).to.be.true;
    });

    it('should return false if the button is no longer pressed', () => {
      simulateEvent('mousedown', {button: 2});
      simulateEvent('mouseup', {button: 2});

      expect(pointer.pointerPressed('right')).to.be.false;
    });

    it('should return true for touchstart', () => {
      simulateEvent('touchstart', {touches: [], changedTouches: [{clientX: 100, clientY: 50}]});

      expect(pointer.pointerPressed('left')).to.be.true;
    });

    it('should return false for a touchend', () => {
      simulateEvent('touchstart', {touches: [], changedTouches: [{clientX: 100, clientY: 50}]});
      simulateEvent('touchend', {
        touches: [],
        changedTouches: [{clientX: 100, clientY: 50}]
      });

      expect(pointer.pointerPressed('left')).to.be.false;
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
      pointer.track(obj, obj2);

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

      expect(render.called).to.be.true;
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

    it('should track objects separately for each canvas', () => {
      let canvas = document.createElement('canvas');
      pointer.initPointer({canvas});

      let obj1 = { render: noop };
      let obj2 = { context: { canvas } };

      pointer.track(obj1, obj2);

      let pntr1 = pointer.getPointer();
      let pntr2 = pointer.getPointer(canvas);

      expect(pntr1._o.includes(obj1)).to.be.true;
      expect(pntr1._o.includes(obj2)).to.be.false;
      expect(pntr2._o.includes(obj1)).to.be.false;
      expect(pntr2._o.includes(obj2)).to.be.true;
    });

    it('should throw error if pointer events are not setup', () => {
      function func() {
        let canvas = document.createElement('canvas');
        pointer.track({ context: { canvas } });
      }

      expect(func).to.throw();
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
      expect(obj._r).to.not.be.true;
    });

    it('should take multiple objects', () => {
      let obj = { render: noop };
      let obj2 = { render: noop }
      pointer.track(obj, obj2);
      pointer.untrack(obj, obj2);

      expect(obj.render).to.equal(noop);
      expect(obj._r).to.not.be.true;
      expect(obj2.render).to.equal(noop);
      expect(obj2._r).to.not.be.true;
    });

    it('should do nothing if the object was never tracked', () => {
      function func() {
        pointer.untrack({foo: 1});
      }

      expect(func).to.not.throw();
    });

    it('should untrack objects separately for each canvas', () => {
      let canvas = document.createElement('canvas');
      pointer.initPointer({canvas});

      let obj1 = { render: noop };
      let obj2 = { context: { canvas } };

      pointer.track(obj1, obj2);
      pointer.untrack(obj1, obj2);

      let pntr1 = pointer.getPointer();
      let pntr2 = pointer.getPointer(canvas);

      expect(pntr1._o.includes(obj1)).to.be.false;
      expect(pntr1._o.includes(obj2)).to.be.false;
      expect(pntr2._o.includes(obj1)).to.be.false;
      expect(pntr2._o.includes(obj2)).to.be.false;
    });

    it('should throw error if pointer events are not setup', () => {
      function func() {
        let canvas = document.createElement('canvas');
        pointer.untrack({ context: { canvas } });
      }

      expect(func).to.throw();
    });

  });





  describe('events', () => {

    let pntr;
    beforeEach(() => {
      pointer.track(object);
      object.render();
      emit('tick');
      pntr = pointer.getPointer();
    });

    // --------------------------------------------------
    // pointerOver
    // --------------------------------------------------
    describe('pointerOver', () => {

      it('should return false is object is not being tracked', () => {
        expect(pointer.pointerOver({})).to.equal(false);
      });

      it('should return false if the pointer is not over the object', () => {

        pntr.x = 50;
        pntr.y = 55;

        expect(pointer.pointerOver(object)).to.equal(false);
      });

      it('should return true if the pointer is over the object', () => {
        pntr.x = 105;
        pntr.y = 55;

        expect(pointer.pointerOver(object)).to.equal(true);
      });

      it('should handle objects from different canvas', () => {
        let canvas = document.createElement('canvas');
        let pntr2 = pointer.initPointer({canvas});

        let obj = {
          x: 100,
          y: 50,
          width: 10,
          height: 20,
          render: noop,
          context: { canvas }
        };
        pointer.track(obj);
        obj.render();
        emit('tick');

        pntr2.x = 105;
        pntr2.y = 55;

        expect(pointer.pointerOver(obj)).to.equal(true);
      });

      it('should throw error if pointer events are not setup', () => {
        function func() {
          let canvas = document.createElement('canvas');
          pointer.pointerOver({ context: { canvas } });
        }

        expect(func).to.throw();
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

        pntr.x = 100;
        pntr.y = 50;

        expect(pointer.pointerOver(object)).to.equal(true);

        pntr.x = 108;

        // object rendered first so obj is on top
        expect(pointer.pointerOver(obj)).to.equal(true);
      });

      it('should take into account object anchor', () => {
        object.anchor = {
          x: 0.5,
          y: 0.5
        };

        pntr.x = 95;
        pntr.y = 55;

        expect(pointer.pointerOver(object)).to.equal(true);
      });

      it('should take into account object camera', () => {
        object.sx = 5;
        object.sy = 10;

        pntr.x = 95;
        pntr.y = 55;

        expect(pointer.pointerOver(object)).to.equal(true);
      });

      it('should take into account parent object camera', () => {
        let parent = {
          sx: 5,
          sy: 10
        };
        object.parent = parent;

        pntr.x = 95;
        pntr.y = 55;

        expect(pointer.pointerOver(object)).to.equal(true);
      });

      it('should take into account all parent object camera', () => {
        let grandparent = {
          sx: 9,
          sy: 9
        };
        let parent = {
          sx: 1,
          sy: 1
        };
        object.parent = parent;
        parent.parent = grandparent;

        pntr.x = 90;
        pntr.y = 50;

        expect(pointer.pointerOver(object)).to.equal(true);
      });

      it('should call the objects collidesWithPointer function', () => {
        object.collidesWithPointer = sinon.spy();
        pointer.pointerOver(object);

        expect(object.collidesWithPointer.called).to.be.true;
      });

    });





    // --------------------------------------------------
    // mousemove
    // --------------------------------------------------
    describe('mousemove', () => {

      it('should update the x and y pointer coordinates', () => {
        pntr.x = pntr.y = 0;
        simulateEvent('mousemove', {clientX: 100, clientY: 50});

        expect(pntr.x).to.equal(100);
        expect(pntr.y).to.equal(50);
      });

      it('should take into account padding and border style', () => {
        pntr.x = pntr.y = 0;

        pointer.resetPointers();
        canvas.style.border = '32px solid';
        canvas.style.padding = '32px';
        pntr = pointer.initPointer({canvas});

        simulateEvent('mousemove', {clientX: 100, clientY: 50});

        expect(pntr.x).to.equal(36);
        expect(pntr.y).to.equal(-14);
      });

      it('should take into account transform: scale style', () => {
        pntr.x = pntr.y = 0;

        pointer.resetPointers();
        canvas.style.transform = 'scale(0.5)';
        canvas.style.transformOrigin = 'top left';
        pntr = pointer.initPointer({canvas});

        simulateEvent('mousemove', {clientX: 50, clientY: 25});

        expect(pntr.x).to.equal(100);
        expect(pntr.y).to.equal(50);
      });

      it('should take into account width style', () => {
        pntr.x = pntr.y = 0;

        pointer.resetPointers();
        canvas.style.width = canvas.width * 2 + 'px';
        pntr = pointer.initPointer({canvas});

        simulateEvent('mousemove', {clientX: 100, clientY: 50});

        expect(pntr.x).to.equal(50);
        expect(pntr.y).to.equal(25);
      });

      it('should take into account all style properties', () => {
        pntr.x = pntr.y = 0;

        pointer.resetPointers();
        canvas.style.border = '32px solid';
        canvas.style.padding = '32px';
        canvas.style.transform = 'scale(0.5)';
        canvas.style.transformOrigin = 'top left';
        canvas.style.width = canvas.width * 2 + 'px';
        pntr = pointer.initPointer({canvas});

        simulateEvent('mousemove', {clientX: 100, clientY: 50});

        expect(pntr.x).to.equal(68);
        expect(pntr.y).to.equal(18);
      });

      it('should call the objects onOver function if it is the target', () => {
        object.onOver = sinon.spy();
        simulateEvent('mousemove', {clientX: 105, clientY: 55});

        expect(object.onOver.called).to.be.true;
      });

      it('should call the objects onOut function if it is no longer the target', () => {
        object.onOut = sinon.spy();
        simulateEvent('mousemove', {clientX: 105, clientY: 55});
        simulateEvent('mousemove', {clientX: 150, clientY: 55});

        expect(object.onOut.called).to.be.true;
      });

      it('should call the objects onOut function if another object is the target', () => {
        let obj = {
          x: 150,
          y: 50,
          width: 10,
          height: 20,
          render: sinon.spy()
        };
        pointer.track(obj);
        object.render();
        obj.render();
        emit('tick');

        object.onOut = sinon.spy();
        simulateEvent('mousemove', {clientX: 105, clientY: 55});
        simulateEvent('mousemove', {clientX: 155, clientY: 55});

        expect(pointer.pointerOver(obj)).to.be.true;
        expect(object.onOut.called).to.be.true;
      });

      it('should take into account object anchor', () => {
        object.anchor = {
          x: 0.5,
          y: 0.5
        };
        object.onOver = sinon.spy();
        simulateEvent('mousemove', {clientX: 110, clientY: 55});

        expect(object.onOver.called).to.not.be.true;

        simulateEvent('mousemove', {clientX: 95, clientY: 55});

        expect(object.onOver.called).to.be.true;
      });

      it('should handle objects from different canvas', () => {
        let canvas = document.createElement('canvas');
        document.body.appendChild(canvas);
        canvas.width = canvas.height = 600;
        canvas.style.position = 'absolute';
        canvas.style.top = 0;
        canvas.style.left = 0;

        pointer.initPointer({canvas});

        let obj = {
          x: 100,
          y: 50,
          width: 10,
          height: 20,
          render: noop,
          onOver: sinon.spy(),
          context: { canvas }
        };
        pointer.track(obj);
        obj.render();
        emit('tick');

        // wrong canvas
        simulateEvent('mousemove', {clientX: 105, clientY: 55});
        expect(obj.onOver.called).to.false;

        simulateEvent('mousemove', {clientX: 105, clientY: 55}, canvas);
        expect(obj.onOver.called).to.be.true;
      });

    });





    // --------------------------------------------------
    // mousedown, mouseup, touchstart, touchend
    // --------------------------------------------------
    ['mousedown', 'mouseup', 'touchstart', 'touchend'].forEach(eventName => {
      describe(eventName, () => {
        const event = {clientX: 0, clientY: 0};
        const config = eventName.startsWith('mouse')
          ? event
          : {touches: [], changedTouches: [event]};
        const eventHandler = eventName === 'mousedown' || eventName === 'touchstart'
            ? 'onDown'
            : 'onUp';
        const pointerHandler = eventHandler === 'onDown'
          ? 'onPointerDown'
          : 'onPointerUp'

        it('should update the x and y pointer coordinates', () => {
          pntr.x = pntr.y = 0;
          event.clientX = 100;
          event.clientY = 50;
          simulateEvent(eventName, config);

          expect(pntr.x).to.equal(100);
          expect(pntr.y).to.equal(50);
        });

        it('should take into account padding and border style', () => {
          pntr.x = pntr.y = 0;

          pointer.resetPointers();
          canvas.style.border = '32px solid';
          canvas.style.padding = '32px';
          pntr = pointer.initPointer({canvas});

          event.clientX = 100;
          event.clientY = 50;
          simulateEvent(eventName, config);

          expect(pntr.x).to.equal(36);
          expect(pntr.y).to.equal(-14);
        });

        it('should take into account transform: scale style', () => {
          pntr.x = pntr.y = 0;

          pointer.resetPointers();
          canvas.style.transform = 'scale(0.5)';
          canvas.style.transformOrigin = 'top left';
          pntr = pointer.initPointer({canvas});

          event.clientX = 50;
          event.clientY = 25;
          simulateEvent(eventName, config);

          expect(pntr.x).to.equal(100);
          expect(pntr.y).to.equal(50);
        });

        it('should take into account width style', () => {
          pntr.x = pntr.y = 0;

          pointer.resetPointers();
          canvas.style.width = canvas.width * 2 + 'px';
          pntr = pointer.initPointer({canvas});

          event.clientX = 100;
          event.clientY = 50;
          simulateEvent(eventName, config);

          expect(pntr.x).to.equal(50);
          expect(pntr.y).to.equal(25);
        });

        it('should take into account all style properties', () => {
          pntr.x = pntr.y = 0;

          pointer.resetPointers();
          canvas.style.border = '32px solid';
          canvas.style.padding = '32px';
          canvas.style.transform = 'scale(0.5)';
          canvas.style.transformOrigin = 'top left';
          canvas.style.width = canvas.width * 2 + 'px';
          pntr = pointer.initPointer({canvas});

          event.clientX = 100;
          event.clientY = 50;
          simulateEvent(eventName, config);

          expect(pntr.x).to.equal(68);
          expect(pntr.y).to.equal(18);
        });

        it(`should call the ${pointerHandler} function`, () => {
          let spy = sinon.spy();
          pointer[pointerHandler](spy);
          event.clientX = 100;
          event.clientY = 50;
          simulateEvent(eventName, config);

          expect(spy.called).to.be.true;
        });

        it(`should call the objects ${eventHandler} function if it is the target`, () => {
          object[eventHandler] = sinon.spy();
          event.clientX = 105;
          event.clientY = 55;
          simulateEvent(eventName, config);

          expect(object[eventHandler].called).to.be.true;
        });

        it('should take into account object anchor', () => {
          object.anchor = {
            x: 0.5,
            y: 0.5
          };
          object[eventHandler] = sinon.spy();
          event.clientX = 110;
          event.clientY = 55;
          simulateEvent(eventName, config);

          expect(object[eventHandler].called).to.not.be.true;

          event.clientX = 95;
          event.clientY = 55;
          simulateEvent(eventName, config);

          expect(object[eventHandler].called).to.be.true;
        });

        it('should handle objects from different canvas', () => {
          let canvas = document.createElement('canvas');
          document.body.appendChild(canvas);
          canvas.width = canvas.height = 600;
          canvas.style.position = 'absolute';
          canvas.style.top = 0;
          canvas.style.left = 0;

          pointer.initPointer({canvas});

          let obj = {
            x: 100,
            y: 50,
            width: 10,
            height: 20,
            render: noop,
            [eventHandler]: sinon.spy(),
            context: { canvas }
          };
          pointer.track(obj);
          obj.render();
          emit('tick');

          // wrong canvas
          event.clientX = 105;
          event.clientY = 55;
          simulateEvent(eventName, config);
          expect(obj[eventHandler].called).to.false;

          simulateEvent(eventName, config, canvas);
          expect(obj[eventHandler].called).to.be.true;
        });

      });

    });

  });

});
