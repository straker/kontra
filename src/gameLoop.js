var kontra = (function(kontra, window, document) {
  /**
   * Game loop that updates and draws the game every frame.
   * @memberOf kontra
   * @constructor
   *
   * @param {object}   properties - Configure the game loop.
   * @param {number}   [properties.fps=60] - Desired frame rate.
   * @param {number}   [properties.slowFactor=1] - How much to slow down the frame rate.
   * @param {function} properties.update - Function called to update the game.
   * @param {function} properties.draw - Function called to draw the game.
   */
  kontra.GameLoop = function GameLoop(properties) {
    properties = properties || {};

    // check for required functions
    if (typeof properties.update !== 'function' || typeof properties.draw !== 'function') {
      var error = new ReferenceError('Required functions not found');
      kontra.logError(error, 'You must provide update() and draw() functions to create a game loop.');
      return;
    }

    // animation variables
    var fps = properties.fps || 60;
    var last = 0;
    var accumulator = 0;
    var step = 1E3 / fps;
    var slowFactor = properties.slowFactor || 1;
    var delta = slowFactor * step;

    var update = properties.update;
    var draw = properties.draw;
    var started = false;
    var _this = this;
    var now;
    var dt;
    var rAF;

    document.addEventListener( 'visibilitychange', onVisibilityChange, false);

    /**
     * Start the game loop.
     * @memberOf kontra.GameLoop
     */
    this.start = function GameLoopStart() {
      started = true;
      last = 0;
      requestAnimationFrame(this.frame);
    };

    /**
     * Called every frame of the game loop.
     * @memberOf kontra.GameLoop
     */
    this.frame = function GameLoopFrame() {
      rAF = requestAnimationFrame(_this.frame);

      stats.begin();

      now = timestamp();
      dt = now - (last || now);
      last = now;

      accumulator += dt;

      while (accumulator >= delta) {
        update();

        accumulator -= delta;
      }

      draw();

      stats.end();
    };

    /**
     * Stop the game loop.
     * @memberOf kontra.GameLoop
     */
    this.stop = function GameLoopStop() {
      started = false;
      cancelAnimationFrame(rAF);
    };

    /**
     * Pause the game loop. This is different than stopping so that on visibility
     * change, we don't just resume the game if it was stopped before.
     * @memberOf kontra.GameLoop
     */
    this.pause = function GameLoopPause() {
      cancelAnimationFrame(rAF);
    };

    /**
     * Stop the game when the window isn't visible.
     * @memberOf kontra.GameLoop
     * @private
     */
    function onVisibilityChange() {
      if (document.hidden) {
        _this.pause();
      }
      else if (started) {
        _this.start();
      }
    }
  };

  /**
   * Returns the current time.
   * @private
   *
   * @returns {number}
   */
  var timestamp = (function() {
    // function to call if window.performance.now is available
    function timestampPerformance() {
      return window.performance.now();
    }

    // default function to call
    function timestampDate() {
      return new Date().getTime();
    }

    if (window.performance && window.performance.now) {
      return timestampPerformance;
    }
    else {
      return timestampDate;
    }
  })();

  return kontra;
})(kontra || {}, window, document);