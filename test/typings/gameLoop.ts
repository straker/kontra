import * as kontra from '../../kontra.js';

let gameLoop: kontra.GameLoop = kontra.GameLoop({
  update: () => {},
  render: () => {}
});

let stopped: boolean = gameLoop.isStopped;
gameLoop.stop();
gameLoop.start();
gameLoop.update();
gameLoop.update(1/60);
gameLoop.render();

// options
let otherLoop = kontra.GameLoop({
  update: () => {},
  render: () => {},
  clearCanvas: false,
  fps: 20,
  context: document.createElement('canvas').getContext('2d')
});