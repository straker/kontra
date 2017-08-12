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

    it('should log an error if no dimensions are passed', function() {
      function func() {
        kontra.tileEngine();
      }

      expect(func).to.throw();
    });

    it('should initialize properties on the tile engine', function() {
      var tileEngine = kontra.tileEngine({
        tileWidth: 10,
        tileHeight: 10,
        width: 100,
        height: 150,
        properties: {
          mapWidth: 1000,
          mapHeight: 1500
        }
      });

      expect(tileEngine.mapWidth).to.equal(1000);
      expect(tileEngine.mapHeight).to.equal(1500);
    });

    it('should accept lowercase tilewidth and tileheight', function() {
      var tileEngine = kontra.tileEngine({
        tilewidth: 10,
        tileheight: 10,
        width: 100,
        height: 150,
        properties: {
          mapWidth: 1000,
          mapHeight: 1500
        }
      });

      expect(tileEngine.tileWidth).to.equal(10);
      expect(tileEngine.tileHeight).to.equal(10);
    });

    it('should call addLayers() and addTilesets() if passed', function() {
      tileEngine = kontra.tileEngine({
        tileWidth: 10,
        tileHeight: 10,
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

      expect(tileEngine.layers.test).to.exist;
      expect(tileEngine.tilesets.length).to.equal(1);
    });

  });





  // --------------------------------------------------
  // kontra.tileEngine.addTilesets
  // --------------------------------------------------
  describe('addTilesets', function() {
    var tileEngine;

    beforeEach(function() {
      tileEngine = kontra.tileEngine({
        tileWidth: 10,
        tileHeight: 10,
        width: 50,
        height: 50
      });
    });

    it('should log an error if no image is provided', function() {
      function func() {
        tileEngine.addTilesets({});
      }

      expect(func).to.throw();
    });

    it('should accept an array of tilesets', function() {
      tileEngine.addTilesets([{
        image: new Image(100, 100),
        firstGrid: 0
      },
      {
        image: new Image(100, 100),
        firstGrid: 17
      }]);

      expect(tileEngine.tilesets.length).to.equal(2);
    });

    it('should check for the image in kontra.assets.images if it\'s a string', function() {
      kontra.assets.images.car = new Image(100, 100);

      tileEngine.addTilesets({
        image: 'car'
      });

      expect(tileEngine.tilesets[0].image).to.equal(kontra.assets.images.car);
    });

    it('should check a deep image path in kontra.assets.images if it\'s a string', function() {
      kontra.assets.images['/path/to/image/car'] = new Image(100, 100);

      tileEngine.addTilesets({
        image: '/path/to/image/car'
      });

      expect(tileEngine.tilesets[0].image).to.equal(kontra.assets.images['/path/to/image/car']);
    });

    it('should check for relative paths in kontra.assets.images if it\'s a string', function() {
      kontra.assets.images['/path/to/image/car'] = new Image(100, 100);

      tileEngine.addTilesets({
        image: '../../root/path/to/image/car'
      });

      expect(tileEngine.tilesets[0].image).to.equal(kontra.assets.images['/path/to/image/car']);
    });

    it('should use firstGrid if passed', function() {
      tileEngine.addTilesets({
        image: new Image(100, 100),
        firstGrid: 17
      });

      expect(tileEngine.tilesets[0].firstGrid).to.equal(17);
      expect(tileEngine.tilesets[0].lastGrid).to.equal(116);
    });

    it('should calculate first and last grid number correctly', function() {
      tileEngine.addTilesets({
        image: new Image(100, 100)
      });

      expect(tileEngine.tilesets[0].firstGrid).to.equal(1);
      expect(tileEngine.tilesets[0].lastGrid).to.equal(100);
    });

    it('should calculate first and last grid number when there is a tileset already added', function() {
      tileEngine.addTilesets({
        image: new Image(100, 100)
      });

      tileEngine.addTilesets({
        image: new Image(100, 100)
      });

      expect(tileEngine.tilesets[1].firstGrid).to.equal(101);
      expect(tileEngine.tilesets[1].lastGrid).to.equal(200);
    });

    it('should calculate first and last grid number correctly for multiple tilesets', function() {
      tileEngine.addTilesets({
        image: new Image(200, 200)
      });

      tileEngine.addTilesets({
        image: new Image(150, 150)
      });

      tileEngine.addTilesets({
        image: new Image(32, 64)
      });

      expect(tileEngine.tilesets[0].firstGrid).to.equal(1);
      expect(tileEngine.tilesets[0].lastGrid).to.equal(400);

      expect(tileEngine.tilesets[1].firstGrid).to.equal(401);
      expect(tileEngine.tilesets[1].lastGrid).to.equal(625);

      expect(tileEngine.tilesets[2].firstGrid).to.equal(626);
      expect(tileEngine.tilesets[2].lastGrid).to.equal(643);
    });

  });





  // --------------------------------------------------
  // kontra.tileEngine.addLayers
  // --------------------------------------------------
  describe('addLayers', function() {
    var tileEngine;

    beforeEach(function() {
      tileEngine = kontra.tileEngine({
        tileWidth: 10,
        tileHeight: 10,
        width: 3,
        height: 3
      });

      tileEngine.addTilesets({
        image: new Image()
      })
    });

    it('should accept a 1d array', function() {
      tileEngine.addLayers({
        name: 'test',
        data: [0,0,1,0,0]
      });

      expect(tileEngine.layers.test.data[0]).to.equal(0);
      expect(tileEngine.layers.test.data[1]).to.equal(0);
      expect(tileEngine.layers.test.data[2]).to.equal(1);
      expect(tileEngine.layers.test.data[3]).to.equal(0);
      expect(tileEngine.layers.test.data[4]).to.equal(0);
    });

    it('should flatten a 2d tile data array', function() {
      tileEngine.addLayers({
        name: 'test',
        data: [[0,0],[1,0,0]]
      });

      expect(tileEngine.layers.test.data[0]).to.equal(0);
      expect(tileEngine.layers.test.data[1]).to.equal(0);
      expect(tileEngine.layers.test.data[2]).to.equal(0);
      expect(tileEngine.layers.test.data[3]).to.equal(1);
      expect(tileEngine.layers.test.data[4]).to.equal(0);
      expect(tileEngine.layers.test.data[5]).to.equal(0);
    });

    it('should accept an array of layers', function() {
      tileEngine.addLayers([{
        name: 'test',
        data: [0,0,1,0,0]
      },
      {
        name: 'collision',
        data: [1,1,0,1,1]
      }]);

      expect(tileEngine.layers.test).to.exist;
      expect(tileEngine.layers.collision).to.exist;
    });

    it('should add properties from the tileset', function() {
      tileEngine.addLayers({
        name: 'test',
        data: [0,0,1,0,0],
        properties: {
          foo: 'bar'
        }
      });

      expect(tileEngine.layers.test.foo).to.equal('bar');
    });

    it('should add the tileset in the correct order', function() {
      tileEngine.addLayers({
        name: 'test',
        data: [0,0,1,0,0],
        zIndex: 1
      });

      tileEngine.addLayers({
        name: 'test2',
        data: [0,0,1,0,0],
        zIndex: -1
      });

      tileEngine.addLayers({
        name: 'test3',
        data: [0,0,1,0,0],
        zIndex: 10
      });

      expect(tileEngine._layerOrder[0]).to.equal('test2');
      expect(tileEngine._layerOrder[1]).to.equal('test');
      expect(tileEngine._layerOrder[2]).to.equal('test3');
    });

    it('should not order the tileset if it is not being rendered', function() {
      tileEngine.addLayers({
        name: 'test',
        data: [0,0,1,0,0],
        render: false
      });

      expect(tileEngine._layerOrder.length).to.equal(0);
    });

  });





  // --------------------------------------------------
  // kontra.tileEngine.layerCollidesWith
  // --------------------------------------------------
  describe('layerCollidesWith', function() {
    var tileEngine;

    beforeEach(function() {
      tileEngine = kontra.tileEngine({
        tileWidth: 10,
        tileHeight: 10,
        width: 50,
        height: 50
      });

      tileEngine.addTilesets({
        image: new Image()
      });

      tileEngine.addLayers({
        name: 'test',
        data: [0,0,1,0,0]
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
        tileWidth: 10,
        tileHeight: 10,
        width: 50,
        height: 50
      });

      tileEngine.addTilesets({
        image: new Image()
      });

      tileEngine.addLayers({
        name: 'test',
        data: [0,0,1,0,0]
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
      var canvas = document.createElement('canvas');
      canvas.width = 20;
      canvas.height = 30;

      var context = canvas.getContext('2d');
      var image = new Image(100, 100);

      var tileEngine = kontra.tileEngine({
        tileWidth: 10,
        tileHeight: 10,
        width: 2,
        height: 10,
        context: context
      });

      tileEngine.addTilesets({
        image: image
      });

      sinon.stub(tileEngine.context, 'drawImage').callsFake(kontra._noop);

      tileEngine.addLayers({
        name: 'test',
        data: [0,0,1,0,0]
      });

      tileEngine.renderLayer('test');

      expect(tileEngine.context.drawImage.called).to.be.ok;
      expect(tileEngine.context.drawImage.calledWith(
        image,
        0, 0, 10, 10,
        0, 10, 10, 10
      )).to.be.ok;

      tileEngine.context.drawImage.restore();
    });

    it('should account for sx and sy', function() {
      var canvas = document.createElement('canvas');
      canvas.width = 50;
      canvas.height = 50;

      var context = canvas.getContext('2d');
      var image = new Image(100, 100);

      var tileEngine = kontra.tileEngine({
        tileWidth: 10,
        tileHeight: 10,
        width: 10,
        height: 10,
        context: context
      });

      tileEngine.addTilesets({
        image: image
      });

      sinon.stub(tileEngine.context, 'drawImage').callsFake(kontra._noop);

      tileEngine.addLayers({
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
      });

      tileEngine.sx = 50;
      tileEngine.sy = 50;

      tileEngine.renderLayer('test');

      expect(tileEngine.context.drawImage.called).to.be.ok;
      expect(tileEngine.context.drawImage.calledWith(
        image,
        0, 0, 10, 10,
        20, 20, 10, 10
      )).to.be.ok;

      tileEngine.context.drawImage.restore();
    });

  });

});