import { noop } from './utils.js';
import { emit } from './events.js';

/**
 * Functions for initializing the Kontra library and getting the canvas and context
 * objects.
 *
 * ```js
 * import { getCanvas, getContext, init } from 'kontra';
 *
 * let { canvas, context } = init();
 *
 * // or can get canvas and context through functions
 * canvas = getCanvas();
 * context = getContext();
 * ```
 * @sectionName Core
 */

let canvasEl, context;

// allow contextless environments, such as using ThreeJS as the main
// canvas, by proxying all canvas context calls
let handler = {
  // by using noop we can proxy both property and function calls
  // so neither will throw errors
  get(target, key) {
    // export for testing
    if (key == '_proxy') return true;
    return noop;
  }
};

/**
 * Return the canvas element.
 * @function getCanvas
 *
 * @returns {HTMLCanvasElement} The canvas element for the game.
 */
export function getCanvas() {
  return canvasEl;
}

/**
 * Return the context object.
 * @function getContext
 *
 * @returns {CanvasRenderingContext2D} The context object the game draws to.
 */
export function getContext() {
  return context;
}

/**
 * Initialize the library and set up the canvas. Typically you will call `init()` as the first thing and give it the canvas to use. This will allow all Kontra objects to reference the canvas when created.
 *
 * ```js
 * import { init } from 'kontra';
 *
 * let { canvas, context } = init('game');
 * ```
 * @function init
 *
 * @param {String|HTMLCanvasElement} [canvas] - The canvas for Kontra to use. Can either be the ID of the canvas element or the canvas element itself. Defaults to using the first canvas element on the page.
 * @param {Object} [options] - Game options.
 * @param {Boolean} [options.contextless=false] - If the game will run in an contextless environment. A contextless environment uses a [Proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) for the `canvas` and `context` so all property and function calls will noop.
 *
 * @returns {{canvas: HTMLCanvasElement, context: CanvasRenderingContext2D}} An object with properties `canvas` and `context`. `canvas` it the canvas element for the game and `context` is the context object the game draws to.
 */
export function init(canvas, { contextless = false } = {}) {
  // check if canvas is a string first, an element next, or default to
  // getting first canvas on page
  canvasEl =
    document.getElementById(canvas) ||
    canvas ||
    document.querySelector('canvas');

  if (contextless) {
    canvasEl = canvasEl || new Proxy({}, handler);
  }

  // @ifdef DEBUG
  if (!canvasEl) {
    throw Error('You must provide a canvas element for the game');
  }
  // @endif

  context = canvasEl.getContext('2d') || new Proxy({}, handler);
  context.imageSmoothingEnabled = false;

  emit('init');

  return { canvas: canvasEl, context };
}

// expose for testing
export function _reset() {
  canvasEl = context = undefined;
}