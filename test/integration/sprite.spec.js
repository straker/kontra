import Sprite from '../../src/sprite.js';
import SpriteSheet from '../../src/spriteSheet.js';
import { track, initPointer } from '../../src/pointer.js';

describe('sprite integration', () => {
  it('should clone spriteSheet animations to prevent frame corruption ', () => {
    let spriteSheet = SpriteSheet({
      image: new Image(100, 200),
      frameWidth: 10,
      frameHeight: 10,
      animations: {
        walk: {
          frames: '1..10',
          frameRate: 30
        }
      }
    });

    let sprite1 = Sprite({
      animations: spriteSheet.animations
    });
    let sprite2 = Sprite({
      animations: spriteSheet.animations
    });
    let sprite3 = Sprite();
    sprite3.animations = spriteSheet.animations;

    expect(sprite1.animations.walk).to.not.equal(
      sprite2.animations.walk
    );
    expect(sprite1.animations.walk).to.not.equal(
      sprite3.animations.walk
    );
    expect(sprite2.animations.walk).to.not.equal(
      sprite3.animations.walk
    );

    for (let i = 0; i < 7; i++) {
      sprite1.update();
    }

    expect(sprite1.animations.walk._f).to.equal(3);
    expect(sprite2.animations.walk._f).to.equal(0);
    expect(sprite3.animations.walk._f).to.equal(0);
  });

  it('should not corrupt frames when playing animation', () => {
    let spriteSheet = SpriteSheet({
      image: new Image(100, 200),
      frameWidth: 10,
      frameHeight: 10,
      animations: {
        walk: {
          frames: '1..10',
          frameRate: 30
        }
      }
    });

    let sprite1 = Sprite({
      animations: spriteSheet.animations
    });
    let sprite2 = Sprite({
      animations: spriteSheet.animations
    });
    let sprite3 = Sprite();
    sprite3.animations = spriteSheet.animations;

    sprite1.playAnimation('walk');
    sprite2.playAnimation('walk');
    sprite3.playAnimation('walk');

    for (let i = 0; i < 7; i++) {
      sprite1.update();
    }

    expect(sprite1.animations.walk._f).to.equal(3);
    expect(sprite2.animations.walk._f).to.equal(0);
    expect(sprite3.animations.walk._f).to.equal(0);
  });

  it('should render when tracked by pointer', () => {
    initPointer();
    let spy = sinon.spy();

    let sprite = Sprite({
      x: 100,
      y: 200,
      color: 'red',
      render: spy
    });

    track(sprite);
    sprite.render();

    // retain _r as radius
    expect(typeof sprite._r).to.not.equal('function');

    // retain _rf as render function
    expect(sprite._rf).to.equal(spy);
  });
});
