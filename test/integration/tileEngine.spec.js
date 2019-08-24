import TileEngine from '../../src/tileEngine.js'
import Sprite from '../../src/sprite.js'
import { loadImage, loadData, load, _reset } from '../../src/assets.js'
import { init, getCanvas } from '../../src/core.js'

describe('tileEngine integration', () => {

  before(() => {
    if (!getCanvas()) {
      let canvas = document.createElement('canvas');
      canvas.width = canvas.height = 600;
      init(canvas);
    }
  });

  beforeEach(() => {
    _reset();
  });

  afterEach(() => {
    _reset();
  });

  it('should resolve tileset image', done => {
    loadImage('/imgs/bullet.png').then(image => {
      let tileEngine = TileEngine({
        tilesets: [{
          image: '/imgs/bullet.png'
        }]
      });

      expect(tileEngine.tilesets[0].image).to.equal(image);
      done();
    })
    .catch(done);
  });

  it('should resolve tileset source', done => {
    loadData('/data/test.json').then(data => {
      let tileEngine = TileEngine({
        tilesets: [{
          source: '/data/test.json'
        }]
      });

      expect(tileEngine.tilesets[0].foo).to.equal('bar');
      done();
    })
    .catch(done);
  });

  it('should resolve tileset source and the image of the source', done => {
    load('/data/source.json', '/imgs/bullet.png').then(assets => {
      let tileEngine = TileEngine({
        tilesets: [{
          source: '/data/source.json'
        }]
      });

      expect(tileEngine.tilesets[0].image).to.equal(assets[1]);
      done();
    })
    .catch(done);
  });

  it('should throw an error if trying to resolve a tileset image without using needed asset function', () => {
    function func() {
      let tileEngine = TileEngine({
        tilesets: [{
          image: '/imgs/bullet.png'
        }]
      });
    }

    expect(func).to.throw();
  });

  it('should throw an error if the image was not loaded', () => {
    loadImage('/fake.png');

    function func() {
      let tileEngine = TileEngine({
        tilesets: [{
          image: '/imgs/bullet.png'
        }]
      });
    }

    expect(func).to.throw();
  });

  it('should throw an error if trying to resolve a tileset source without using needed asset function', () => {
    function func() {
      let tileEngine = TileEngine({
        tilesets: [{
          source: '/data/test.json'
        }]
      });
    }

    expect(func).to.throw();
  });

  it('should throw an error if the source was not loaded', () => {
    loadData('/fake.json');

    function func() {
      let tileEngine = TileEngine({
        tilesets: [{
          source: '/data/test.json'
        }]
      });
    }

    expect(func).to.throw();
  });

it('should sync camera with sprite camera when added', () => {
    let data = {
      tilewidth: 10,
      tileheight: 10,
      width: 50,
      height: 50,
      tilesets: [{
        image: new Image()
      }],
      layers: [{
        name: 'test',
        data: [0,0,1,0,0]
      }]
    }
    let tileEngine = TileEngine(data);

    let sprite = Sprite({
      x: 10,
      y: 10
    });

    tileEngine.sx = 100;
    tileEngine.sy = 100;
    tileEngine.addObject(sprite);

    expect(sprite.x).to.equal(10);
    expect(sprite.y).to.equal(10);
    expect(sprite.sx).to.equal(-100);
    expect(sprite.sy).to.equal(-100);
  });

  it('should sync camera with sprite camera when camera is changed', () => {
    let data = {
      tilewidth: 10,
      tileheight: 10,
      width: 50,
      height: 50,
      tilesets: [{
        image: new Image()
      }],
      layers: [{
        name: 'test',
        data: [0,0,1,0,0]
      }]
    }
    let tileEngine = TileEngine(data);

    let sprite = Sprite({
      x: 10,
      y: 10,
    });

    tileEngine.addObject(sprite);

    expect(sprite.x).to.equal(10);
    expect(sprite.y).to.equal(10);
    expect(sprite.sx).to.equal(0);
    expect(sprite.sy).to.equal(0);

    tileEngine.sx = 100;
    tileEngine.sy = 100;

    expect(sprite.x).to.equal(10);
    expect(sprite.y).to.equal(10);
    expect(sprite.sx).to.equal(-100);
    expect(sprite.sy).to.equal(-100);
  });

});