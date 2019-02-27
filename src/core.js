import { emit } from './events.js';

let kontra = {
  /**
   * Initialize the canvas.
   * @memberof kontra
   *
   * @param {string|HTMLCanvasElement} canvas - Main canvas ID or Element for the game.
   */
  init(canvas) {

    // check if canvas is a string first, an element next, or default to getting
    // first canvas on page
    this.canvas = document.getElementById(canvas) ||
                  canvas ||
                  document.querySelector('canvas');

    // @if DEBUG
    if (!this.canvas) {
      throw Error('You must provide a canvas element for the game');
    }
    // @endif

    this.context = this.canvas.getContext('2d');
    this.context.imageSmoothingEnabled = false;

    emit('init');
  }
};

export default kontra;