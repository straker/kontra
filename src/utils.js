/**
 * Noop function
 */
export const noop = () => {};

export function Factory(classObj) {
  function factory() {
    return new classObj(...arguments);
  }
  factory.prototype = classObj.prototype;
  factory.class = classObj;

  return factory;
}