/**
 * Simulate a keyboard event.
 * @param {string} type - Type of keyboard event.
 * @param {object} [config] - Additional settings for the event.
 * @param {boolean} [config.ctrlKey=false]
 * @param {boolean} [config.shiftKey=false]
 * @param {boolean} [config.altKey=false]
 * @param {boolean} [config.metaKey=false]
 * @param {boolean} [config.keyCode=0]
 */
function simulateEvent(type, config) {
  var evt;

  // PhantomJS <2.0.0 throws an error for the `new Event` call, so we need to supply an
  // alternative form of creating an event just for PhantomJS
  // @see https://github.com/ariya/phantomjs/issues/11289#issuecomment-38880333
  try {
    evt = new Event(type);
  } catch(e) {
    evt = document.createEvent('Event');
    evt.initEvent(type, true, false);
  }

  var config = config || {};
  for (var prop in config) {
    evt[prop] = config[prop];
  }

  window.dispatchEvent(evt);
}

// --------------------------------------------------
// kontra.keys
// --------------------------------------------------
describe('', function() {

  // reset pressed keys before each test
  beforeEach(function() {
    simulateEvent('blur');
  });





  // --------------------------------------------------
  // kontra.keys.pressed
  // --------------------------------------------------
  describe('kontra.keys.pressed', function() {

    it('should return false when a key is not pressed', function() {
      expect(kontra.keys.pressed('a')).to.be.false;
      expect(kontra.keys.pressed('ctrl+c')).to.be.false;
      expect(kontra.keys.pressed('f1')).to.be.false;
      expect(kontra.keys.pressed('!')).to.be.false;
    });

    it('should return true for a single key', function() {
      simulateEvent('keydown', {keyCode: 65});

      expect(kontra.keys.pressed('a')).to.be.true;
    });

    it('should return false if the key is no longer pressed', function() {
      simulateEvent('keydown', {keyCode: 65});
      simulateEvent('keyup', {keyCode: 65});

      expect(kontra.keys.pressed('a')).to.be.false;
    });

    it('should return true for a ctrl key combination', function() {
      simulateEvent('keydown', {keyCode: 65, ctrlKey: true});

      expect(kontra.keys.pressed('ctrl+a')).to.be.true;
    });

    it('should return true for a shift key combination', function() {
      simulateEvent('keydown', {keyCode: 65, shiftKey: true});

      expect(kontra.keys.pressed('shift+a')).to.be.true;
    });

    it('should return true for an alt key combination', function() {
      simulateEvent('keydown', {keyCode: 65, altKey: true});

      expect(kontra.keys.pressed('alt+a')).to.be.true;
    });

    it('should return true for a meta key combination', function() {
      simulateEvent('keydown', {keyCode: 65, metaKey: true});

      expect(kontra.keys.pressed('meta+a')).to.be.true;
    });

    it('should return true for a complex key combination', function() {
      simulateEvent('keydown', {
        keyCode: 65,
        ctrlKey: true,
        shiftKey: true,
        altKey: true,
        metaKey: true
      });

      expect(kontra.keys.pressed('meta+ctrl+alt+shift+a')).to.be.true;
    });

    it('should normalize key combination order', function() {
      simulateEvent('keydown', {
        keyCode: 65,
        ctrlKey: true,
        shiftKey: true,
        altKey: true,
        metaKey: true
      });

      expect(kontra.keys.pressed('meta+ctrl+alt+shift+a')).to.be.true;
      expect(kontra.keys.pressed('ctrl+alt+shift+a+meta')).to.be.true;
      expect(kontra.keys.pressed('alt+shift+a+meta+ctrl')).to.be.true;
      expect(kontra.keys.pressed('shift+a+meta+ctrl+alt')).to.be.true;
      expect(kontra.keys.pressed('a+meta+ctrl+alt+shift')).to.be.true;
      expect(kontra.keys.pressed('a+shift+alt+ctrl+meta')).to.be.true;
    });

  });

  it('should handle shift keys', function() {
    simulateEvent('keydown', {keyCode: 65, shiftKey: true});
    simulateEvent('keydown', {keyCode: 49, shiftKey: true});

    expect(kontra.keys.pressed('A')).to.be.true;
    expect(kontra.keys.pressed('!')).to.be.true;
  });

  it('should handle the + key in a combination', function() {
    simulateEvent('keydown', {keyCode: 187, shiftKey: true});

    expect(kontra.keys.pressed('shift++')).to.be.true;
  });

  it('should handle e.which and e.keyCode', function() {
    simulateEvent('keydown', {which: 65});
    simulateEvent('keydown', {keyCode: 66});

    expect(kontra.keys.pressed('a')).to.be.true;
    expect(kontra.keys.pressed('b')).to.be.true;
  });

  it('should handle special key combination ctrl+ctrl', function() {
    simulateEvent('keydown', {keyCode: 17, ctrlKey: true});

    expect(kontra.keys.pressed('ctrl')).to.be.true;
  });





  // --------------------------------------------------
  // kontra.keys.bind
  // --------------------------------------------------
  describe('kontra.keys.bind', function() {

    it('should log an error if a callback is not provided', function() {
      sinon.stub(kontra, '_logError', kontra._noop);

      kontra.keys.bind('a');

      expect(kontra._logError.called).to.be.ok;

      kontra._logError.restore();
    });

    it('should call the callback when a single key combination is pressed', function(done) {
      kontra.keys.bind('a', function() {
        done();
      });

      simulateEvent('keydown', {keyCode: 65});

      // this should never be called since done() should be called in the callback
      expect(false).to.be.true;
    });

    it('should call the callback when a complex key combination is pressed', function(done) {
      kontra.keys.bind('a+shift+ctrl', function() {
        done();
      });

      simulateEvent('keydown', {keyCode: 65, shiftKey: true, ctrlKey: true});

      // this should never be called since done() should be called in the callback
      expect(false).to.be.true;
    });

    it('should accept an array of key combinations to bind', function(done) {
      kontra.keys.bind(['a', 'b'], function() {
        done();
      });

      simulateEvent('keydown', {keyCode: 66});

      // this should never be called since done() should be called in the callback
      expect(false).to.be.true;
    });

  });





  // --------------------------------------------------
  // kontra.keys.unbind
  // --------------------------------------------------
  describe('kontra.keys.unbind', function() {

    it('should not call the callback when the combination has been unbound', function() {
      kontra.keys.bind('a', function() {
        // this should never be called since the key combination was unbound
        expect(false).to.be.true;
      });

      kontra.keys.unbind('a');

      simulateEvent('keydown', {keyCode: 65});
    });

    it('should accept an array of key combinations to unbind', function() {
      kontra.keys.bind(['a', 'b'], function() {
        // this should never be called since the key combination was unbound
        expect(false).to.be.true;
      });

      kontra.keys.unbind(['a', 'b']);

      simulateEvent('keydown', {keyCode: 65});
      simulateEvent('keydown', {keyCode: 66});
    });

  });

});