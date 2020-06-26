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

// get correct x, y, width, and height of object
export function getRect(obj) {
  let x = obj.x;
  let y = obj.y;
  let width = obj.width;
  let height = obj.height;

  // @ifdef GAMEOBJECT_SCALE
  // adjust for object scale
  if (obj.scale) {
    width = obj.scaledWidth;
    height = obj.scaledHeight;
  }
  // @endif

  // @ifdef GAMEOBJECT_ANCHOR
  // take into account object anchor
  if (obj.anchor) {
    x -= width * obj.anchor.x;
    y -= height * obj.anchor.y;
  }
  // @endif

  return {
    x,
    y,
    width,
    height
  };
}