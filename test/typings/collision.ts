import * as kontra from '../../kontra.js';

let collision: boolean = kontra.collides({
  x: 10,
  y: 20,
  width: 100,
  height: 100
}, {
  x: 20,
  y: 40,
  width: 25,
  height: 25
});

// sprites
let sprite1 = kontra.Sprite();
let sprite2 = kontra.Sprite();

let theyCollides = kontra.collides(sprite1, sprite2);

// rotation
sprite1.rotation = Math.PI;
let nope = kontra.collides(sprite1, sprite2);

// anchor
sprite1.anchor = {x: 0.5, y: 0.5};
let withAnchor = kontra.collides(sprite1, sprite2);