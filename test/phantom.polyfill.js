/**
 * function.prototype.bind polyfill for PhantomJS.
 * @see https://github.com/ariya/phantomjs/issues/10522#issuecomment-39248521
 */
if (typeof Function.prototype.bind != 'function') {
  Function.prototype.bind = function bind(obj) {
    var args = Array.prototype.slice.call(arguments, 1),
        self = this,
        nop = function() {
        },
        bound = function() {
          return self.apply(
            this instanceof nop ? this : (obj || {}), args.concat(
              Array.prototype.slice.call(arguments)
            )
          );
        };
    nop.prototype = this.prototype || {};
    bound.prototype = new nop();
    return bound;
  };
}

/**
 * Simple Audio shim for PhantomJS.
 */
(function() {
  // only load when Audio is not defined
  if (window.Audio) return;

  function Audio() {
    this.src = '';
    this.preload = 'auto';
    this.onerror = null;
    this._listeners = {};
  }

  /**
   * Checks if the browser can play the specified Audio type.
   * @param {string} type - Type of Audio to test.
   * @returns {string}
   */
  Audio.prototype.canPlayType = function(type) {
    // since PhantomJS does not support Audio, we'll always return an empty string
    return '';
  };

  /**
   * Shim the addEventListener function.
   * @param {string} type
   * @param {function} listener
   */
  Audio.prototype.addEventListener = function(type, listener) {
    if (typeof listener !== 'function') return;

    this._listeners[type] = this._listeners[type] || [];
    this._listeners[type].push(listener);
  };

  /**
   * Shim the dispatchEvent function.
   * @param {Event} event
   */
  Audio.prototype.dispatchEvent = function(event) {
    this._listeners[event.type].forEach(function(listener) {
      listener(event);
    });
  };

  /**
   * Re-load the Audio element.
   */
  Audio.prototype.load = function() {
    if (!this.src) return;

    var req = new XMLHttpRequest();
    var _this = this;

    // load the file
    req.addEventListener('load', function() {
      if (req.status !== 200) {
        _this.onerror();
        return;
      }

      _this.dispatchEvent(new Event('canplay'));
    });

    req.open('GET', this.src, true);
    req.send();
  };

  window.Audio = Audio;
})();

/**
 * RequestAnimationFrame polyfill for PhantomJS.
 */
(function() {
  // only set if requestAnimationFrame is not defined
  if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = function(callback, element) {
      var currTime = new Date().getTime();
      var timeToCall = Math.max(0, 16 - (currTime - lastTime));
      var id = window.setTimeout(function() { callback(currTime + timeToCall); },
        timeToCall);
      lastTime = currTime + timeToCall;
      return id;
    };
  }

  // only set if cancelAnimationFrame is not defined
  if (!window.cancelAnimationFrame) {
    window.cancelAnimationFrame = function(id) {
      clearTimeout(id);
    };
  }
})();