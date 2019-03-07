(function () {
  'use strict';

  let callbacks = {};

  /**
   * Call all callback functions for the event.
   * @memberof kontra
   *
   * @param {string} event - Name of the event
   * @param {...*} args - Arguments passed to all callbacks
   */
  function emit(event, ...args) {
    if (!callbacks[event]) return;
    callbacks[event].forEach(fn => fn(...args));
  }

  let canvas = {};
  let context = {};

  function getCanvas() {
    return canvas;
  }

  function getContext() {
    return context;
  }

  /**
   * Initialize the canvas.
   * @memberof kontra
   *
   * @param {string|HTMLCanvasElement} canvas - Main canvas ID or Element for the game.
   */
  function init(c) {

    // check if canvas is a string first, an element next, or default to getting
    // first canvas on page
    canvas = document.getElementById(c) ||
             c ||
             document.querySelector('canvas');

    // @if DEBUG
    if (!canvas) {
      throw Error('You must provide a canvas element for the game');
    }
    // @endif

    context = canvas.getContext('2d');
    context.imageSmoothingEnabled = false;

    emit('init');

    // auto init keyboard if added to kontra
    if (this && this._initKeys) {
      this._initKeys();
    }
  }

  /**
   * Noop function
   */
  const noop = () => {};

  /**
   * Clear the canvas.
   * @private
   */
  function clear() {
    let canvas = getCanvas();
    getContext().clearRect(0, 0, canvas.width, canvas.height);
  }

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
  function gameLoop({fps = 60, clearCanvas = true, update, render}) {
    // check for required functions
    // @if DEBUG
    if ( !(update && render) ) {
      throw Error('You must provide update() and render() functions');
    }
    // @endif

    // animation variables
    let accumulator = 0;
    let delta = 1E3 / fps;  // delta between performance.now timings (in ms)
    let step = 1 / fps;
    let clearFn = clearCanvas ? clear : noop;
    let last, rAF, now, dt, loop;

    /**
     * Called every frame of the game loop.
     */
    function frame() {
      rAF = requestAnimationFrame(frame);

      now = performance.now();
      dt = now - last;
      last = now;

      // prevent updating the game with a very large dt if the game were to lose focus
      // and then regain focus later
      if (dt > 1E3) {
        return;
      }

      emit('tick');
      accumulator += dt;

      while (accumulator >= delta) {
        loop.update(step);

        accumulator -= delta;
      }

      clearFn();
      loop.render();
    }

    // game loop object
    loop = {
      update,
      render,
      isStopped: true,

      /**
       * Start the game loop.
       * @memberof kontra.gameLoop
       */
      start() {
        last = performance.now();
        this.isStopped = false;
        requestAnimationFrame(frame);
      },

      /**
       * Stop the game loop.
       */
      stop() {
        this.isStopped = true;
        cancelAnimationFrame(rAF);
      },

      // expose properties for testing
      // @if DEBUG
      _frame: frame,
      set _last(value) {
        last = value;
      }
      // @endif
    };

    return loop;
  }

  // kontra.animation = animation;
  // kontra.assets = assets;
  // kontra.on = on;
  // kontra.off = off;
  // kontra.emit = emit;
  // kontra.gameLoop = gameLoop;
  // kontra.keys = keys;

  // export default kontra;

  // export { default as assets } from './assets.js'
  // export { default as keys } from './keys.js'
  // export { default as core } from './core.js'

  let canvas$1 = document.createElement('canvas');
  document.body.appendChild(canvas$1);
  init(canvas$1);

  let loop = gameLoop({
    update() {},
    render() {}
  });

  loop.start();

  // bind(' ', () => {
  //   console.log('fire!');
  // });

  // import kontra from '../src/kontra.js'

  // let canvas = document.createElement('canvas');
  // document.body.appendChild(canvas);
  // kontra.init(canvas);

  // debugger;

  // kontra.keys.bind(' ', () => {
  //   console.log('fire!');
  // });

}());
