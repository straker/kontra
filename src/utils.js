/**
 * Noop function
 */
export const noop = () => {};

// style used for DOM nodes needed for screen readers
export const srOnlyStyle = 'position:absolute;left:-9999px';

// get world x, y, width, and height of object
export function getWorldRect(obj) {
  let world = obj.world || obj;

  let x = world.x;
  let y = world.y;
  let width = world.width;
  let height = world.height;

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