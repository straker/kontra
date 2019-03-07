import { init, gameLoop } from '../src/kontra.js'

let canvas = document.createElement('canvas');
document.body.appendChild(canvas);
init(canvas);

let loop = gameLoop({
  update() {},
  render() {}
})

loop.start();

// bind(' ', () => {
//   console.log('fire!');
// });

// import kontra from '../src/kontra.js'

// let canvas = document.createElement('canvas');
// document.body.appendChild(canvas);
// kontra.init(canvas);

// debugger;

// kontra.keys.bind(' ', () => {
//   console.log('fire!');
// });