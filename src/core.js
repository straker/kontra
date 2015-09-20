/* global console */

var kontra = (function(kontra, document) {
  'use strict';

  /**
   * Initialize the canvas.
   * @memberof kontra
   *
   * @param {object} properties - Properties for the game.
   * @param {string|Canvas} properties.canvas - Main canvas ID or Element for the game.
   */
  kontra.init = function init(properties) {
    properties = properties || {};

    if (kontra.isString(properties.canvas)) {
      this.canvas = document.getElementById(properties.canvas);
    }
    else if (kontra.isCanvas(properties.canvas)) {
      this.canvas = properties.canvas;
    }
    else {
      this.canvas = document.getElementsByTagName('canvas')[0];

      if (!this.canvas) {
        var error = new ReferenceError('No canvas element found.');
        kontra.logError(error, 'You must provide a canvas element for the game.');
        return;
      }
    }

    this.context = this.canvas.getContext('2d');
    this.game = {
      width: this.canvas.width,
      height: this.canvas.height
    };
  };

  /**
   * Throw an error message to the user with readable formating.
   * @memberof kontra
   *
   * @param {Error}  error - Error object.
   * @param {string} message - Error message.
   */
  kontra.logError = function logError(error, message) {
    console.error('Kontra: ' + message + '\n\t' + error.stack);
  };

  /**
   * Noop function.
   * @memberof kontra
   */
  kontra.noop = function noop() {};

  /**
   * Determine if a value is an Array.
   * @memberof kontra
   *
   * @param {*} value - Value to test.
   *
   * @returns {boolean}
   */
  kontra.isArray = Array.isArray;

  /**
   * Determine if a value is a String.
   * @memberof kontra
   *
   * @param {*} value - Value to test.
   *
   * @returns {boolean}
   */
  kontra.isString = function isString(value) {
    return typeof value === 'string';
  };

  /**
   * Determine if a value is a Number.
   * @memberof kontra
   *
   * @param {*} value - Value to test.
   *
   * @returns {boolean}
   */
  kontra.isNumber = function isNumber(value) {
    return typeof value === 'number';
  };

  /**
   * Determine if a value is an Image.
   * @memberof kontra
   *
   * @param {*} value - Value to test.
   *
   * @returns {boolean}
   */
  kontra.isImage = function isImage(value) {
    return value instanceof HTMLImageElement;
  };

  /**
   * Determine if a value is a Canvas.
   * @memberof kontra
   *
   * @param {*} value - Value to test.
   *
   * @returns {boolean}
   */
  kontra.isCanvas = function isCanvas(value) {
    return value instanceof HTMLCanvasElement;
  };

  return kontra;
})(kontra || {}, document);