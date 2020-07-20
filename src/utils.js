/**
 * Noop function
 */
export const noop = () => {};

// style used for DOM nodes needed for screen readers
export const srOnlyStyle = 'position:absolute;left:-9999px';

// get world x, y, width, and height of object
export function getWorldRect(obj) {
  let x = obj.world.x;
  let y = obj.world.y;
  let width = obj.world.width;
  let height = obj.world.height;

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

// multiply two matrices together
// @see https://codegolf.stackexchange.com/a/100287
export function matrixMultiply(a,b) {
  return a.map(c=>b[0].map((_,i)=>b.reduce((s,d,j)=>s+d[i]*c[j],0)));
}