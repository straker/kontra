import * as helpers from '../../src/helpers.js';
import Sprite from '../../src/sprite.js';
import TileEngine from '../../src/tileEngine.js';

// --------------------------------------------------
// helpers
// --------------------------------------------------
describe('helpers', () => {
  it('should export api', () => {
    expect(helpers.degToRad).to.be.an('function');
    expect(helpers.radToDeg).to.be.an('function');
    expect(helpers.angleToTarget).to.be.an('function');
    expect(helpers.rotatePoint).to.be.an('function');
    expect(helpers.movePoint).to.be.an('function');
    expect(helpers.randInt).to.be.an('function');
    expect(helpers.lerp).to.be.an('function');
    expect(helpers.inverseLerp).to.be.an('function');
    expect(helpers.clamp).to.be.an('function');
    expect(helpers.getStoreItem).to.be.an('function');
    expect(helpers.setStoreItem).to.be.an('function');
    expect(helpers.collides).to.be.an('function');
    expect(helpers.getWorldRect).to.be.an('function');
    expect(helpers.depthSort).to.be.an('function');
  });

  // --------------------------------------------------
  // degToRad
  // --------------------------------------------------
  describe('degToRad', () => {
    it('should convert degrees to radians', () => {
      expect(helpers.degToRad(22.35).toFixed(2)).to.equal('0.39');
    });
  });

  // --------------------------------------------------
  // radToDeg
  // --------------------------------------------------
  describe('radToDeg', () => {
    it('should convert radians to degrees', () => {
      expect(helpers.radToDeg(0.39).toFixed(2)).to.equal('22.35');
    });
  });

  // --------------------------------------------------
  // angleToTarget
  // --------------------------------------------------
  describe('angleToTarget', () => {
    it('should return the angle to the target', () => {
      let source = { x: 300, y: 300 };
      let target = { x: 100, y: 100 };
      expect(helpers.angleToTarget(source, target)).to.equal(-Math.PI * 3/4);
      expect(helpers.angleToTarget(target, source)).to.equal(Math.PI / 4);
    });
  });

  // --------------------------------------------------
  // rotatePoint
  // --------------------------------------------------
  describe('rotatePoint', () => {
    it('should return the new x and y after rotation', () => {
      let point = { x: 300, y: 300 };
      let angle = helpers.degToRad(35);
      let newPoint = helpers.rotatePoint(point, angle);
      expect(newPoint.x.toFixed(2)).to.equal('73.67');
      expect(newPoint.y.toFixed(2)).to.equal('417.82');
    });
  });

  // --------------------------------------------------
  // movePoint
  // --------------------------------------------------
  describe('movePoint', () => {
    it('should return the new x and y after move', () => {
      let point = { x: 300, y: 300 };
      let newPoint = helpers.movePoint(point, -Math.PI * 3/4, 141.421);
      expect(newPoint.x).to.be.closeTo(200, 0.1);
      expect(newPoint.y).to.be.closeTo(200, 0.1);

      newPoint = helpers.movePoint(point, Math.PI / 4, 141.421);
      expect(newPoint.x).to.be.closeTo(400, 0.1);
      expect(newPoint.y).to.be.closeTo(400, 0.1);

      newPoint = helpers.movePoint(point, Math.PI, 100);
      expect(newPoint.x).to.be.closeTo(200, 0.1);
      expect(newPoint.y).to.be.closeTo(300, 0.1);
    });
  });

  // --------------------------------------------------
  // randInt
  // --------------------------------------------------
  describe('randInt', () => {
    it('should get random integer between range', () => {
      sinon.stub(Math, 'random').returns(0.25);
      expect(helpers.randInt(2, 10)).to.equal(4);
      Math.random.restore();
    });
  });

  // --------------------------------------------------
  // seedRand
  // --------------------------------------------------
  describe('seedRand', () => {
    it('should seed a random number generator', () => {
      let rand = helpers.seedRand('kontra');
      expect(rand()).to.equal(0.33761959057301283);

      for (let i = 0; i < 20; i++) {
        rand();
      }

      expect(rand()).to.equal(0.5485938163474202);
    });
  });

  // --------------------------------------------------
  // lerp
  // --------------------------------------------------
  describe('lerp', () => {
    it('should calculate the linear interpolation', () => {
      expect(helpers.lerp(10, 20, 0.5)).to.equal(15);
    });

    it('should handle negative numbers', () => {
      expect(helpers.lerp(-10, 20, 0.5)).to.equal(5);
    });

    it('should handle percentages greater than 1', () => {
      expect(helpers.lerp(10, 20, 2)).to.equal(30);
    });

    it('should handle negative percentages', () => {
      expect(helpers.lerp(10, 20, -1)).to.equal(0);
    });
  });

  // --------------------------------------------------
  // inverseLerp
  // --------------------------------------------------
  describe('inverseLerp', () => {
    it('should calculate the inverse linear interpolation', () => {
      expect(helpers.inverseLerp(10, 20, 15)).to.equal(0.5);
    });

    it('should handle negative numbers', () => {
      expect(helpers.inverseLerp(-10, 20, 5)).to.equal(0.5);
    });

    it('should handle percentages greater than 1', () => {
      expect(helpers.inverseLerp(10, 20, 30)).to.equal(2);
    });

    it('should handle negative percentages', () => {
      expect(helpers.inverseLerp(10, 20, 0)).to.equal(-1);
    });
  });

  // --------------------------------------------------
  // clamp
  // --------------------------------------------------
  describe('clamp', () => {
    it('should clamp the value when below min', () => {
      expect(helpers.clamp(10, 20, 5)).to.equal(10);
    });

    it('should clamp the value when above max', () => {
      expect(helpers.clamp(10, 20, 30)).to.equal(20);
    });

    it('should retain the number when between min and max', () => {
      expect(helpers.clamp(10, 20, 15)).to.equal(15);
    });
  });

  // --------------------------------------------------
  // store
  // --------------------------------------------------
  describe('store', () => {
    it('should be able to save all data types to local storage', () => {
      localStorage.clear();

      var fn = function () {
        helpers.setStoreItem('boolean', true);
        helpers.setStoreItem('null', null);
        helpers.setStoreItem('undefined', undefined);
        helpers.setStoreItem('number', 1);
        helpers.setStoreItem('string', 'hello');
        helpers.setStoreItem('object', { foo: 'bar' });
        helpers.setStoreItem('array', [1, 2]);
      };

      expect(fn).to.not.throw(Error);
    });

    it('should be able to read all data types out of local storage', () => {
      expect(helpers.getStoreItem('boolean')).to.equal(true);
      expect(helpers.getStoreItem('number')).to.equal(1);
      expect(helpers.getStoreItem('string')).to.equal('hello');
      expect(helpers.getStoreItem('object')).to.deep.equal({
        foo: 'bar'
      });
      expect(helpers.getStoreItem('array')).to.deep.equal([1, 2]);
    });

    it('should remove a key from local storage using the set function when passed undefined', () => {
      helpers.setStoreItem('number', undefined);

      expect(helpers.getStoreItem('number')).to.not.be.true;
    });
  });

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

      expect(helpers.collides(sprite1, sprite2)).to.be.true;

      sprite2.x = 10;
      sprite2.y = 20;

      expect(helpers.collides(sprite1, sprite2)).to.be.true;

      sprite2.x = 1;
      sprite2.y = 1;

      expect(helpers.collides(sprite1, sprite2)).to.be.true;

      sprite2.x = 20;
      sprite2.y = 40;

      expect(helpers.collides(sprite1, sprite2)).to.be.false;

      sprite2.x = 0;
      sprite2.y = 0;

      expect(helpers.collides(sprite1, sprite2)).to.be.false;
    });

    it('should take into account sprite.anchor', () => {
      let sprite1 = Sprite({
        x: 10,
        y: 20,
        width: 10,
        height: 20,
        anchor: { x: 0.5, y: 0.5 }
      });

      let sprite2 = Sprite({
        x: 10,
        y: 20,
        width: 10,
        height: 20
      });

      expect(helpers.collides(sprite1, sprite2)).to.be.true;

      sprite1.anchor = { x: 1, y: 0 };

      expect(helpers.collides(sprite1, sprite2)).to.be.false;

      sprite2.anchor = { x: 1, y: 0 };

      expect(helpers.collides(sprite1, sprite2)).to.be.true;
    });

    it('should take into account sprite.scale', () => {
      let sprite1 = Sprite({
        x: 5,
        y: 20,
        width: 10,
        height: 20,
        scaleX: 1,
        scaleY: 1
      });

      let sprite2 = Sprite({
        x: 10,
        y: 20,
        width: 10,
        height: 20
      });

      expect(helpers.collides(sprite1, sprite2)).to.be.true;

      sprite1.scaleX = 0.5;
      sprite1.scaleY = 0.5;

      expect(helpers.collides(sprite1, sprite2)).to.be.false;

      sprite1.scaleX = 2;
      sprite1.scaleY = 2;

      expect(helpers.collides(sprite1, sprite2)).to.be.true;
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

      expect(helpers.collides(sprite1, obj)).to.be.true;
      expect(helpers.collides(obj, sprite1)).to.be.true;
    });
  });

  // --------------------------------------------------
  // getWorldRect
  // --------------------------------------------------
  describe('getWorldRect', () => {
    it('should return world x, y, width, and height', () => {
      let sprite = Sprite({
        x: 40,
        y: 40,
        width: 10,
        height: 10
      });
      let rect = helpers.getWorldRect(sprite);

      expect(rect.x).to.equal(40);
      expect(rect.y).to.equal(40);
      expect(rect.width).to.equal(10);
      expect(rect.height).to.equal(10);
    });

    it('should take into account negative scale', () => {
      let sprite = Sprite({
        x: 40,
        y: 40,
        width: 10,
        height: 20,
        scaleX: -2,
        scaleY: -2
      });
      let rect = helpers.getWorldRect(sprite);

      expect(rect.x).to.equal(20);
      expect(rect.y).to.equal(0);
      expect(rect.width).to.equal(20);
      expect(rect.height).to.equal(40);
    });

    it('should take into account anchor', () => {
      let sprite = Sprite({
        x: 40,
        y: 40,
        width: 10,
        height: 10,
        anchor: { x: 0.5, y: 0.5 }
      });
      let rect = helpers.getWorldRect(sprite);

      expect(rect.x).to.equal(35);
      expect(rect.y).to.equal(35);

      sprite.anchor = { x: 1, y: 1 };
      rect = helpers.getWorldRect(sprite);

      expect(rect.x).to.equal(30);
      expect(rect.y).to.equal(30);
    });

    it('should use objects world x, y, width, and height', () => {
      let sprite = {
        x: 40,
        y: 40,
        width: 10,
        height: 10,
        world: {
          x: 10,
          y: 20,
          width: 20,
          height: 30
        }
      };
      let rect = helpers.getWorldRect(sprite);

      expect(rect.x).to.equal(10);
      expect(rect.y).to.equal(20);
      expect(rect.width).to.equal(20);
      expect(rect.height).to.equal(30);
    });

    it('should work for tileEngine', () => {
      let tileEngine = TileEngine({
        width: 10,
        height: 12,
        tilewidth: 32,
        tileheight: 32,
        tilesets: []
      });
      let rect = helpers.getWorldRect(tileEngine);

      expect(rect.x).to.equal(0);
      expect(rect.y).to.equal(0);
      expect(rect.width).to.equal(320);
      expect(rect.height).to.equal(384);
    });
  });

  // --------------------------------------------------
  // depthSort
  // --------------------------------------------------
  describe('depthSort', () => {
    it('should return the difference between the y props', () => {
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

      let value = helpers.depthSort(sprite1, sprite2);

      expect(value).to.equal(-19);
    });

    it('should take into account anchor', () => {
      let sprite1 = Sprite({
        x: 40,
        y: 40,
        width: 10,
        height: 10,
        anchor: { x: 0.5, y: 0.5 }
      });

      let sprite2 = Sprite({
        x: 40,
        y: 40,
        width: 10,
        height: 10,
        anchor: { x: 1, y: 1 }
      });

      let value = helpers.depthSort(sprite1, sprite2);

      expect(value).to.equal(5);
    });

    it('should use objects world x, y, width, and height', () => {
      let sprite1 = {
        x: 40,
        y: 40,
        width: 10,
        height: 10,
        world: {
          x: 10,
          y: 20,
          width: 20,
          height: 30
        }
      };

      let sprite2 = Sprite({
        x: 19,
        y: 39,
        width: 10,
        height: 20
      });

      let value = helpers.depthSort(sprite1, sprite2);

      expect(value).to.equal(-19);
    });

    it('should accept different prop to compare', () => {
      let sprite1 = Sprite({
        x: 10,
        y: 20,
        width: 10,
        height: 20
      });

      let sprite2 = Sprite({
        x: 20,
        y: 39,
        width: 10,
        height: 20
      });

      let value = helpers.depthSort(sprite1, sprite2, 'x');

      expect(value).to.equal(-10);
    });
  });
});
