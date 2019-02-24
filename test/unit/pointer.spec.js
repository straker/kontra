import kontra from '../../src/core.js'
import pointer from '../../src/pointer.js'

// --------------------------------------------------
// pointer
// --------------------------------------------------
describe('pointer', () => {
  let object;
  let canvas = document.createElement('canvas');

  // reset canvas offsets
  canvas.style.position = 'absolute';
  canvas.style.top = 0;
  canvas.style.left = 0;

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

  // reset pressed buttons before each test
  beforeEach(() => {
    simulateEvent('blur');

    // set up and take down the canvas before each test so it doesn't leak
    // the canvas element for the kontra.core.init tests
    kontra.canvas = canvas;
    kontra.emit('init');
    document.body.appendChild(canvas);

    object = {
      x: 100,
      y: 50,
      width: 10,
      height: 20,
      render: sinon.spy()
    };
    pointer.track(object);
    object.render();
    kontra.emit('tick');
  });

  afterEach(() => {
    pointer.untrack(object);
    canvas.remove();
  });





  // --------------------------------------------------
  // pointer.pressed
  // --------------------------------------------------
  describe('pressed', () => {

    it('should return false when a button is not pressed', () => {
      expect(pointer.pressed('left')).to.be.not.ok;
      expect(pointer.pressed('middle')).to.be.not.ok;
      expect(pointer.pressed('right')).to.be.not.ok;
    });

    it('should return true for a button', () => {
      simulateEvent('mousedown', {button: 1});

      expect(pointer.pressed('middle')).to.be.true;
    });

    it('should return false if the button is no longer pressed', () => {
      simulateEvent('mousedown', {button: 2});
      simulateEvent('mouseup', {button: 2});

      expect(pointer.pressed('right')).to.be.not.ok;
    });

    it('should return true for touchstart', () => {
      simulateEvent('touchstart', {touches: [{clientX: 100, clientY: 50}]});

      expect(pointer.pressed('left')).to.be.true;
    });

    it('should return false for a touchend', () => {
      simulateEvent('touchstart', {touches: [{clientX: 100, clientY: 50}]});
      simulateEvent('touchend', {touches: [{clientX: 100, clientY: 50}]});

      expect(pointer.pressed('left')).to.be.not.ok;
    });

  });





  // --------------------------------------------------
  // pointer.track
  // --------------------------------------------------
  describe('track', () => {

    it('should override the objects render function to track render order', () => {
      let obj = { render: kontra._noop };
      pointer.track(obj);

      expect(obj.render).to.not.equal(kontra._noop);
      expect(obj._r).to.exist;
    });

    it('should take multiple objects', () => {
      let obj = { render: kontra._noop };
      let obj2 = { render: kontra._noop };
      pointer.track([obj, obj2]);

      expect(obj.render).to.not.equal(kontra._noop);
      expect(obj._r).to.exist;
      expect(obj2.render).to.not.equal(kontra._noop);
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
      let obj = { render: kontra._noop };
      let render;

      function func() {
        pointer.track(obj);

        render = obj._r;

        pointer.track(obj);
      }

      expect(render).to.equal(obj._r);
      expect(func).to.not.throw();
    });

  });





  // --------------------------------------------------
  // pointer.untrack
  // --------------------------------------------------
  describe('untrack', () => {

    it('should restore the objects original render function', () => {
      let obj = { render: kontra._noop };
      pointer.track(obj);
      pointer.untrack(obj);

      expect(obj.render).to.equal(kontra._noop);
      expect(obj._r).to.not.exist;
    });

    it('should take multiple objects', () => {
      let obj = { render: kontra._noop };
      let obj2 = { render: kontra._noop }
      pointer.track([obj, obj2]);
      pointer.untrack([obj, obj2]);

      expect(obj.render).to.equal(kontra._noop);
      expect(obj._r).to.not.exist;
      expect(obj2.render).to.equal(kontra._noop);
      expect(obj2._r).to.not.exist;
    });

    it('should do nothing if the object was never tracked', () => {
      function func() {
        pointer.untrack({foo: 1});
      }

      expect(func).to.not.throw();
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
      kontra.emit('tick');

      object.render();
      obj.render();
      kontra.emit('tick');

      pointer.x = 100;
      pointer.y = 50;

      expect(pointer.over(object)).to.equal(true);

      pointer.x = 108;

      // object rendered first so obj is on top
      expect(pointer.over(obj)).to.equal(true);
    });

    it('should take into account object anchor', () => {
      object.anchor = {
        x: 0.5,
        y: 0.5
      };

      pointer.x = 95;
      pointer.y = 55;

      expect(pointer.over(object)).to.equal(true);
    });

    it('should call the objects collidesWithPointer function', () => {
      object.collidesWithPointer = sinon.spy();
      pointer.over(object);

      expect(object.collidesWithPointer.called).to.be.ok;
    });

  });





  // --------------------------------------------------
  // pointer.over
  // --------------------------------------------------
  describe('over', () => {
    it('should return false is object is not being tracked', () => {
      expect(pointer.over()).to.equal(false);
    });

    it('should return false if the pointer is not over the object', () => {
      pointer.x = 50;
      pointer.y = 55;

      expect(pointer.over(object)).to.equal(false);
    });

    it('should return true if the pointer is over the object', () => {
      pointer.x = 105;
      pointer.y = 55;

      expect(pointer.over(object)).to.equal(true);
    });

  });





  // --------------------------------------------------
  // mousemove
  // --------------------------------------------------
  describe('mousemove', () => {

    it('should update the x and y pointer coordinates', () => {
      pointer.x = pointer.y = 0;
      simulateEvent('mousemove', {clientX: 100, clientY: 50});

      expect(pointer.x).to.equal(100);
      expect(pointer.y).to.equal(50);
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
      pointer.x = pointer.y = 0;
      simulateEvent('mousedown', {clientX: 100, clientY: 50});

      expect(pointer.x).to.equal(100);
      expect(pointer.y).to.equal(50);
    });

    it('should call the onDown function', () => {
      let onDown = sinon.spy();
      pointer.onDown(onDown);
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
      pointer.x = pointer.y = 0;
      simulateEvent('touchstart', {touches: [{clientX: 100, clientY: 50}]});

      expect(pointer.x).to.equal(100);
      expect(pointer.y).to.equal(50);
    });

    it('should call the onDown function', () => {
      let onDown = sinon.spy();
      pointer.onDown(onDown);
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
      pointer.x = pointer.y = 0;
      simulateEvent('mouseup', {clientX: 100, clientY: 50});

      expect(pointer.x).to.equal(100);
      expect(pointer.y).to.equal(50);
    });

    it('should call the onUp function', () => {
      let onUp = sinon.spy();
      pointer.onUp(onUp);
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
      pointer.x = pointer.y = 0;
      simulateEvent('touchend', {touches: [], changedTouches: [{clientX: 100, clientY: 50}]});

      expect(pointer.x).to.equal(100);
      expect(pointer.y).to.equal(50);
    });

    it('should call the onUp function', () => {
      let onUp = sinon.spy();
      pointer.onUp(onUp);
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
