// --------------------------------------------------
// kontra.tileEngine
// --------------------------------------------------
describe('', function() {

  // --------------------------------------------------
  // kontra.tileEngine.init
  // --------------------------------------------------
  describe('kontra.tileEngine.init', function() {

    it('should log an error if no dimensions are passed', function() {
      sinon.stub(kontra, 'logError', kontra.noop);

      kontra.tileEngine();

      expect(kontra.logError.called).to.be.ok;

      kontra.logError.restore();
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
      sinon.stub(kontra, 'logError', kontra.noop);

      tileEngine.addTileset();

      expect(kontra.logError.called).to.be.ok;

      kontra.logError.restore();
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
        width: 50,
        height: 50
      });

      sinon.stub(kontra.tileEngine.prototype, '_preRenderImage', kontra.noop);
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
      expect(tileEngine.layers.test[2]).to.equal(1);
      expect(tileEngine.layers.test[3]).to.equal(0);
      expect(tileEngine.layers.test[4]).to.equal(0);
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

      sinon.stub(kontra.tileEngine.prototype, '_preRenderImage', kontra.noop);

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

      sinon.stub(kontra.tileEngine.prototype, '_preRenderImage', kontra.noop);

      tileEngine.addLayer({
        name: 'test',
        data: [0,0,1,0,0]
      });
    });

    afterEach(function() {
      kontra.tileEngine.prototype._preRenderImage.restore();
    });

    it('should return the correct tile', function() {
      expect(tileEngine.tileAtLayer('test', 0, 0)).to.equal(0);
      expect(tileEngine.tileAtLayer('test', 10, 5)).to.equal(0);
      expect(tileEngine.tileAtLayer('test', 20, 9)).to.equal(1);
      expect(tileEngine.tileAtLayer('test', 30, 10)).to.equal(undefined);
      expect(tileEngine.tileAtLayer('test', 40, 1)).to.equal(0);
    });

  });

});