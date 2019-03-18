(function () {
  'use strict';

  let callbacks = {};

  /**
   * Call all callback functions for the event.
   *
   * @param {string} event - Name of the event
   * @param {...*} args - Arguments passed to all callbacks
   */
  function emit(event, ...args) {
    if (!callbacks[event]) return;
    callbacks[event].map(fn => fn(...args));
  }

  let canvasEl, context;

  /**
   * Initialize the canvas.
   *
   * @param {string|HTMLCanvasElement} canvas - Main canvas ID or Element for the game.
   */
  function init(canvas) {

    // check if canvas is a string first, an element next, or default to getting
    // first canvas on page
    canvasEl = document.getElementById(canvas) ||
               canvas ||
               document.querySelector('canvas');

    // @if DEBUG
    if (!canvasEl) {
      throw Error('You must provide a canvas element for the game');
    }
    // @endif

    context = canvasEl.getContext('2d');
    context.imageSmoothingEnabled = false;

    emit('init');
  }

  /**
   * Noop function
   */

  let callbacks$1 = {};
  let pressedKeys = {};

  let keyMap = {
    // named keys
    13: 'enter',
    27: 'esc',
    32: 'space',
    37: 'left',
    38: 'up',
    39: 'right',
    40: 'down'
  };

  /**
   * Execute a function that corresponds to a keyboard key.
   *
   * @param {KeyboardEvent} evt
   */
  function keydownEventHandler(evt) {
    pressedKeys[evt.key] = true;

    if (callbacks$1[evt.key]) {
      callbacks$1[evt.key](evt);
    }
  }

  /**
   * Set the released key to not being pressed.
   *
   * @param {KeyboardEvent} evt
   */
  function keyupEventHandler(evt) {
    pressedKeys[evt.key] = false;
  }

  /**
   * Reset pressed keys.
   */
  function blurEventHandler() {
    pressedKeys = {};
  }

  /**
   * Add keyboard event listeners.
   */
  function initKeys() {

    // alpha keys
    // @see https://stackoverflow.com/a/43095772/2124254
    for (let i = 0; i < 26; i++) {
      // rollupjs considers this a side-effect (for now)
      // @see https://twitter.com/lukastaegert/status/1107011988515893249?s=20
      keyMap[65+i] = (10 + i).toString(36);
    }

    // numeric keys
    for (i = 0; i < 10; i++) {
      keyMap[48+i] = ''+i;
    }

    addEventListener('keydown', keydownEventHandler);
    addEventListener('keyup', keyupEventHandler);
    addEventListener('blur', blurEventHandler);
  }

  /**
   * Get the kontra object method name from the plugin.
   *
   * @param {string} methodName - Before/After function name
   *
   * @returns {string}
   */

  /**
   * Save an item to localStorage.
   *
   * @param {string} key - Name to store the item as.
   * @param {*} value - Item to store.
   */

  initKeys();

  let canvas = document.createElement('canvas');
  document.body.appendChild(canvas);
  init(canvas);

  // create a basic sprite with a velocity
  // window.sprite = Sprite({
  //   x: 290,
  //   y: 100,
  //   dx: 3,
  //   dy: 0,
  //   width: 20,
  //   height: 40,
  //   color: 'red'
  // });

  // // create the game loop to update and render the sprite
  // window.loop = GameLoop({
  //   update: function() {
  //     sprite.update();

  //     // reset the sprites position when it reaches the edge of the game
  //     if (sprite.x > getCanvas().width) {
  //       sprite.x = -sprite.width;
  //     }
  //   },
  //   render: function() {
  //     sprite.render();
  //   }
  // });

  // // start the loop
  // loop.start();

  // import kontra from '../src/kontra.js'

  // let canvas = document.createElement('canvas');
  // document.body.appendChild(canvas);
  // kontra.init(canvas);

  // // create a basic sprite with a velocity
  // window.sprite = kontra.Sprite({
  //   x: 290,
  //   y: 100,
  //   dx: 3,
  //   dy: 0,
  //   width: 20,
  //   height: 40,
  //   color: 'red'
  // });

  // // create the game loop to update and render the sprite
  // window.loop = kontra.GameLoop({
  //   update: function() {
  //     sprite.update();

  //     // reset the sprites position when it reaches the edge of the game
  //     if (sprite.x > kontra.getCanvas().width) {
  //       sprite.x = -sprite.width;
  //     }
  //   },
  //   render: function() {
  //     sprite.render();
  //   }
  // });

  // // start the loop
  // loop.start();

}());
