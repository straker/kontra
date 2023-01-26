import TileEngine from '../../src/tileEngine.js';
import {
  loadImage,
  loadData,
  load,
  _reset
} from '../../src/assets.js';
import * as pointer from '../../src/pointer.js';
import { noop } from '../../src/utils.js';
import { emit } from '../../src/events.js';
import { init, getCanvas } from '../../src/core.js';

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
    loadImage('/imgs/bullet.png')
      .then(image => {
        let tileEngine = TileEngine({
          tilesets: [
            {
              image: '/imgs/bullet.png'
            }
          ]
        });

        expect(tileEngine.tilesets[0].image).to.equal(image);
        done();
      })
      .catch(done);
  });

  it('should resolve tileset source', done => {
    loadData('/data/test.json')
      .then(() => {
        let tileEngine = TileEngine({
          tilesets: [
            {
              source: '/data/test.json'
            }
          ]
        });

        expect(tileEngine.tilesets[0].foo).to.equal('bar');
        done();
      })
      .catch(done);
  });

  it('should resolve tileset image from json data', done => {
    // to make this property fail we need to return a nested path
    load('/data/tileset/tileset.json', '/data/tileset/bullet.png')
      .then(assets => {
        let tileEngine = TileEngine(assets[0]);
        expect(tileEngine.tilesets[0].image).to.equal(assets[1]);
        done();
      })
      .catch(done);
  });

  it('should resolve tileset source and the image of the source', done => {
    load('/data/source.json', '/imgs/bullet.png')
      .then(assets => {
        let tileEngine = TileEngine({
          tilesets: [
            {
              source: '/data/source.json'
            }
          ]
        });

        expect(tileEngine.tilesets[0].image).to.equal(assets[1]);
        done();
      })
      .catch(done);
  });

  it('should throw an error if trying to resolve a tileset image without using needed asset function', () => {
    function func() {
      TileEngine({
        tilesets: [
          {
            image: '/imgs/bullet.png'
          }
        ]
      });
    }

    expect(func).to.throw();
  });

  it('should throw an error if the image was not loaded', () => {
    loadImage('/fake.png');

    function func() {
      TileEngine({
        tilesets: [
          {
            image: '/imgs/bullet.png'
          }
        ]
      });
    }

    expect(func).to.throw();
  });

  it('should throw an error if trying to resolve a tileset source without using needed asset function', () => {
    function func() {
      TileEngine({
        tilesets: [
          {
            source: '/data/test.json'
          }
        ]
      });
    }

    expect(func).to.throw();
  });

  it('should throw an error if the source was not loaded', () => {
    loadData('/fake.json');

    function func() {
      TileEngine({
        tilesets: [
          {
            source: '/data/test.json'
          }
        ]
      });
    }

    expect(func).to.throw();
  });

  it('should correctly track objects with pointer when camera is moved', done => {
    load('/data/tileset/tileset.json', '/data/tileset/bullet.png')
      .then(assets => {
        let tileEngine = TileEngine(assets[0]);
        let pntr = pointer.initPointer({ radius: 1 });
        let object = {
          x: 100,
          y: 50,
          width: 10,
          height: 20,
          render: noop
        };

        tileEngine.add(object);
        pointer.track(object);
        object.render();
        emit('tick');

        tileEngine.mapwidth = 900;

        pntr.x = 105;
        pntr.y = 55;
        expect(pointer.pointerOver(object)).to.equal(true);

        tileEngine.sx = 100;
        expect(pointer.pointerOver(object)).to.equal(false);

        pntr.x = 5;
        expect(pointer.pointerOver(object)).to.equal(true);
        done();
      })
      .catch(done);
  });
});
