var kontra = {};

// var kontra = (function(kontra, window, document) {
  //------------------------------------------------------------
  // Utility Functions
  //------------------------------------------------------------

  kontra.log = {};

  /**
   * Throw an error message to the user with readability formating.
   * @memberOf kontra
   *
   * @param {Error}  error - Error object.
   * @param {string} message - Error message.
   */
  kontra.log.error = function(error, message) {
    error.originalMessage = error.message;
    error.message = 'Kontra: ' + message + '\n\t' + error.stack;
    console.error(error.message);
  };

  /**
   * Return whether an object is an Array.
   * @memberOf kontra
   *
   * @param {object} obj - Object to test.
   *
   * @returns {boolean}
   */
  kontra.isArray = function(obj) {
    return Array.isArray(obj);
  };
// })(kontra || {}, window, document);