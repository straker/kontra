// import { init, Sprite, GameLoop, getCanvas } from '../src/kontra.js'

// let canvas = document.createElement('canvas');
// document.body.appendChild(canvas);
// init(canvas);

// // create a basic sprite with a velocity
// window.sprite = Sprite({
//   x: 290,
//   y: 100,
//   dx: 3,
//   dy: 0,
//   width: 20,
//   height: 40,
//   color: 'red'
// });

// // create the game loop to update and render the sprite
// window.loop = GameLoop({
//   update: function() {
//     sprite.update();

//     // reset the sprites position when it reaches the edge of the game
//     if (sprite.x > getCanvas().width) {
//       sprite.x = -sprite.width;
//     }
//   },
//   render: function() {
//     sprite.render();
//   }
// });

// // start the loop
// loop.start();

import kontra from '../src/kontra.js'

let canvas = document.createElement('canvas');
document.body.appendChild(canvas);
kontra.init(canvas);

// create a basic sprite with a velocity
window.sprite = kontra.Sprite({
  x: 290,
  y: 100,
  dx: 3,
  dy: 0,
  width: 20,
  height: 40,
  color: 'red'
});

// create the game loop to update and render the sprite
window.loop = kontra.GameLoop({
  update: function() {
    sprite.update();

    // reset the sprites position when it reaches the edge of the game
    if (sprite.x > kontra.getCanvas().width) {
      sprite.x = -sprite.width;
    }
  },
  render: function() {
    sprite.render();
  }
});

// start the loop
loop.start();