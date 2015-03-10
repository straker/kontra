var kontra = (function(kontra, window, document) {
  /**
   * Game loop that updates and draws the game every frame.
   * @memberOf kontra
   * @constructor
   *
   * @param {object}   options - Configure the game loop.
   * @param {number}   [options.fps=60] - Desired frame rate.
   * @param {number}   [options.slowFactor=1] - How much to slow down the frame rate.
   * @param {function} options.update - Function called to update the game.
   * @param {function} options.draw - Function called to draw the game.
   */
  kontra.GameLoop = function GameLoop(options) {
    options = options || {};

    // check for required functions
    if (typeof options.update !== 'function' || typeof options.draw !== 'function') {
      var error = new ReferenceError('Required functions not found');
      kontra.log.error(error, 'You must provide update() and draw() functions to create a game loop.');
      return;
    }

    var fps = options.fps || 60;
    var last = 0;
    var accumulator = 0;
    var step = 1E3 / fps;
    var slowFactor = options.slowFactor || 1;
    var delta = slowFactor * step;
    var update = options.update;
    var draw = options.draw;
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
      requestAnimationFrame(this.frame);
    };

    /**
     * Called every frame of the game loop.
     * @memberOf kontra.GameLoop
     */
    this.frame = function GameLoopFrame() {
      rAF = requestAnimationFrame(_this.frame);

      now = timestamp();
      dt = now - (last || now);
      last = now;

      accumulator += dt;

      while (accumulator >= delta) {
        update();

        accumulator -= delta;
      }

      draw();
    };

    /**
     * Pause the game.
     * @memberOf kontra.GameLoop
     */
    this.pause = function GameLoopPause() {
      last = 0;
      cancelAnimationFrame(rAF);
    };

    /**
     * Unpause the game.
     * @memberOf kontra.GameLoop
     */
    this.unpause = function GameLoopUnpause() {
      requestAnimationFrame(this.frame);
    };

    /**
     * pause the game when the window isn't visible.
     * @memberOf kontra.GameLoop
     * @private
     */
    function onVisibilityChange() {
      if (document.hidden) {
        _this.pause();
      }
      else {
        _this.unpause();
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