/**
 * Noop function
 */
export const noop = () => {};

/**
 * Factory function that wraps all kontra classes.
 * @param {Object} classObj - Class to wrap in a factory function
 */
export function Factory(classObj) {
  function factory() {
    return new classObj(...arguments);
  }
  factory.prototype = classObj.prototype;
  factory.class = classObj;

  return factory;
}

// style used for DOM nodes needed for screen readers
export const srOnlyStyle = 'position:absolute;left:-9999px';