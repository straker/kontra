import * as kontra from '../../kontra.js';

// null
let nullSprite: kontra.Sprite = kontra.Sprite();

// inheritance
nullSprite.x += 20;
nullSprite.rotation = Math.PI;
nullSprite.advance();

// color
let colorSprite = kontra.Sprite({
  color: 'red',
  width: 20,
  height: 40,
  x: 20,
  y: 20
});

// image
let image = new Image();
let imageSprite = kontra.Sprite({
  image
});

imageSprite.update();
imageSprite.render();

// animation
let spriteSheet = kontra.SpriteSheet({
  image: kontra.imageAssets.character_walk_sheet,
  frameWidth: 72,
  frameHeight: 97,
  animations: {
    walk: {
      frames: '0..10',
      frameRate: 30
    }
  }
});

let animSprite = kontra.Sprite({
  width: 72 * 2,
  height: 97 * 2,
  anchor: {
    x: 0.5,
    y: 0.5,
  },
  x: 300,
  y: 200,
  animations: spriteSheet.animations
});

animSprite.playAnimation('walk');
let anims = animSprite.animations;
let currAnim = animSprite.currentAnimation;

// class
class CustomSprite extends kontra.Sprite.class {
  constructor(properties?: object) {
    super(properties);
  }
}

let customSprite = new CustomSprite({
  x: 12,
  y: 10
});

// custom props
let propSrpite = kontra.Sprite({
  custom: 'foo'
});
let prop = propSrpite.custom;