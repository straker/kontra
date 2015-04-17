var kontra = (function(kontra, window, document) {
  'use strict';

  /**
   * Game loop that updates and renders the game every frame.
   * @memberOf kontra
   * @constructor
   *
   * @param {object}   properties - Configure the game loop.
   * @param {number}   [properties.fps=60] - Desired frame rate.
   * @param {function} properties.update - Function called to update the game.
   * @param {function} properties.render - Function called to render the game.
   */
  kontra.GameLoop = function GameLoop(properties) {
    properties = properties || {};

    // check for required functions
    if (typeof properties.update !== 'function' || typeof properties.render !== 'function') {
      var error = new ReferenceError('Required functions not found');
      kontra.logError(error, 'You must provide update() and render() functions to create a game loop.');
      return;
    }

    // animation variables
    var fps = properties.fps || 60;
    var last = 0;
    var accumulator = 0;
    var delta = 1E3 / fps;
    var now;
    var dt;
    var rAF;

    var update = properties.update;
    var render = properties.render;
    var _this = this;

    document.addEventListener( 'visibilitychange', onVisibilityChange, false);

    /**
     * Start the game loop.
     * @memberOf kontra.GameLoop
     */
    this.start = function GameLoopStart() {
      last = 0;
      requestAnimationFrame(this.frame);
    };

    /**
     * Called every frame of the game loop.
     * @memberOf kontra.GameLoop
     */
    this.frame = function GameLoopFrame() {
      rAF = requestAnimationFrame(_this.frame);

      now = timestamp();

      // on the first call last will be 0, so we need to offset this by making dt=0 so
      // that the first update isn't a very large value.
      dt = now - (last || now);
      last = now;

      accumulator += dt;

      while (accumulator >= delta) {
        update(delta);

        accumulator -= delta;
      }

      render();
    };

    /**
     * Stop the game loop.
     */
    this.stop = function GameLoopPause() {
      cancelAnimationFrame(rAF);
    };

    /**
     * Reset last to 0 when regaining screen focus, otherwise we end up with a very large
     * dt value on the return.
     * @memberOf kontra.GameLoop
     * @private
     */
    function onVisibilityChange() {
      if (!document.hidden) {
        last = 0;
      }
    }
  };

  /**
   * Returns the current time. Uses the User Timing API if it's available or defaults to
   * using Date().getTime()
   * @private
   *
   * @returns {number}
   */
  var timestamp = (function() {
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

  return kontra;
})(kontra || {}, window, document);