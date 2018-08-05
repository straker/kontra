// --------------------------------------------------
// kontra.pointer
// --------------------------------------------------
describe('kontra.pointer', function() {
  var object;
  var canvas = document.createElement('canvas');

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
    var evt;

    // PhantomJS <2.0.0 throws an error for the `new Event` call, so we need to supply an
    // alternative form of creating an event just for PhantomJS
    // @see https://github.com/ariya/phantomjs/issues/11289#issuecomment-38880333
    try {
      evt = new Event(type, {bubbles: true});
    } catch(e) {
      evt = document.createEvent('Event');
      evt.initEvent(type, true, false);
    }

    var config = config || {};
    for (var prop in config) {
      evt[prop] = config[prop];
    }

    canvas.dispatchEvent(evt);
  }

  // reset pressed buttons before each test
  beforeEach(function() {
    simulateEvent('blur');

    // set up and take down the canvas before each test so it doesn't leak
    // the canvas element for the kontra.core.init tests
    kontra.canvas = canvas;
    document.body.appendChild(canvas);

    object = {
      x: 100,
      y: 50,
      width: 10,
      height: 20,
      render: sinon.spy()
    };
    kontra.pointer.track(object);
    object.render();
    kontra._tick();
  });

  afterEach(function() {
    kontra.pointer.untrack(object);
    canvas.remove();
  });





  // --------------------------------------------------
  // kontra.pointer.pressed
  // --------------------------------------------------
  describe('pressed', function() {

    it('should return false when a button is not pressed', function() {
      expect(kontra.pointer.pressed('left')).to.be.not.ok;
      expect(kontra.pointer.pressed('middle')).to.be.not.ok;
      expect(kontra.pointer.pressed('right')).to.be.not.ok;
    });

    it('should return true for a button', function() {
      simulateEvent('mousedown', {button: 1});

      expect(kontra.pointer.pressed('middle')).to.be.true;
    });

    it('should return false if the button is no longer pressed', function() {
      simulateEvent('mousedown', {button: 2});
      simulateEvent('mouseup', {button: 2});

      expect(kontra.pointer.pressed('right')).to.be.not.ok;
    });

  });





  // --------------------------------------------------
  // kontra.pointer.track
  // --------------------------------------------------
  describe('track', function() {

    it('should override the objects render function to track render order', function() {
      var obj = { render: kontra._noop };
      kontra.pointer.track(obj);

      expect(obj.render).to.not.equal(kontra._noop);
      expect(obj._r).to.exist;
    });

    it('should take multiple objects', function() {
      var obj = { render: kontra._noop };
      var obj2 = { render: kontra._noop };
      kontra.pointer.track([obj, obj2]);

      expect(obj.render).to.not.equal(kontra._noop);
      expect(obj._r).to.exist;
      expect(obj2.render).to.not.equal(kontra._noop);
      expect(obj2._r).to.exist;
    });

    it('should call the objects original render function', function() {
      var render = sinon.spy();
      var obj = { render: render };
      kontra.pointer.track(obj);
      obj.render();

      expect(render.called).to.be.ok;
    });

    it('should do nothing if the object is already tracked', function() {
      var obj = { render: kontra._noop };
      var render;

      function func() {
        kontra.pointer.track(obj);

        render = obj._r;

        kontra.pointer.track(obj);
      }

      expect(render).to.equal(obj._r);
      expect(func).to.not.throw();
    });

  });





  // --------------------------------------------------
  // kontra.pointer.untrack
  // --------------------------------------------------
  describe('untrack', function() {

    it('should restore the objects original render function', function() {
      var obj = { render: kontra._noop };
      kontra.pointer.track(obj);
      kontra.pointer.untrack(obj);

      expect(obj.render).to.equal(kontra._noop);
      expect(obj._r).to.not.exist;
    });

    it('should take multiple objects', function() {
      var obj = { render: kontra._noop };
      var obj2 = { render: kontra._noop }
      kontra.pointer.track([obj, obj2]);
      kontra.pointer.untrack([obj, obj2]);

      expect(obj.render).to.equal(kontra._noop);
      expect(obj._r).to.not.exist;
      expect(obj2.render).to.equal(kontra._noop);
      expect(obj2._r).to.not.exist;
    });

    it('should do nothing if the object was never tracked', function() {
      function func() {
        kontra.pointer.untrack({foo: 1});
      }

      expect(func).to.not.throw();
    });

  });





  // --------------------------------------------------
  // kontra.pointer.over
  // --------------------------------------------------
  describe('over', function() {
    it('should return false is object is not being tracked', function() {
      expect(kontra.pointer.over()).to.equal(false);
    });

    it('should return false if the pointer is not over the object', function() {
      kontra.pointer.x = 50;
      kontra.pointer.y = 55;

      expect(kontra.pointer.over(object)).to.equal(false);
    });

    it('should return true if the pointer is over the object', function() {
      kontra.pointer.x = 105;
      kontra.pointer.y = 55;

      expect(kontra.pointer.over(object)).to.equal(true);
    });

  });





  // --------------------------------------------------
  // mousemove
  // --------------------------------------------------
  describe('mousemove', function() {

    it('should update the x and y pointer coordinates', function() {
      kontra.pointer.x = kontra.pointer.y = 0;
      simulateEvent('mousemove', {clientX: 100, clientY: 50});

      expect(kontra.pointer.x).to.equal(100);
      expect(kontra.pointer.y).to.equal(50);
    });

    it('should call the objects onOver function if it is the target', function(done) {
      object.onOver = sinon.spy();

      // the mousemove event is throttled so have to wait for it to finish
      setTimeout(function() {
        simulateEvent('mousemove', {clientX: 105, clientY: 55});

        // the mousemove event is also async
        setTimeout(function() {
          expect(object.onOver.called).to.be.ok;
          done();
        }, 50);
      });
    });

  });





  // --------------------------------------------------
  // mousedown
  // --------------------------------------------------
  describe('mousedown', function() {

    it('should update the x and y pointer coordinates', function() {
      kontra.pointer.x = kontra.pointer.y = 0;
      simulateEvent('mousedown', {clientX: 100, clientY: 50});

      expect(kontra.pointer.x).to.equal(100);
      expect(kontra.pointer.y).to.equal(50);
    });

    it('should call the onDown function', function () {
      var onDown = sinon.spy();
      kontra.pointer.onDown(onDown);
      simulateEvent('mousedown', {clientX: 100, clientY: 50});

      expect(onDown.called).to.be.ok;
    });

    it('should call the objects onDown function if it is the target', function() {
      object.onDown = sinon.spy();
      simulateEvent('mousedown', {clientX: 105, clientY: 55});

      expect(object.onDown.called).to.be.ok;
    });

  });






  // --------------------------------------------------
  // touchstart
  // --------------------------------------------------
  describe('touchstart', function() {

    it('should update the x and y pointer coordinates', function() {
      kontra.pointer.x = kontra.pointer.y = 0;
      simulateEvent('touchstart', {touches: [{clientX: 100, clientY: 50}]});

      expect(kontra.pointer.x).to.equal(100);
      expect(kontra.pointer.y).to.equal(50);
    });

    it('should call the onDown function', function () {
      var onDown = sinon.spy();
      kontra.pointer.onDown(onDown);
      simulateEvent('touchstart', {touches: [{clientX: 100, clientY: 50}]});

      expect(onDown.called).to.be.ok;
    });

    it('should call the objects onDown function if it is the target', function() {
      object.onDown = sinon.spy();
      simulateEvent('touchstart', {touches: [{clientX: 105, clientY: 55}]});

      expect(object.onDown.called).to.be.ok;
    });

  });





  // --------------------------------------------------
  // mouseup
  // --------------------------------------------------
  describe('mouseup', function() {

    it('should update the x and y pointer coordinates', function() {
      kontra.pointer.x = kontra.pointer.y = 0;
      simulateEvent('mouseup', {clientX: 100, clientY: 50});

      expect(kontra.pointer.x).to.equal(100);
      expect(kontra.pointer.y).to.equal(50);
    });

    it('should call the onUp function', function () {
      var onUp = sinon.spy();
      kontra.pointer.onUp(onUp);
      simulateEvent('mouseup', {clientX: 100, clientY: 50});

      expect(onUp.called).to.be.ok;
    });

    it('should call the objects onUp function if it is the target', function() {
      object.onUp = sinon.spy();
      simulateEvent('mouseup', {clientX: 105, clientY: 55});

      expect(object.onUp.called).to.be.ok;
    });

  });





  // --------------------------------------------------
  // touchend
  // --------------------------------------------------
  describe('touchend', function() {

    it('should update the x and y pointer coordinates', function() {
      kontra.pointer.x = kontra.pointer.y = 0;
      simulateEvent('touchend', {touches: [], changedTouches: [{clientX: 100, clientY: 50}]});

      expect(kontra.pointer.x).to.equal(100);
      expect(kontra.pointer.y).to.equal(50);
    });

    it('should call the onUp function', function () {
      var onUp = sinon.spy();
      kontra.pointer.onUp(onUp);
      simulateEvent('touchend', {touches: [], changedTouches: [{clientX: 100, clientY: 50}]});

      expect(onUp.called).to.be.ok;
    });

    it('should call the objects onUp function if it is the target', function() {
      object.onUp = sinon.spy();
      simulateEvent('touchend', {touches: [], changedTouches: [{clientX: 105, clientY: 55}]});

      expect(object.onUp.called).to.be.ok;
    });

  });





  // --------------------------------------------------
  // getCurrentObject
  // --------------------------------------------------
  describe('getCurrentObject', function() {

    it('should correctly return the object under the pointer', function() {
      var obj = {
        x: 110,
        y: 50,
        width: 10,
        height: 20,
        render: sinon.spy()
      };
      kontra.pointer.track(obj);
      kontra._tick();

      object.render();
      obj.render();
      kontra._tick();

      kontra.pointer.x = 100;
      kontra.pointer.y = 50;

      expect(kontra.pointer.over(object)).to.equal(true);

      kontra.pointer.x = 108;

      // object rendered first so obj is on top
      expect(kontra.pointer.over(obj)).to.equal(true);
    });

    it('should call the objects collidesWithPointer function', function() {
      object.collidesWithPointer = sinon.spy();
      kontra.pointer.over(object);

      expect(object.collidesWithPointer.called).to.be.ok;
    });

  });

});
