import * as kontra from '../../kontra.js';

let game: HTMLCanvasElement = kontra.getCanvas();
let ctx: CanvasRenderingContext2D = kontra.getContext();

// init
kontra.init('#game');
kontra.init(game);
kontra.init();

// return
let {
  canvas: HTMLCanvasElement,
  context: CanvasRenderingContext2D
} = kontra.init();