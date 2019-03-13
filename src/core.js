import { emit } from './events.js'

let canvasEl, context;

/**
 * Return the canvas object.
 *
 * @returns {HTMLCanvasElement}
 */
export function getCanvas() {
  return canvasEl;
}

/**
 * Return the context object.
 *
 * @returns {CanvasRenderingContext2D}
 */
export function getContext() {
  return context;
}

/**
 * Initialize the canvas.
 *
 * @param {string|HTMLCanvasElement} canvas - Main canvas ID or Element for the game.
 */
export function init(canvas) {

  // check if canvas is a string first, an element next, or default to getting
  // first canvas on page
  canvasEl = document.getElementById(canvas) ||
             canvas ||
             document.querySelector('canvas');

  // @if DEBUG
  if (!canvasEl) {
    throw Error('You must provide a canvas element for the game');
  }
  // @endif

  context = canvasEl.getContext('2d');
  context.imageSmoothingEnabled = false;

  emit('init');
}