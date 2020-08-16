// noop function
export const noop = () => {};

// style used for DOM nodes needed for screen readers
export const srOnlyStyle = 'position:absolute;left:-9999px';

// append a node directly after the canvas and as the last
// element of other kontra nodes
export function addToDom(node, canvas) {
  let container = canvas.parentNode;

  node.setAttribute('data-kontra', '');
  if (container) {
    let target = container.querySelector('[data-kontra]:last-of-type') || canvas;
    container.insertBefore(node, target.nextSibling);
  }
  else {
    document.body.appendChild(node);
  }
}