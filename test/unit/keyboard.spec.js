import keys from '../../src/keyboard.js'

// --------------------------------------------------
// keys
// --------------------------------------------------
describe('keys', () => {

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

    config = config || {};
    for (let prop in config) {
      evt[prop] = config[prop];
    }

    window.dispatchEvent(evt);
  }

  // reset pressed keys before each test
  beforeEach(() => {
    simulateEvent('blur');
  });





  // --------------------------------------------------
  // keys.pressed
  // --------------------------------------------------
  describe('pressed', () => {

    it('should return false when a key is not pressed', () => {
      expect(keys.pressed('a')).to.be.not.ok;
      expect(keys.pressed('f1')).to.be.not.ok;
      expect(keys.pressed('numpad0')).to.be.not.ok;
    });

    it('should return true for a single key', () => {
      simulateEvent('keydown', {which: 65});

      expect(keys.pressed('a')).to.be.true;
    });

    it('should return false if the key is no longer pressed', () => {
      simulateEvent('keydown', {which: 65});
      simulateEvent('keyup', {which: 65});

      expect(keys.pressed('a')).to.be.not.ok;
    });

  });





  // --------------------------------------------------
  // keys.bind
  // --------------------------------------------------
  describe('bind', () => {

    it('should call the callback when a single key combination is pressed', (done) => {
      keys.bind('a', () => {
        done();
      });

      simulateEvent('keydown', {which: 65});

      // this should never be called since done() should be called in the callback
      expect(false).to.be.true;
    });

    it('should accept an array of key combinations to bind', (done) => {
      keys.bind(['a', 'b'], () => {
        done();
      });

      simulateEvent('keydown', {which: 66});

      // this should never be called since done() should be called in the callback
      expect(false).to.be.true;
    });

  });





  // --------------------------------------------------
  // keys.unbind
  // --------------------------------------------------
  describe('unbind', () => {

    it('should not call the callback when the combination has been unbound', () => {
      keys.bind('a', () => {
        // this should never be called since the key combination was unbound
        expect(false).to.be.true;
      });

      keys.unbind('a');

      simulateEvent('keydown', {which: 65});
    });

    it('should accept an array of key combinations to unbind', () => {
      keys.bind(['a', 'b'], () => {
        // this should never be called since the key combination was unbound
        expect(false).to.be.true;
      });

      keys.unbind(['a', 'b']);

      simulateEvent('keydown', {which: 65});
      simulateEvent('keydown', {which: 66});
    });

  });

});