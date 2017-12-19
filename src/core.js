this.kontra = {

  /**
   * Initialize the canvas.
   * @memberof kontra
   *
   * @param {string|HTMLCanvasElement} canvas - Main canvas ID or Element for the game.
   */
  init: function init(canvas) {

    // check if canvas is a string first, an element next, or default to getting
    // first canvas on page
    var canvasEl = this.canvas = document.getElementById(canvas) ||
                                 canvas ||
                                 document.querySelector('canvas');

    // @if DEBUG
    if (!this._isCanvas(canvasEl)) {
      throw Error('You must provide a canvas element for the game');
    }
    // @endif

    this.context = canvasEl.getContext('2d');
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

  /*
   * Determine if a value is a String.
   * @see https://github.com/jed/140bytes/wiki/Byte-saving-techniques#coercion-to-test-for-types
   * @memberof kontra
   * @private
   *
   * @param {*} value - Value to test.
   *
   * @returns {boolean}
   */
  _isString: function isString(value) {
    return ''+value === value;
  },

  /**
   * Determine if a value is a Number.
   * @see https://github.com/jed/140bytes/wiki/Byte-saving-techniques#coercion-to-test-for-types
   * @memberof kontra
   * @private
   *
   * @param {*} value - Value to test.
   *
   * @returns {boolean}
   */
  _isNumber: function isNumber(value) {
    return +value === value;
  },

  /**
   * Determine if a value is a Function.
   * @memberof kontra
   * @private
   *
   * @param {*} value - Value to test.
   *
   * @returns {boolean}
   */
  // @if DEBUG
  _isFunc: function isFunction(value) {
    return typeof value === 'function';
  },
  // @endif

  /**
   * Determine if a value is an Image. An image can also be a canvas element for
   * the purposes of drawing using drawImage().
   * @memberof kontra
   * @private
   *
   * @param {*} value - Value to test.
   *
   * @returns {boolean}
   */
  _isImage: function isImage(value) {
    return !!value && value.nodeName === 'IMG' || this._isCanvas(value);
  },

  /**
   * Determine if a value is a Canvas.
   * @memberof kontra
   * @private
   *
   * @param {*} value - Value to test.
   *
   * @returns {boolean}
   */
  _isCanvas: function isCanvas(value) {
    return !!value && value.nodeName === 'CANVAS';
  }
};