var kontra = (function(kontra, window, document) {
  'use strict';

  /**
   * Returns the current time. Uses the User Timing API if it's available or defaults to
   * using Date().getTime()
   * @private
   *
   * @returns {number}
   */
  kontra.timestamp = (function() {
    if (window.performance && window.performance.now) {
      return function timestampPerformance() {
        return window.performance.now();
      };
    }
    else {
      return function timestampDate() {
        return new Date().getTime();
      };
    }
  })();





  /**
   * Game loop that updates and renders the game every frame.
   * @memberOf kontra
   *
   * @see kontra.gameLoop._proto.set for list of params
   */
  kontra.gameLoop = function(properties) {
    var gameLoop = Object.create(kontra.gameLoop._proto);
    gameLoop.set(properties);

    return gameLoop;
  };

  kontra.gameLoop._proto = {
    /**
     * Set properties on the game loop.
     * @memberOf kontra.gameLoop
     *
     * @param {object}   properties - Configure the game loop.
     * @param {number}   [properties.fps=60] - Desired frame rate.
     * @param {function} properties.update - Function called to update the game.
     * @param {function} properties.render - Function called to render the game.
     */
    set: function(properties) {
      properties = properties || {};

      // check for required functions
      if (typeof properties.update !== 'function' || typeof properties.render !== 'function') {
        var error = new ReferenceError('Required functions not found');
        kontra.logError(error, 'You must provide update() and render() functions to create a game loop.');
        return;
      }

      // animation variables
      this._accumulator = 0;
      this._delta = 1E3 / (properties.fps || 60);

      this.update = properties.update;
      this.render = properties.render;
    },

    /**
     * Start the game loop.
     * @memberOf kontra.gameLoop
     */
    start: function() {
      this._last = kontra.timestamp();
      requestAnimationFrame(this.frame.bind(this));
    },

    /**
     * Called every frame of the game loop.
     * @memberOf kontra.gameLoop
     */
    frame: function() {
      var _this = this;

      _this._rAF = requestAnimationFrame(_this.frame.bind(_this));

      _this._now = kontra.timestamp();
      _this._dt = _this._now - _this._last;
      _this._last = _this._now;

      // _this prevents updating the game with a very large dt if the game were to
      // lose focus and then regain focus later
      if (_this._dt > 1E3) {
        return;
      }

      _this._accumulator += _this._dt;

      while (_this._accumulator >= _this._delta) {
        _this.update(_this._delta / 1E3);

        _this._accumulator -= _this._delta;
      }

      _this.render();
    },

    /**
     * Stop the game loop.
     */
    stop: function() {
      cancelAnimationFrame(this._rAF);
    }
  };

  return kontra;
})(kontra || {}, window, document);