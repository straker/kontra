export let noop = () => {};

// style used for DOM nodes needed for screen readers
export let srOnlyStyle =
  'position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0);';

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
      container.querySelector('[data-kontra]:last-of-type') || canvas;
    container.insertBefore(node, target.nextSibling);
  } else {
    document.body.appendChild(node);
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
