import TileEngine from '../../src/tileEngine.js';
import { getCanvas, getContext } from '../../src/core.js';
import { noop } from '../../src/utils.js';

// --------------------------------------------------
// tileEngine
// --------------------------------------------------
describe('tileEngine', () => {
  // --------------------------------------------------
  // tileEngine.init
  // --------------------------------------------------
  describe('init', () => {
    it('should initialize properties on the tile engine', () => {
      let data = {
        tilewidth: 10,
        tileheight: 10,
        width: 50,
        height: 50,
        tilesets: [
          {
            image: new Image()
          }
        ],
        layers: [
          {
            name: 'test',
            data: [0, 0, 1, 0, 0]
          }
        ]
      };
      let tileEngine = TileEngine(data);

      expect(tileEngine.tilewidth).to.equal(data.tilewidth);
      expect(tileEngine.tileheight).to.equal(data.tileheight);
      expect(tileEngine.width).to.equal(data.width);
      expect(tileEngine.height).to.equal(data.height);
      expect(tileEngine.tilesets).to.equal(data.tilesets);
      expect(tileEngine.layers).to.equal(data.layers);
      expect(tileEngine.mapwidth).to.equal(500);
      expect(tileEngine.mapheight).to.equal(500);
    });
  });

  // --------------------------------------------------
  // tileEngine.render
  // --------------------------------------------------
  describe('render', () => {
    it('renders the tileEngine', () => {
      let context = getContext();
      let tileEngine = TileEngine({
        tilewidth: 10,
        tileheight: 10,
        width: 50,
        height: 50,
        tilesets: [
          {
            image: new Image()
          }
        ],
        layers: [
          {
            name: 'test',
            data: [0, 0, 1, 0, 0]
          }
        ]
      });

      sinon.stub(context, 'drawImage').callsFake(noop);
      tileEngine.render();

      expect(context.drawImage.called).to.be.true;

      context.drawImage.restore();
    });

    it('calls prerender if the tile engine is dirty', () => {
      let context = getContext();
      let tileEngine = TileEngine({
        tilewidth: 10,
        tileheight: 10,
        width: 50,
        height: 50,
        tilesets: [
          {
            image: new Image()
          }
        ],
        layers: [
          {
            name: 'test',
            data: [0, 0, 1, 0, 0]
          }
        ]
      });

      tileEngine._d = false;
      sinon.stub(tileEngine, '_p').callsFake(noop);

      tileEngine.render();

      expect(tileEngine._p.called).to.be.false;

      tileEngine._d = true;
      tileEngine.render();

      expect(tileEngine._p.called).to.be.true;

      tileEngine._p.restore();
    });
  });

  // --------------------------------------------------
  // tileEngine.layerCollidesWith
  // --------------------------------------------------
  describe('layerCollidesWith', () => {
    let tileEngine;

    beforeEach(() => {
      tileEngine = TileEngine({
        tilewidth: 10,
        tileheight: 10,
        width: 50,
        height: 50,
        tilesets: [
          {
            image: new Image()
          }
        ],
        layers: [
          {
            name: 'test',
            data: [0, 0, 1, 0, 0]
          }
        ]
      });
    });

    it('should return false if the object does not collide', () => {
      let collides = tileEngine.layerCollidesWith('test', {
        x: 10,
        y: 10,
        height: 10,
        width: 10
      });

      expect(collides).to.equal(false);
    });

    it('should return true if the object collides', () => {
      let collides = tileEngine.layerCollidesWith('test', {
        x: 25,
        y: 5,
        height: 10,
        width: 10
      });

      expect(collides).to.equal(true);
    });

    it('should handle sprites off the map', () => {
      let collides = tileEngine.layerCollidesWith('test', {
        x: 100,
        y: 100,
        height: 100,
        width: 100
      });

      expect(collides).to.equal(false);
    });

    it('should take into account object.anchor', () => {
      let obj = {
        x: 30,
        y: 10,
        height: 10,
        width: 10
      };
      let collides = tileEngine.layerCollidesWith('test', obj);

      expect(collides).to.equal(false);

      obj.anchor = {
        x: 0.5,
        y: 0.5
      };
      collides = tileEngine.layerCollidesWith('test', obj);

      expect(collides).to.equal(true);
    });
  });

  // --------------------------------------------------
  // tileEngine.tileAtLayer
  // --------------------------------------------------
  describe('tileAtLayer', () => {
    let tileEngine;

    beforeEach(() => {
      tileEngine = TileEngine({
        tilewidth: 10,
        tileheight: 10,
        width: 50,
        height: 50,
        tilesets: [
          {
            image: new Image()
          }
        ],
        layers: [
          {
            name: 'test',
            data: [0, 0, 1, 0, 0]
          }
        ]
      });
    });

    it('should return the correct tile using x, y coordinates', () => {
      expect(tileEngine.tileAtLayer('test', { x: 0, y: 0 })).to.equal(0);
      expect(tileEngine.tileAtLayer('test', { x: 10, y: 5 })).to.equal(0);
      expect(tileEngine.tileAtLayer('test', { x: 20, y: 9 })).to.equal(1);
      expect(tileEngine.tileAtLayer('test', { x: 30, y: 10 })).to.equal(undefined);
      expect(tileEngine.tileAtLayer('test', { x: 40, y: 1 })).to.equal(0);
    });

    it('should return the correct tile using row, col coordinates', () => {
      expect(tileEngine.tileAtLayer('test', { row: 0, col: 0 })).to.equal(0);
      expect(tileEngine.tileAtLayer('test', { row: 0, col: 1 })).to.equal(0);
      expect(tileEngine.tileAtLayer('test', { row: 0, col: 2 })).to.equal(1);
      expect(tileEngine.tileAtLayer('test', { row: 1, col: 3 })).to.equal(undefined);
      expect(tileEngine.tileAtLayer('test', { row: 0, col: 4 })).to.equal(0);
    });

    it('should not process out of bound positions', () => {
      expect(tileEngine.tileAtLayer('test', { x: -10, y: 0 })).to.equal(undefined);
    });

    it('should return -1 if there is no layer by the provided name', () => {
      expect(tileEngine.tileAtLayer('foo', { row: 0, col: 0 })).to.equal(-1);
    });
  });

  // --------------------------------------------------
  // tileEngine.setTileAtLayer
  // --------------------------------------------------
  describe('setTileAtLayer', () => {
    let tileEngine;

    beforeEach(() => {
      tileEngine = TileEngine({
        tilewidth: 10,
        tileheight: 10,
        width: 50,
        height: 50,
        tilesets: [
          {
            image: new Image()
          }
        ],
        layers: [
          {
            name: 'test',
            data: [0, 0, 1, 0, 0]
          }
        ]
      });
    });

    it('should set the tile using x, y coordinates', () => {
      tileEngine.setTileAtLayer('test', { x: 0, y: 0 }, 5);
      expect(tileEngine.tileAtLayer('test', { x: 0, y: 0 })).to.equal(5);
    });

    it('should set the tile using row, col coordinates', () => {
      tileEngine.setTileAtLayer('test', { row: 1, col: 2 }, 3);
      expect(tileEngine.tileAtLayer('test', { row: 1, col: 2 })).to.equal(3);
    });

    it('should not throw if there is no layer by the provided name', () => {
      function fn() {
        tileEngine.setTileAtLayer('foo', { row: 1, col: 2 }, 3);
      }

      expect(fn).to.not.throw();
    });

    it('should set the dirty flag', () => {
      expect(tileEngine.layerMap.test._d).to.equal(false);
      tileEngine.setTileAtLayer('test', { row: 1, col: 2 }, 3);
      expect(tileEngine._d).to.equal(true);
      expect(tileEngine.layerMap.test._d).to.equal(true);
    });
  }); // tileEngine.setLayer // --------------------------------------------------

  // --------------------------------------------------
  describe('setLayer', () => {
    let tileEngine;

    beforeEach(() => {
      tileEngine = TileEngine({
        tilewidth: 10,
        tileheight: 10,
        width: 2,
        height: 2,
        tilesets: [
          {
            image: new Image()
          }
        ],
        layers: [
          {
            name: 'test',
            data: [0, 0, 1, 0]
          }
        ]
      });
    });

    it('should set each tile on the layer', () => {
      tileEngine.setLayer('test', [1, 2, 3, 4]);
      expect(tileEngine.tileAtLayer('test', { row: 0, col: 0 })).to.equal(1);
      expect(tileEngine.tileAtLayer('test', { row: 0, col: 1 })).to.equal(2);
      expect(tileEngine.tileAtLayer('test', { row: 1, col: 0 })).to.equal(3);
      expect(tileEngine.tileAtLayer('test', { row: 1, col: 1 })).to.equal(4);
    });

    it('should not throw if there is no layer by the provided name', () => {
      function fn() {
        tileEngine.setLayer('foo', [1, 1, 0, 1]);
      }

      expect(fn).to.not.throw();
    });

    it('should set the dirty flag', () => {
      expect(tileEngine.layerMap.test._d).to.equal(false);
      tileEngine.setLayer('test', [1, 1, 0, 1]);
      expect(tileEngine._d).to.equal(true);
      expect(tileEngine.layerMap.test._d).to.equal(true);
    });
  });

  // --------------------------------------------------
  // tileEngine.renderLayer
  // --------------------------------------------------
  describe('renderLayer', () => {
    it('should correctly render a layer', () => {
      let image = new Image(100, 100);
      let canvas = getCanvas();
      let context = getContext();
      let tileEngine = TileEngine({
        tilewidth: 10,
        tileheight: 10,
        width: 2,
        height: 10,
        tilesets: [
          {
            image: image
          }
        ],
        layers: [
          {
            name: 'test',
            data: [0, 0, 1, 0, 0]
          }
        ]
      });

      sinon.stub(context, 'drawImage').callsFake(noop);
      tileEngine.renderLayer('test');

      expect(context.drawImage.called).to.be.true;
      expect(
        context.drawImage.calledWith(
          tileEngine.layerCanvases.test,
          0,
          0,
          tileEngine.layerCanvases.test.width,
          tileEngine.layerCanvases.test.height,
          0,
          0,
          tileEngine.layerCanvases.test.width,
          tileEngine.layerCanvases.test.height
        )
      ).to.be.true;

      context.drawImage.restore();
    });

    it('should account for sx and sy', () => {
      let image = new Image(50, 50);
      let canvas = getCanvas();
      let context = getContext();
      let tileEngine = TileEngine({
        tilewidth: 10,
        tileheight: 10,
        width: 10,
        height: 10,
        tilesets: [
          {
            image: image
          }
        ],
        layers: [
          {
            name: 'test',
            data: [[], [], [], [], [], [], [], [0, 0, 0, 0, 0, 0, 0, 1, 0, 0], [], []]
          }
        ]
      });

      sinon.stub(context, 'drawImage').callsFake(noop);

      tileEngine.sx = 50;
      tileEngine.sy = 50;

      tileEngine.renderLayer('test');

      const img = new Image();
      img.src = tileEngine.layerCanvases.test.toDataURL();

      expect(context.drawImage.called).to.be.true;
      expect(
        context.drawImage.calledWith(
          tileEngine.layerCanvases.test,
          tileEngine.sx,
          tileEngine.sy,
          tileEngine.layerCanvases.test.width,
          tileEngine.layerCanvases.test.height,
          0,
          0,
          tileEngine.layerCanvases.test.width,
          tileEngine.layerCanvases.test.height
        )
      ).to.be.true;

      context.drawImage.restore();
    });

    it('only draws a layer once', () => {
      let image = new Image(100, 100);

      let tileEngine = TileEngine({
        tilewidth: 10,
        tileheight: 10,
        width: 2,
        height: 10,
        tilesets: [
          {
            image: image
          }
        ],
        layers: [
          {
            name: 'test',
            visible: true,
            data: [0, 0, 1, 0, 0]
          }
        ]
      });

      sinon.stub(tileEngine, '_r').callsFake(noop);

      tileEngine.renderLayer('test');
      tileEngine.renderLayer('test');

      expect(tileEngine._r.calledOnce).to.be.true;

      tileEngine._r.restore();
    });

    it('uses the correct tileset', () => {
      let image = new Image(100, 100);

      let called = false;
      let tileEngine = TileEngine({
        tilewidth: 10,
        tileheight: 10,
        width: 2,
        height: 10,
        tilesets: [
          {
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
          }
        ],
        layers: [
          {
            name: 'test',
            data: [0, 0, 49, 0, 0]
          }
        ]
      });

      tileEngine.renderLayer('test');

      expect(called).to.be.true;
    });

    it('calls render if the tile engine is dirty', () => {
      let tileEngine = TileEngine({
        tilewidth: 10,
        tileheight: 10,
        width: 50,
        height: 50,
        tilesets: [
          {
            image: new Image()
          }
        ],
        layers: [
          {
            name: 'test',
            data: [0, 0, 1, 0, 0]
          }
        ]
      });

      // Render once to create the canvas
      tileEngine.renderLayer('test');

      tileEngine.layerMap.test._d = false;
      sinon.stub(tileEngine, '_r').callsFake(noop);

      tileEngine.renderLayer('test');

      expect(tileEngine._r.called).to.be.false;

      tileEngine.layerMap.test._d = true;
      tileEngine.renderLayer('test');

      expect(tileEngine._r.called).to.be.true;

      tileEngine._r.restore();
    });

    it('should not error if layer does not have data', () => {
      let tileEngine = TileEngine({
        tilewidth: 10,
        tileheight: 10,
        width: 50,
        height: 50,
        tilesets: [
          {
            image: new Image()
          }
        ],
        layers: [
          {
            name: 'test',
            objects: []
          }
        ]
      });

      function fn() {
        tileEngine.renderLayer('test');
      }

      expect(fn).to.not.throw();
    });
  });

  // --------------------------------------------------
  // tileEngine.addObject
  // --------------------------------------------------
  describe('addObject', () => {
    let tileEngine = null;
    let obj = null;

    beforeEach(() => {
      tileEngine = TileEngine({
        tilewidth: 10,
        tileheight: 10,
        width: 100,
        height: 100,
        tilesets: [
          {
            image: new Image()
          }
        ],
        layers: [
          {
            name: 'test',
            data: [0, 0, 1, 0, 0]
          }
        ]
      });
      obj = {};
    });

    it('should set object sx and sy to tile engine camera', () => {
      tileEngine.sx = 20;
      tileEngine.sy = 30;

      tileEngine.addObject(obj);

      expect(obj.sx).to.equal(20);
      expect(obj.sy).to.equal(30);
    });

    it('should update objects sx property when tile engine camera changes', () => {
      tileEngine.addObject(obj);

      expect(obj.sx).to.equal(0);
      expect(obj.sy).to.equal(0);

      tileEngine.sx = 20;
      tileEngine.sy = 30;

      expect(obj.sx).to.equal(20);
      expect(obj.sy).to.equal(30);
    });
  });

  // --------------------------------------------------
  // tileEngine.removeObject
  // --------------------------------------------------
  describe('removeObject', () => {
    let tileEngine = null;
    let obj = null;

    beforeEach(() => {
      tileEngine = TileEngine({
        tilewidth: 10,
        tileheight: 10,
        width: 100,
        height: 100,
        tilesets: [
          {
            image: new Image()
          }
        ],
        layers: [
          {
            name: 'test',
            data: [0, 0, 1, 0, 0]
          }
        ]
      });
      obj = {};
    });

    it('should not update objects sx property when tile engine camera changes', () => {
      tileEngine.addObject(obj);

      expect(obj.sx).to.equal(0);
      expect(obj.sy).to.equal(0);

      tileEngine.removeObject(obj);

      tileEngine.sx = 20;
      tileEngine.sy = 30;

      expect(obj.sx).to.equal(0);
      expect(obj.sy).to.equal(0);
    });

    it('should not error if the object was not added before', () => {
      function fn() {
        tileEngine.removeObject(obj);
      }

      expect(fn).to.not.throw();
    });
  });
});
