import Sprite from '../../src/sprite.js'
import { collides } from '../../src/collision.js'

// --------------------------------------------------
// collides
// --------------------------------------------------
describe('collides', () => {

  it('should correctly detect collision between two objects', () => {
    let sprite1 = Sprite({
      x: 10,
      y: 20,
      width: 10,
      height: 20
    });

    let sprite2 = Sprite({
      x: 19,
      y: 39,
      width: 10,
      height: 20
    });

    expect(collides(sprite1, sprite2)).to.be.true;

    sprite2.x = 10;
    sprite2.y = 20;

    expect(collides(sprite1, sprite2)).to.be.true;

    sprite2.x = 1;
    sprite2.y = 1;

    expect(collides(sprite1, sprite2)).to.be.true;

    sprite2.x = 20;
    sprite2.y = 40;

    expect(collides(sprite1, sprite2)).to.be.false;

    sprite2.x = 0;
    sprite2.y = 0;

    expect(collides(sprite1, sprite2)).to.be.false;
  });

  it('should take into account sprite.anchor', () => {
    let sprite1 = Sprite({
      x: 10,
      y: 20,
      width: 10,
      height: 20,
      anchor: {
        x: 0.5,
        y: 0.5
      }
    });

    let sprite2 = Sprite({
      x: 10,
      y: 20,
      width: 10,
      height: 20
    });

    expect(collides(sprite1, sprite2)).to.be.true;

    sprite1.anchor = {x: 1, y: 0};

    expect(collides(sprite1, sprite2)).to.be.false;

    sprite2.anchor = {x: 1, y: 0};

    expect(collides(sprite1, sprite2)).to.be.true;
  });

  it('should return null if either sprite is rotated', () => {
    let sprite1 = Sprite({
      x: 10,
      y: 20,
      width: 10,
      height: 20,
      rotation: 1
    });

    let sprite2 = Sprite({
      x: 19,
      y: 39,
      width: 10,
      height: 20
    });

    expect(collides(sprite1, sprite2)).to.equal(null);

    sprite1.rotation = 0;
    sprite2.rotation = 1;

    expect(collides(sprite1, sprite2)).to.equal(null);
  });

  it('should work for non-sprite objects', () => {
    let sprite1 = Sprite({
      x: 10,
      y: 20,
      width: 10,
      height: 20
    });

    let obj = {
      x: 10,
      y: 20,
      width: 10,
      height: 20
    };

    expect(collides(sprite1, obj)).to.be.true;
    expect(collides(obj, sprite1)).to.be.true;
  });

});
