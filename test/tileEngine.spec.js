// --------------------------------------------------
// kontra.tileEngine
// --------------------------------------------------
describe('kontra.tileEngine', function() {

  before(function() {
    if (!kontra.canvas) {
      var canvas = document.createElement('canvas');
      canvas.width = canvas.height = 600;
      kontra.init(canvas);
    }
  });

  // --------------------------------------------------
  // kontra.tileEngine.init
  // --------------------------------------------------
  describe('init', function() {
    it('should initialize properties on the tile engine', function() {
      var data = {
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
      var tileEngine = kontra.tileEngine(data);

      expect(tileEngine.tilewidth).to.equal(data.tilewidth);
      expect(tileEngine.tileheight).to.equal(data.tileheight);
      expect(tileEngine.width).to.equal(data.width);
      expect(tileEngine.height).to.equal(data.height);
      expect(tileEngine.tilesets).to.equal(data.tilesets);
      expect(tileEngine.layers).to.equal(data.layers);
      expect(tileEngine.mapWidth).to.equal(500);
      expect(tileEngine.mapHeight).to.equal(500);
    });

    it('should resolve tileset image', function() {
      let url = new URL('../../car.png', window.location.href);
      let image = new Image(100, 100);
      kontra.assets.images[url] = image

      var tileEngine = kontra.tileEngine({
        tilesets: [{
          image: '../../car.png'
        }]
      });

      expect(tileEngine.tilesets[0].image).to.equal(image);
    });

    it('should resolve tileset source', function() {
      let url = new URL('/foo/bar/source.json', window.location.href);
      kontra.assets.data[url] = {
        foo: 'bar'
      };

      var tileEngine = kontra.tileEngine({
        tilesets: [{
          source: '/foo/bar/source.json'
        }]
      });

      expect(tileEngine.tilesets[0].foo).to.equal('bar');
    });

    it('should resolve tileset source and the image of the source', function() {
      let sourceUrl = new URL('/foo/bar/source.json', window.location.href);
      let imageUrl = new URL('../../car.png', window.location.href);
      let image = new Image(100, 100);

      kontra.assets.images[imageUrl] = image
      kontra.assets.data[sourceUrl] = {
        image: '../../car.png'
      };

      var tileEngine = kontra.tileEngine({
        tilesets: [{
          source: '/foo/bar/source.json'
        }]
      });

      expect(tileEngine.tilesets[0].image).to.equal(image);
    });
  });





  // --------------------------------------------------
  // kontra.tileEngine.render
  // --------------------------------------------------
  describe('render', function() {
    it('renders the tileEngine', function() {
      var tileEngine = kontra.tileEngine({
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
      });

      sinon.stub(kontra.context, 'drawImage').callsFake(kontra._noop);
      tileEngine.render();

      expect(kontra.context.drawImage.called).to.be.ok;

      kontra.context.drawImage.restore();
    });
  });





  // --------------------------------------------------
  // kontra.tileEngine.layerCollidesWith
  // --------------------------------------------------
  describe('layerCollidesWith', function() {
    var tileEngine;

    beforeEach(function() {
      tileEngine = kontra.tileEngine({
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
      });
    });

    it('should return false if the object does not collide', function() {
      var collides = tileEngine.layerCollidesWith('test', {
        x: 10,
        y: 10,
        height: 10,
        width: 10
      });

      expect(collides).to.equal(false);
    });

    it('should return true if the object collides', function() {
      var collides = tileEngine.layerCollidesWith('test', {
        x: 25,
        y: 5,
        height: 10,
        width: 10
      });

      expect(collides).to.equal(true);
    });

    it('should handle sprites off the map', function() {
      var collides = tileEngine.layerCollidesWith('test', {
        x: 100,
        y: 100,
        height: 100,
        width: 100
      });

      expect(collides).to.equal(false);
    });

  });





  // --------------------------------------------------
  // kontra.tileEngine.tileAtLayer
  // --------------------------------------------------
  describe('tileAtLayer', function() {
    var tileEngine;

    beforeEach(function() {
      tileEngine = kontra.tileEngine({
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
      });
    });

    it('should return the correct tile using x, y coordinates', function() {
      expect(tileEngine.tileAtLayer('test', {x: 0, y: 0})).to.equal(0);
      expect(tileEngine.tileAtLayer('test', {x: 10, y: 5})).to.equal(0);
      expect(tileEngine.tileAtLayer('test', {x: 20, y: 9})).to.equal(1);
      expect(tileEngine.tileAtLayer('test', {x: 30, y: 10})).to.equal(undefined);
      expect(tileEngine.tileAtLayer('test', {x: 40, y: 1})).to.equal(0);
    });

    it('should return the correct tile using row, col coordinates', function() {
      expect(tileEngine.tileAtLayer('test', {row: 0, col: 0})).to.equal(0);
      expect(tileEngine.tileAtLayer('test', {row: 0, col: 1})).to.equal(0);
      expect(tileEngine.tileAtLayer('test', {row: 0, col: 2})).to.equal(1);
      expect(tileEngine.tileAtLayer('test', {row: 1, col: 3})).to.equal(undefined);
      expect(tileEngine.tileAtLayer('test', {row: 0, col: 4})).to.equal(0);
    });

    it('should not process out of bound positions', function() {
      expect(tileEngine.tileAtLayer('test', {x: -10, y: 0})).to.equal(undefined);
    });

  });





  // --------------------------------------------------
  // kontra.tileEngine.renderLayer
  // --------------------------------------------------
  describe('renderLayer', function() {

    it('should correctly render a layer', function() {
     var image = new Image(100, 100);

      var tileEngine = kontra.tileEngine({
        tilewidth: 10,
        tileheight: 10,
        width: 2,
        height: 10,
        tilesets: [{
          image: image
        }],
        layers: [{
          name: 'test',
          data: [0,0,1,0,0]
        }]
      });

      sinon.stub(kontra.context, 'drawImage').callsFake(kontra._noop);
      tileEngine.renderLayer('test');

      expect(kontra.context.drawImage.called).to.be.ok;
      expect(kontra.context.drawImage.calledWith(
        tileEngine.layerCanvases.test,
        0, 0, kontra.canvas.width, kontra.canvas.height,
        0, 0, kontra.canvas.width, kontra.canvas.height
      )).to.be.ok;

      kontra.context.drawImage.restore();
    });

    it('should account for sx and sy', function() {
    var image = new Image(50, 50);

      var tileEngine = kontra.tileEngine({
        tilewidth: 10,
        tileheight: 10,
        width: 10,
        height: 10,
        tilesets: [{
          image: image
        }],
        layers: [{
          name: 'test',
          data: [
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [0,0,0,0,0,0,0,1,0,0],
            [],
            []
          ]
        }]
      });

      sinon.stub(kontra.context, 'drawImage').callsFake(kontra._noop);

      tileEngine.sx = 50;
      tileEngine.sy = 50;

      tileEngine.renderLayer('test');

      expect(kontra.context.drawImage.called).to.be.ok;
      expect(kontra.context.drawImage.calledWith(
        tileEngine.layerCanvases.test,
        tileEngine.sx, tileEngine.sy, kontra.canvas.width, kontra.canvas.height,
        0, 0, kontra.canvas.width, kontra.canvas.height
      )).to.be.ok;

      kontra.context.drawImage.restore();
    });

    it('only draws a layer once', function() {
      var image = new Image(100, 100);

      var tileEngine = kontra.tileEngine({
        tilewidth: 10,
        tileheight: 10,
        width: 2,
        height: 10,
        tilesets: [{
          image: image
        }],
        layers: [{
          name: 'test',
          visible: true,
          data: [0,0,1,0,0]
        }]
      });

      sinon.stub(tileEngine, '_r').callsFake(kontra._noop);

      tileEngine.renderLayer('test');
      tileEngine.renderLayer('test');

      expect(tileEngine._r.calledOnce).to.be.ok;

      tileEngine._r.restore();
    });

    it('uses the correct tileset', function() {
      var image = new Image(100, 100);

      let called = false;
      var tileEngine = kontra.tileEngine({
        tilewidth: 10,
        tileheight: 10,
        width: 2,
        height: 10,
        tilesets: [{
          firstgid: 1,
          image: image
        },
        {
          firstgid: 50,
          image: image
        },
        {
          get firstgid() {
            called = true;
            return 100;
          },
          image: image
        }],
        layers: [{
          name: 'test',
          data: [0,0,49,0,0]
        }]
      });

      tileEngine.renderLayer('test');

      expect(called).to.be.ok;
    });

  });

});