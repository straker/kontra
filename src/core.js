(function() {
  let callbacks = {};

  window.kontra = {

    /**
     * Initialize the canvas.
     * @memberof kontra
     *
     * @param {string|HTMLCanvasElement} canvas - Main canvas ID or Element for the game.
     */
    init(canvas) {

      // check if canvas is a string first, an element next, or default to getting
      // first canvas on page
      let canvasEl = this.canvas = document.getElementById(canvas) ||
                                   canvas ||
                                   document.querySelector('canvas');

      // @if DEBUG
      if (!canvasEl) {
        throw Error('You must provide a canvas element for the game');
      }
      // @endif

      this.context = canvasEl.getContext('2d');
      this.context.imageSmoothingEnabled = false;

      this.emit('init', this);
    },

    /**
     * Register a callback for an event.
     * @memberof kontra
     *
     * @param {string} event - Name of the event
     * @param {function} callback - Function callback
     */
    on(event, callback) {
      callbacks[event] = callbacks[event] || [];
      callbacks[event].push(callback);
    },

    /**
     * Remove a callback for an event.
     * @memberof kontra
     *
     * @param {string} event - Name of the event
     * @param {function} callback - Function callback
     */
    // @see https://github.com/jed/140bytes/wiki/Byte-saving-techniques#use-placeholder-arguments-instead-of-var
    off(event, callback, index) {
      if (!callbacks[event] || (index = callbacks[event].indexOf(callback)) < 0) return;
      callbacks[event].splice(index, 1);
    },

    /**
     * Call all callback functions for the event.
     * @memberof kontra
     *
     * @param {string} event - Name of the event
     * @param {...*} args - Arguments passed to all callbacks
     */
    emit(event, ...args) {
      if (!callbacks[event]) return;
      callbacks[event].forEach(fn => fn(...args));
    },

    /**
     * Noop function.
     * @see https://stackoverflow.com/questions/21634886/what-is-the-javascript-convention-for-no-operation#comment61796464_33458430
     * @memberof kontra
     * @private
     *
     * The new operator is required when using sinon.stub to replace with the noop.
     */
    _noop: new Function,

    // expose for testing
    _callbacks: callbacks
  };
})();