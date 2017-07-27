/* global console */

var kontra = (function(kontra, document) {
  'use strict';

  /**
   * Initialize the canvas.
   * @memberof kontra
   *
   * @param {string|HTMLCanvasElement} canvas - Main canvas ID or Element for the game.
   */
  kontra.init = function init(canvas) {
    if (kontra._isString(canvas)) {
      this.canvas = document.getElementById(canvas);
    }
    else if (kontra._isCanvas(canvas)) {
      this.canvas = canvas;
    }
    else {
      this.canvas = document.getElementsByTagName('canvas')[0];

      if (!this.canvas) {
        var error = new ReferenceError('No canvas element found.');
        kontra._logError(error, 'You must provide a canvas element for the game.');
        return;
      }
    }

    this.context = this.canvas.getContext('2d');
  };

  /**
   * Throw an error message to the user with readable formating.
   * @memberof kontra
   * @private
   *
   * @param {Error}  error - Error object.
   * @param {string} message - Error message.
   */
  kontra._logError = function logError(error, message) {
    console.error('Kontra: ' + message + '\n\t' + error.stack);
  };

  /**
   * Noop function.
   * @memberof kontra
   * @private
   */
  kontra._noop = function noop() {};

  /**
   * Determine if a value is a String.
   * @memberof kontra
   * @private
   *
   * @param {*} value - Value to test.
   *
   * @returns {boolean}
   */
  kontra._isString = function isString(value) {
    return typeof value === 'string';
  };

  /**
   * Determine if a value is a Number.
   * @memberof kontra
   * @private
   *
   * @param {*} value - Value to test.
   *
   * @returns {boolean}
   */
  kontra._isNumber = function isNumber(value) {
    return typeof value === 'number';
  };

  /**
   * Determine if a value is an Image.
   * @memberof kontra
   * @private
   *
   * @param {*} value - Value to test.
   *
   * @returns {boolean}
   */
  kontra._isImage = function isImage(value) {
    return value instanceof HTMLImageElement;
  };

  /**
   * Determine if a value is a Canvas.
   * @memberof kontra
   * @private
   *
   * @param {*} value - Value to test.
   *
   * @returns {boolean}
   */
  kontra._isCanvas = function isCanvas(value) {
    return value instanceof HTMLCanvasElement;
  };

  return kontra;
})(kontra || {}, document);