import { init, GameLoop, Sprite, initKeys, keyPressed  } from '../src/kontra.js'

let { canvas } = init(); // initialize kontra
initKeys();

let sprite = Sprite({
  x: 100,
  y: 80,
  color: 'red',
  width: 20,
  height: 40,
  dx: 2
});

let loop = GameLoop({
  update: function() {
   if (keyPressed('left')) {
     sprite.dx = -2;
   }
   else if (keyPressed('right')) {
     sprite.dx = 2;
   }

    sprite.update();
    if (sprite.x > canvas.width) {
      sprite.x = -sprite.width;
    }
    if (sprite.x < -sprite.width) {
      sprite.x = canvas.width;
    }
  },
  render: function() {
    sprite.render();
  }
});

loop.start();