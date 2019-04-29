import TileEngine from '../../src/tileEngine.js'
import { loadImage, loadData, load, _reset } from '../../src/assets.js'

describe('tileEngine integration', () => {

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

});