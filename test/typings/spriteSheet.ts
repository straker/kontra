import * as kontra from '../../kontra.js';

let spriteSheet: kontra.SpriteSheet = kontra.SpriteSheet({
  image: new Image(),
  frameWidth: 32,
  frameHeight: 32
});

let width: number = spriteSheet.frame.width;
let height: number = spriteSheet.frame.height;
let margin: number = spriteSheet.frame.margin;

spriteSheet.createAnimations({
  walk: {
    frames: 1,
    frameRate: 20
  }
});

// options
kontra.SpriteSheet({
  image: new Image(),
  frameWidth: 32,
  frameHeight: 32,
  frameMargin: 32,
  animations: {
    walk: {
      frames: 1,
      frameRate: 20,
      loop: false
    }
  }
});

// extends
class CustomSpriteSheet extends kontra.SpriteSheetClass {}
let mySpriteSheet = new CustomSpriteSheet({
  image: new Image(),
  frameWidth: 32,
  frameHeight: 32
});
mySpriteSheet.createAnimations({
  walk: {
    frames: 1,
    frameRate: 20
  }
});