var kontra = (function(kontra, window) {
  'use strict';

  /**
   * Get the current time. Uses the User Timing API if it's available or defaults to using
   * Date().getTime()
   * @memberof kontra
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
   * @memberof kontra
   *
   * @param {object}   properties - Properties of the game loop.
   * @param {number}   [properties.fps=60] - Desired frame rate.
   * @param {boolean}  [properties.clearCanvas=true] - Clear the canvas every frame.
   * @param {function} properties.update - Function called to update the game.
   * @param {function} properties.render - Function called to render the game.
   */
  kontra.gameLoop = function(properties) {
    var gameLoop = Object.create(kontra.gameLoop.prototype);
    gameLoop._init(properties);

    return gameLoop;
  };

  kontra.gameLoop.prototype = {
    /**
     * Initialize properties on the game loop.
     * @memberof kontra.gameLoop
     * @private
     *
     * @param {object}   properties - Properties of the game loop.
     * @param {number}   [properties.fps=60] - Desired frame rate.
     * @param {boolean}  [properties.clearCanvas=true] - Clear the canvas every frame.
     * @param {function} properties.update - Function called to update the game.
     * @param {function} properties.render - Function called to render the game.
     */
    _init: function init(properties) {
      properties = properties || {};

      // check for required functions
      if (typeof properties.update !== 'function' || typeof properties.render !== 'function') {
        var error = new ReferenceError('Required functions not found');
        kontra._logError(error, 'You must provide update() and render() functions to create a game loop.');
        return;
      }

      this.isStopped = true;

      // animation variables
      this._accumulator = 0;
      this._delta = 1E3 / (properties.fps || 60);
      this._step = 1 / (properties.fps || 60);

      this.update = properties.update;
      this.render = properties.render;

      if (properties.clearCanvas === false) {
        this._clearCanvas = kontra._noop;
      }
    },

    /**
     * Start the game loop.
     * @memberof kontra.gameLoop
     */
    start: function start() {
      this._last = kontra.timestamp();
      this.isStopped = false;
      requestAnimationFrame(this._frame.bind(this));
    },

    /**
     * Stop the game loop.
     */
    stop: function stop() {
      this.isStopped = true;
      cancelAnimationFrame(this._rAF);
    },

    /**
     * Called every frame of the game loop.
     * @memberof kontra.gameLoop
     * @private
     */
    _frame: function frame() {
      this._rAF = requestAnimationFrame(this._frame.bind(this));

      this._now = kontra.timestamp();
      this._dt = this._now - this._last;
      this._last = this._now;

      // prevent updating the game with a very large dt if the game were to lose focus
      // and then regain focus later
      if (this._dt > 1E3) {
        return;
      }

      this._accumulator += this._dt;

      while (this._accumulator >= this._delta) {
        this.update(this._step);

        this._accumulator -= this._delta;
      }

      this._clearCanvas();
      this.render();
    },

    /**
     * Clear the canvas on every frame.
     * @memberof kontra.gameLoop
     * @private
     */
    _clearCanvas: function clearCanvas() {
      kontra.context.clearRect(0,0,kontra.canvas.width,kontra.canvas.height);
    }
  };

  return kontra;
})(kontra || {}, window);