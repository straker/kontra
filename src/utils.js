import { getWorldRect } from './helpers.js';

export let noop = () => {};

// style used for DOM nodes needed for screen readers
export let srOnlyStyle =
  'position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0);';
// prevent focus from scrolling the page
export let focusParams = { preventScroll: true };

/**
 * Append a node directly after the canvas and as the last element of other kontra nodes.
 *
 * @param {HTMLElement} node - Node to append.
 * @param {HTMLCanvasElement} canvas - Canvas to append after.
 */
export function addToDom(node, canvas) {
  let container = canvas.parentNode;

  node.setAttribute('data-kontra', '');
  if (container) {
    let target =
      [
        ...container.querySelectorAll(':scope > [data-kontra]')
      ].pop() || canvas;
    target.after(node);
  } else {
    document.body.append(node);
  }
}

/**
 * Remove an item from an array.
 *
 * @param {*[]} array - Array to remove from.
 * @param {*} item - Item to remove.
 *
 * @returns {Boolean|undefined} True if the item was removed.
 */
export function removeFromArray(array, item) {
  let index = array.indexOf(item);
  if (index != -1) {
    array.splice(index, 1);
    return true;
  }
}

/**
 * Detection collision between a rectangle and a circle.
 * @see https://yal.cc/rectangle-circle-intersection-test/
 *
 * @param {Object} rect - Rectangular object to check collision against.
 * @param {Object} circle - Circular object to check collision against.
 *
 * @returns {Boolean} True if objects collide.
 */
export function circleRectCollision(circle, rect) {
  let { x, y, width, height } = getWorldRect(rect);

  // account for camera
  do {
    x -= rect.sx || 0;
    y -= rect.sy || 0;
  } while ((rect = rect.parent));

  let dx = circle.x - Math.max(x, Math.min(circle.x, x + width));
  let dy = circle.y - Math.max(y, Math.min(circle.y, y + height));
  return dx * dx + dy * dy < circle.radius * circle.radius;
}
