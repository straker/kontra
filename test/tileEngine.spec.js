// --------------------------------------------------
// kontra.tileEngine
// --------------------------------------------------
describe('', function() {

  // --------------------------------------------------
  // kontra.tileEngine.init
  // --------------------------------------------------
  describe('kontra.tileEngine.init', function() {

    it('should log an error if no dimensions are passed', function() {
      sinon.stub(kontra, '_logError', kontra._noop);

      kontra.tileEngine();

      expect(kontra._logError.called).to.be.ok;

      kontra._logError.restore();
    });

    it('should initialize properties on the tile engine', function() {
      var tileEngine = kontra.tileEngine({
        tileWidth: 10,
        tileHeight: 10,
        width: 100,
        height: 150
      });

      expect(tileEngine.mapWidth).to.equal(1000);
      expect(tileEngine.mapHeight).to.equal(1500);
    });

  });





  // --------------------------------------------------
  // kontra.tileEngine.addTileset
  // --------------------------------------------------
  describe('kontra.tileEngine.addTileset', function() {
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
      sinon.stub(kontra, '_logError', kontra._noop);

      tileEngine.addTileset();

      expect(kontra._logError.called).to.be.ok;

      kontra._logError.restore();
    });

    it('should use firstGrid if passed', function() {
      tileEngine.addTileset({
        image: new Image(100, 100),
        firstGrid: 17
      });

      expect(tileEngine.tilesets[0].firstGrid).to.equal(17);
      expect(tileEngine.tilesets[0].lastGrid).to.equal(116);
    });

    it('should calculate first and last grid number correctly', function() {
      tileEngine.addTileset({
        image: new Image(100, 100)
      });

      expect(tileEngine.tilesets[0].firstGrid).to.equal(1);
      expect(tileEngine.tilesets[0].lastGrid).to.equal(100);
    });

    it('should calculate first and last grid number when there is a tileset already added', function() {
      tileEngine.addTileset({
        image: new Image(100, 100)
      });

      tileEngine.addTileset({
        image: new Image(100, 100)
      });

      expect(tileEngine.tilesets[1].firstGrid).to.equal(101);
      expect(tileEngine.tilesets[1].lastGrid).to.equal(200);
    });

    it('should calculate first and last grid number correctly for multiple tilesets', function() {
      tileEngine.addTileset({
        image: new Image(200, 200)
      });

      tileEngine.addTileset({
        image: new Image(150, 150)
      });

      tileEngine.addTileset({
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
  // kontra.tileEngine.addLayer
  // --------------------------------------------------
  describe('kontra.tileEngine.addLayer', function() {
    var tileEngine;

    beforeEach(function() {
      tileEngine = kontra.tileEngine({
        tileWidth: 10,
        tileHeight: 10,
        width: 3,
        height: 3
      });

      sinon.stub(kontra.tileEngine.prototype, '_preRenderImage', kontra._noop);
    });

    afterEach(function() {
      kontra.tileEngine.prototype._preRenderImage.restore();
    });

    it('should set default properties on the layer', function() {
      tileEngine.addLayer({
        name: 'test',
        data: [0,0,1,0,0],
      });

      expect(tileEngine.layers.test[0]).to.equal(0);
      expect(tileEngine.layers.test[1]).to.equal(0);
      expect(tileEngine.layers.test[2]).to.equal(1);
      expect(tileEngine.layers.test[3]).to.equal(0);
      expect(tileEngine.layers.test[4]).to.equal(0);
    });

    it('should flatten a 2d tile data array', function() {
      tileEngine.addLayer({
        name: 'test',
        data: [[0,0],[1,0,0]],
      });

      expect(tileEngine.layers.test[0]).to.equal(0);
      expect(tileEngine.layers.test[1]).to.equal(0);
      expect(tileEngine.layers.test[2]).to.equal(0);
      expect(tileEngine.layers.test[3]).to.equal(1);
      expect(tileEngine.layers.test[4]).to.equal(0);
      expect(tileEngine.layers.test[5]).to.equal(0);
    });

    it('should add the tileset in the correct order', function() {
      tileEngine.addLayer({
        name: 'test',
        data: [0,0,1,0,0],
        zIndex: 1
      });

      tileEngine.addLayer({
        name: 'test2',
        data: [0,0,1,0,0],
        zIndex: -1
      });

      tileEngine.addLayer({
        name: 'test3',
        data: [0,0,1,0,0],
        zIndex: 10
      });

      expect(tileEngine._layerOrder[0]).to.equal('test2');
      expect(tileEngine._layerOrder[1]).to.equal('test');
      expect(tileEngine._layerOrder[2]).to.equal('test3');
    });

    it('should not order the tileset if it is not being rendered', function() {
      tileEngine.addLayer({
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
  describe('kontra.tileEngine.layerCollidesWith', function() {
    var tileEngine;

    beforeEach(function() {
      tileEngine = kontra.tileEngine({
        tileWidth: 10,
        tileHeight: 10,
        width: 50,
        height: 50
      });

      sinon.stub(kontra.tileEngine.prototype, '_preRenderImage', kontra._noop);

      tileEngine.addLayer({
        name: 'test',
        data: [0,0,1,0,0]
      });
    });

    afterEach(function() {
      kontra.tileEngine.prototype._preRenderImage.restore();
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
  describe('kontra.tileEngine.tileAtLayer', function() {
    var tileEngine;

    beforeEach(function() {
      tileEngine = kontra.tileEngine({
        tileWidth: 10,
        tileHeight: 10,
        width: 50,
        height: 50
      });

      sinon.stub(kontra.tileEngine.prototype, '_preRenderImage', kontra._noop);

      tileEngine.addLayer({
        name: 'test',
        data: [0,0,1,0,0]
      });
    });

    afterEach(function() {
      kontra.tileEngine.prototype._preRenderImage.restore();
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
  // kontra.tileEngine.render
  // --------------------------------------------------
  describe('kontra.tileEngine.render', function() {

    it('should correctly render all layers', function() {
      canvas = document.createElement('canvas');
      canvas.width = 20;
      canvas.height = 30;

      var context = canvas.getContext('2d');
      var image = new Image(100, 100);

      var tileEngine = kontra.tileEngine({
        tileWidth: 10,
        tileHeight: 10,
        width: 2,
        height: 3,
        context: context
      });

      sinon.stub(tileEngine._offscreenContext, 'drawImage', kontra._noop);
      sinon.stub(tileEngine.context, 'drawImage', kontra._noop);

      tileEngine.addTileset({
        image: image
      });

      tileEngine.addLayer({
        name: 'test',
        data: [0,0,1,0,0]
      });

      // _preRenderImage should have been called and looped through the layer
      // since there are 4 empty tiles, the drawImage function should only have
      // been called once
      expect(tileEngine._offscreenContext.drawImage.calledOnce).to.be.ok;

      expect(tileEngine._offscreenContext.drawImage.calledWith(
        image,
        0, 0, 10, 10,
        0, 10, 10, 10
      )).to.be.ok;

      tileEngine.render();

      expect(tileEngine.context.drawImage.called).to.be.ok;
      expect(tileEngine.context.drawImage.calledWith(
        tileEngine._offscreenCanvas,
        0, 0, 20, 30,
        0, 0, 20, 30
      )).to.be.ok;

      tileEngine._offscreenContext.drawImage.restore();
      tileEngine.context.drawImage.restore();
    });

  });





  // --------------------------------------------------
  // kontra.tileEngine.renderLayer
  // --------------------------------------------------
  describe('kontra.tileEngine.renderLayer', function() {

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

      tileEngine.addTileset({
        image: image
      });

      sinon.stub(kontra.tileEngine.prototype, '_preRenderImage', kontra._noop);
      sinon.stub(tileEngine.context, 'drawImage', kontra._noop);

      tileEngine.addLayer({
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

      kontra.tileEngine.prototype._preRenderImage.restore();
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

      tileEngine.addTileset({
        image: image
      });

      sinon.stub(kontra.tileEngine.prototype, '_preRenderImage', kontra._noop);
      sinon.stub(tileEngine.context, 'drawImage', kontra._noop);

      tileEngine.addLayer({
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

      kontra.tileEngine.prototype._preRenderImage.restore();
      tileEngine.context.drawImage.restore();
    });

  });

});