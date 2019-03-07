import { emit } from './events.js'

let canvas = {};
let context = {};

export function getCanvas() {
  return canvas;
}

export function getContext() {
  return context;
}

/**
 * Initialize the canvas.
 * @memberof kontra
 *
 * @param {string|HTMLCanvasElement} canvas - Main canvas ID or Element for the game.
 */
export function init(c) {

  // check if canvas is a string first, an element next, or default to getting
  // first canvas on page
  canvas = document.getElementById(c) ||
           c ||
           document.querySelector('canvas');

  // @if DEBUG
  if (!canvas) {
    throw Error('You must provide a canvas element for the game');
  }
  // @endif

  context = canvas.getContext('2d');
  context.imageSmoothingEnabled = false;

  emit('init');

  // auto init keyboard if added to kontra
  if (this && this._initKeys) {
    this._initKeys();
  }
}