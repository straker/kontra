import * as kontra from '../../kontra.js';

// animation
let spriteSheet: kontra.SpriteSheet = kontra.SpriteSheet({
  image: kontra.imageAssets.character_walk_sheet,
  frameWidth: 72,
  frameHeight: 97
});

let animation: kontra.Animation = kontra.Animation({
  spriteSheet: spriteSheet,
  frames: [1,2,3,4],
  frameRate: 35
});

animation.update();
animation.update(1/60);
animation.render({x: 10, y: 20});
animation.reset();

let spriteSheetAnim: kontra.SpriteSheet = animation.spriteSheet;
let frames: number[] = animation.frames;
let frameRate: number = animation.frameRate;
let loop: boolean = animation.loop;
let width: number = animation.width;
let height: number = animation.height;
let margin: number = animation.margin;

// clone
let clone: kontra.Animation = animation.clone();

// loop
let loopAnim = kontra.Animation({
  spriteSheet: spriteSheet,
  frames: [1,2,3,4],
  frameRate: 35,
  loop: false
});

// render props
let context = document.createElement('canvas').getContext('2d');
loopAnim.render({
  x: 10,
  y: 20,
  width: 100,
  height: 100,
  context: context
});

// extends
class CustomAnimation extends kontra.AnimationClass {}
let myAnim = new CustomAnimation({
  spriteSheet: spriteSheet,
  frames: [1,2,3,4],
  frameRate: 35
});
myAnim.update();