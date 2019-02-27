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

  /**
   * Noop function
   */

  // import _ from './test/index.js'

  emit('foo');

}());
