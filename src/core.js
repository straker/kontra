var kontra = {};

var kontra = (function(kontra, window, document) {
  /**
   * Object for logging to the client.
   */
  kontra.log = {};

  /**
   * Throw an error message to the user with readability formating.
   * @memberOf kontra
   *
   * @param {Error}  error - Error object.
   * @param {string} message - Error message.
   */
  kontra.log.error = function logError(error, message) {
    error.originalMessage = error.message;
    error.message = 'Kontra: ' + message + '\n\t' + error.stack;
    console.error(error.message);
  };

  /**
   * Return whether a value is an Array.
   * @memberOf kontra
   *
   * @param {*} value - Value to test.
   *
   * @returns {boolean}
   */
  kontra.isArray = Array.isArray;

  /**
   * Returns whether a value is a String.
   * @memberOf kontra
   *
   * @param {*} value - Value to test.
   *
   * @returns {boolean}
   */
  kontra.isString = function isString(value) {
    return typeof value === 'string';
  };

  /**
   * Return whether a value is a Number.
   * @memberOf kontra
   *
   * @param {*} value - Value to test.
   *
   * @returns {boolean}
   */
  kontra.isNumber = function isNumber(value) {
    return typeof value === 'number';
  };

  return kontra;
})(kontra || {}, window, document);