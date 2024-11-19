import TileEngine, { TileEngineClass } from '../../src/tileEngine.js';
import {
  _reset,
  init,
  getContext,
  getCanvas
} from '../../src/core.js';
import { noop } from '../../src/utils.js';
import {
  callbacks,
  _reset as resetEvents,
  emit
} from '../../src/events.js';

// test-context:start
let testContext = {
  TILEENGINE_CAMERA: true,
  TILEENGINE_DYNAMIC: true,
  TILEENGINE_QUERY: true,
  TILEENGINE_TILED: true
};
// test-context:end

// --------------------------------------------------
// tileEngine
// --------------------------------------------------
describe(
  'tileEngine with context: ' + JSON.stringify(testContext, null, 4),
  () => {
    it('should export class', () => {
      expect(TileEngineClass).to.be.a('function');
    });

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

      it('should not error if context is not set', () => {
        _reset();

        function fn() {
          TileEngine({
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
        }

        expect(fn).to.not.throw();
      });

      it('should set context if kontra.init is called after created', () => {
        _reset();

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

        expect(tileEngine.context).to.be.undefined;

        let canvas = document.createElement('canvas');
        canvas.width = canvas.height = 600;
        init(canvas);

        expect(tileEngine.context).to.equal(canvas.getContext('2d'));
      });

      it('should not override context when set if kontra.init is called after created', () => {
        _reset();

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
        tileEngine.context = true;

        let canvas = document.createElement('canvas');
        canvas.width = canvas.height = 600;
        init(canvas);

        expect(tileEngine.context).to.equal(true);
      });

      it('should call prerender if kontra.init is called after created', () => {
        _reset();

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

        sinon.stub(tileEngine, '_p').callsFake(noop);

        let canvas = document.createElement('canvas');
        canvas.width = canvas.height = 600;
        init(canvas);

        expect(tileEngine._p.called).to.be.true;
      });

      it('should remove init callback', () => {
        _reset();

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

        expect(tileEngine.context).to.be.undefined;

        let canvas = document.createElement('canvas');
        canvas.width = canvas.height = 600;
        init(canvas);

        expect(tileEngine.context).to.equal(canvas.getContext('2d'));
        delete tileEngine.context;
        init(canvas);

        expect(tileEngine.context).to.be.undefined;
      });

      it("should not add init callback if already init'd", () => {
        _reset();
        resetEvents();

        let canvas = document.createElement('canvas');
        canvas.width = canvas.height = 600;
        init(canvas);

        TileEngine({
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

        expect(callbacks.init).to.be.undefined;
      });
    });

    // --------------------------------------------------
    // destroy
    // --------------------------------------------------
    describe('destroy', () => {
      it('should clean up init event', () => {
        _reset();
        resetEvents();

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
        expect(tileEngine.context).to.be.undefined;

        tileEngine.destroy();
        emit('init');

        expect(tileEngine.context).to.be.undefined;
      });
    });

    // --------------------------------------------------
    // tileEngine.sx/sy
    // --------------------------------------------------
    describe('sx/sy', () => {
      let tileEngine;
      beforeEach(() => {
        tileEngine = TileEngine({
          tilewidth: 10,
          tileheight: 10,
          width: 70,
          height: 70,
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

      if (testContext.TILEENGINE_CAMERA) {
        it('should set sx and sy', () => {
          tileEngine.sx = 10;
          tileEngine.sy = 20;

          expect(tileEngine.sx).to.equal(10);
          expect(tileEngine.sy).to.equal(20);
        });

        it('should clamp to min of 0', () => {
          tileEngine.sx = -10;
          tileEngine.sy = -20;

          expect(tileEngine.sx).to.equal(0);
          expect(tileEngine.sy).to.equal(0);
        });

        it('should clamp to max of canvas', () => {
          tileEngine.sx = 1000;
          tileEngine.sy = 2000;

          expect(tileEngine.sx).to.equal(100);
          expect(tileEngine.sy).to.equal(100);
        });

        it('should clamp to 0 if map size is smaller than canvas', () => {
          tileEngine.mapwidth = 500;
          tileEngine.mapheight = 400;
          tileEngine.sx = 10;
          tileEngine.sy = 20;

          expect(tileEngine.sx).to.equal(0);
          expect(tileEngine.sy).to.equal(0);
        });
      } else {
        it('should not have sx and sy properties', () => {
          expect(tileEngine.sx).to.not.exist;
          expect(tileEngine.sy).to.not.exist;
        });
      }
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
      });

      it('calls prerender if the tile engine is dirty', () => {
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
      });

      if (testContext.TILEENGINE_CAMERA) {
        it('should call render on all objects', () => {
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
          let spy = sinon.spy();
          let obj = {
            render: spy
          };

          tileEngine.add(obj);
          tileEngine.render();

          expect(spy.called).to.be.true;
        });

        it('should translate by the camera before rendering objects', () => {
          let context = getContext();
          let tileEngine = TileEngine({
            tilewidth: 10,
            tileheight: 10,
            width: 100,
            height: 100,
            sx: 50,
            sy: 25,
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
          let spy = sinon.spy(context, 'translate');

          tileEngine.render();

          expect(spy.calledWith(-50, -25)).to.be.true;
        });
      } else {
        it('should not translate by the camera', () => {
          let context = getContext();
          let tileEngine = TileEngine({
            tilewidth: 10,
            tileheight: 10,
            width: 100,
            height: 100,
            sx: 50,
            sy: 25,
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
          let spy = sinon.spy(context, 'translate');

          tileEngine.render();

          expect(spy.called).to.be.false;
        });
      }
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

      if (testContext.TILEENGINE_QUERY) {
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
      } else {
        it('should not exist', () => {
          expect(tileEngine.layerCollidesWith).to.not.exist;
        });
      }
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

      if (testContext.TILEENGINE_QUERY) {
        it('should return the correct tile using x, y coordinates', () => {
          expect(
            tileEngine.tileAtLayer('test', { x: 0, y: 0 })
          ).to.equal(0);
          expect(
            tileEngine.tileAtLayer('test', { x: 10, y: 5 })
          ).to.equal(0);
          expect(
            tileEngine.tileAtLayer('test', { x: 20, y: 9 })
          ).to.equal(1);
          expect(
            tileEngine.tileAtLayer('test', { x: 30, y: 10 })
          ).to.equal(undefined);
          expect(
            tileEngine.tileAtLayer('test', { x: 40, y: 1 })
          ).to.equal(0);
        });

        it('should return the correct tile using row, col coordinates', () => {
          expect(
            tileEngine.tileAtLayer('test', { row: 0, col: 0 })
          ).to.equal(0);
          expect(
            tileEngine.tileAtLayer('test', { row: 0, col: 1 })
          ).to.equal(0);
          expect(
            tileEngine.tileAtLayer('test', { row: 0, col: 2 })
          ).to.equal(1);
          expect(
            tileEngine.tileAtLayer('test', { row: 1, col: 3 })
          ).to.equal(undefined);
          expect(
            tileEngine.tileAtLayer('test', { row: 0, col: 4 })
          ).to.equal(0);
        });

        it('should not process out of bound positions', () => {
          expect(
            tileEngine.tileAtLayer('test', { x: -10, y: 0 })
          ).to.equal(undefined);
        });

        it('should return -1 if there is no layer by the provided name', () => {
          expect(
            tileEngine.tileAtLayer('foo', { row: 0, col: 0 })
          ).to.equal(-1);
        });
      } else {
        it('should not exist', () => {
          expect(tileEngine.tileAtLayer).to.not.exist;
        });
      }
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

      if (testContext.TILEENGINE_DYNAMIC) {
        it('should set the tile using x, y coordinates', () => {
          tileEngine.setTileAtLayer('test', { x: 0, y: 0 }, 5);
          expect(tileEngine.layerMap.test.data[0]).to.equal(5);
        });

        it('should set the tile using row, col coordinates', () => {
          tileEngine.setTileAtLayer('test', { row: 1, col: 2 }, 3);
          expect(tileEngine.layerMap.test.data[52]).to.equal(3);
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
      } else {
        it('should not exist', () => {
          expect(tileEngine.setTileAtLayer).to.not.exist;
        });
      }
    });

    // --------------------------------------------------
    // tileEngine.setLayer
    // --------------------------------------------------
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

      if (testContext.TILEENGINE_DYNAMIC) {
        it('should set each tile on the layer', () => {
          tileEngine.setLayer('test', [1, 2, 3, 4]);
          expect(tileEngine.layerMap.test.data[0]).to.equal(1);
          expect(tileEngine.layerMap.test.data[1]).to.equal(2);
          expect(tileEngine.layerMap.test.data[2]).to.equal(3);
          expect(tileEngine.layerMap.test.data[3]).to.equal(4);
        });

        it('should not throw if there is no layer by the provided name', () => {
          function fn() {
            tileEngine.setLayer('foo', [1, 1, 0, 1]);
          }

          expect(fn).to.not.throw();
        });

        it('should set the dirty flag', () => {
          expect(tileEngine.layerMap.test._d).to.equal(false);
          tileEngine.setLayer('test', [1, 1, 0, 1]);
          expect(tileEngine._d).to.equal(true);
          expect(tileEngine.layerMap.test._d).to.equal(true);
        });
      } else {
        it('should not exist', () => {
          expect(tileEngine.setLayer).to.not.exist;
        });
      }
    });

    // --------------------------------------------------
    // tileEngine.renderLayer
    // --------------------------------------------------
    describe('renderLayer', () => {
      it('should correctly render a layer', () => {
        let image = new Image(100, 100);
        let context = getContext();
        let tileEngine = TileEngine({
          tilewidth: 10,
          tileheight: 10,
          width: 2,
          height: 10,
          tilesets: [
            {
              image
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
      });

      if (testContext.TILEENGINE_CAMERA) {
        it('should account for sx and sy', () => {
          let image = new Image(50, 50);
          let context = getContext();
          let tileEngine = TileEngine({
            tilewidth: 10,
            tileheight: 10,
            width: 10,
            height: 10,
            tilesets: [
              {
                image
              }
            ],
            layers: [
              {
                name: 'test',
                data: [
                  [],
                  [],
                  [],
                  [],
                  [],
                  [],
                  [],
                  [0, 0, 0, 0, 0, 0, 0, 1, 0, 0],
                  [],
                  []
                ]
              }
            ]
          });

          sinon.stub(context, 'drawImage').callsFake(noop);

          tileEngine.sx = 50;
          tileEngine.sy = 50;

          tileEngine.renderLayer('test');

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
        });
      }

      it('only draws a layer once', () => {
        let image = new Image(100, 100);

        let tileEngine = TileEngine({
          tilewidth: 10,
          tileheight: 10,
          width: 2,
          height: 10,
          tilesets: [
            {
              image
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

        sinon.stub(tileEngine, '_rl').callsFake(noop);

        tileEngine.renderLayer('test');
        tileEngine.renderLayer('test');

        expect(tileEngine._rl.calledOnce).to.be.true;
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
              image
            },
            {
              firstgid: 50,
              image
            },
            {
              get firstgid() {
                called = true;
                return 100;
              },
              image
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

      if (testContext.TILEENGINE_DYNAMIC) {
        it('calls render if the layer is dirty', () => {
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
          sinon.stub(tileEngine, '_rl').callsFake(noop);

          tileEngine.renderLayer('test');

          expect(tileEngine._rl.called).to.be.false;

          tileEngine.layerMap.test._d = true;
          tileEngine.renderLayer('test');

          expect(tileEngine._rl.called).to.be.true;
        });
      } else {
        it('does not call render if the layer is dirty', () => {
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
          sinon.stub(tileEngine, '_rl').callsFake(noop);

          tileEngine.renderLayer('test');

          expect(tileEngine._rl.called).to.be.false;

          tileEngine.layerMap.test._d = true;
          tileEngine.renderLayer('test');

          expect(tileEngine._rl.called).to.be.false;
        });
      }

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

      it('draws layer with tile spacing', () => {
        let tileEngine = TileEngine({
          tilewidth: 10,
          tileheight: 10,
          width: 5,
          height: 5,
          tilesets: [
            {
              spacing: 1,
              firstgid: 1,
              image: new Image(),
              columns: 5
            }
          ],
          layers: [
            {
              name: 'test',
              data: [13]
            }
          ]
        });

        let r = tileEngine._rl.bind(tileEngine);
        let ctx;
        tileEngine._rl = function overrideR(layer, context) {
          ctx = context;
          sinon.stub(context, 'drawImage').callsFake(noop);
          r(layer, context);
        };

        tileEngine.renderLayer('test');

        expect(
          ctx.drawImage.calledWith(
            tileEngine.tilesets[0].image,
            22,
            22,
            10,
            10,
            0,
            0,
            10,
            10
          )
        ).to.be.true;
      });

      it('draws layer with tile margin', () => {
        let tileEngine = TileEngine({
          tilewidth: 10,
          tileheight: 10,
          width: 5,
          height: 5,
          tilesets: [
            {
              margin: 10,
              firstgid: 1,
              image: new Image(),
              columns: 5
            }
          ],
          layers: [
            {
              name: 'test',
              data: [13]
            }
          ]
        });

        let r = tileEngine._rl.bind(tileEngine);
        let ctx;
        tileEngine._rl = function overrideR(layer, context) {
          ctx = context;
          sinon.stub(context, 'drawImage').callsFake(noop);
          r(layer, context);
        };

        tileEngine.renderLayer('test');

        expect(
          ctx.drawImage.calledWith(
            tileEngine.tilesets[0].image,
            30,
            30,
            10,
            10,
            0,
            0,
            10,
            10
          )
        ).to.be.true;
      });

      it('draws layer with tile spacing and margin', () => {
        let tileEngine = TileEngine({
          tilewidth: 10,
          tileheight: 10,
          width: 5,
          height: 5,
          tilesets: [
            {
              margin: 10,
              spacing: 1,
              firstgid: 1,
              image: new Image(),
              columns: 5
            }
          ],
          layers: [
            {
              name: 'test',
              data: [13]
            }
          ]
        });

        let r = tileEngine._rl.bind(tileEngine);
        let ctx;
        tileEngine._rl = function overrideR(layer, context) {
          ctx = context;
          sinon.stub(context, 'drawImage').callsFake(noop);
          r(layer, context);
        };

        tileEngine.renderLayer('test');

        expect(
          ctx.drawImage.calledWith(
            tileEngine.tilesets[0].image,
            32,
            32,
            10,
            10,
            0,
            0,
            10,
            10
          )
        ).to.be.true;
      });

      if (testContext.TILEENGINE_TILED) {
        it('rotates a tile horizontally', () => {
          let tileEngine = TileEngine({
            tilewidth: 10,
            tileheight: 10,
            width: 1,
            height: 1,
            tilesets: [
              {
                firstgid: 1,
                image: new Image(),
                columns: 10
              }
            ],
            layers: [
              {
                name: 'test',
                data: [3 + 0x80000000]
              }
            ]
          });

          let r = tileEngine._rl.bind(tileEngine);
          let ctx;
          tileEngine._rl = function overrideR(layer, context) {
            ctx = context;
            sinon.stub(context, 'drawImage').callsFake(noop);
            sinon.stub(context, 'translate').callsFake(noop);
            sinon.stub(context, 'scale').callsFake(noop);
            r(layer, context);
          };

          tileEngine.renderLayer('test');

          expect(ctx.translate.calledWith(10, 0)).to.be.true;
          expect(ctx.scale.calledWith(-1, 1)).to.be.true;
          expect(
            ctx.drawImage.calledWith(
              tileEngine.tilesets[0].image,
              20,
              0,
              10,
              10,
              0,
              0,
              10,
              10
            )
          ).to.be.true;
        });

        it('rotates a tile vertically', () => {
          let tileEngine = TileEngine({
            tilewidth: 10,
            tileheight: 10,
            width: 1,
            height: 1,
            tilesets: [
              {
                firstgid: 1,
                image: new Image(),
                columns: 10
              }
            ],
            layers: [
              {
                name: 'test',
                data: [3 + 0x40000000]
              }
            ]
          });

          let r = tileEngine._rl.bind(tileEngine);
          let ctx;
          tileEngine._rl = function overrideR(layer, context) {
            ctx = context;
            sinon.stub(context, 'drawImage').callsFake(noop);
            sinon.stub(context, 'translate').callsFake(noop);
            sinon.stub(context, 'scale').callsFake(noop);
            r(layer, context);
          };

          tileEngine.renderLayer('test');

          expect(ctx.translate.calledWith(0, 10)).to.be.true;
          expect(ctx.scale.calledWith(1, -1)).to.be.true;
          expect(
            ctx.drawImage.calledWith(
              tileEngine.tilesets[0].image,
              20,
              0,
              10,
              10,
              0,
              0,
              10,
              10
            )
          ).to.be.true;
        });

        it('rotates a tile horizontally and vertically', () => {
          let tileEngine = TileEngine({
            tilewidth: 10,
            tileheight: 10,
            width: 1,
            height: 1,
            tilesets: [
              {
                firstgid: 1,
                image: new Image(),
                columns: 10
              }
            ],
            layers: [
              {
                name: 'test',
                data: [3 + 0x80000000 + 0x40000000]
              }
            ]
          });

          let r = tileEngine._rl.bind(tileEngine);
          let ctx;
          tileEngine._rl = function overrideR(layer, context) {
            ctx = context;
            sinon.stub(context, 'drawImage').callsFake(noop);
            sinon.stub(context, 'translate').callsFake(noop);
            sinon.stub(context, 'scale').callsFake(noop);
            r(layer, context);
          };

          tileEngine.renderLayer('test');

          expect(ctx.translate.calledWith(10, 10)).to.be.true;
          expect(ctx.scale.calledWith(-1, -1)).to.be.true;
          expect(
            ctx.drawImage.calledWith(
              tileEngine.tilesets[0].image,
              20,
              0,
              10,
              10,
              0,
              0,
              10,
              10
            )
          ).to.be.true;
        });

        it('a tile flipped and turned clockwise', () => {
          let tileEngine = TileEngine({
            tilewidth: 10,
            tileheight: 10,
            width: 1,
            height: 1,
            tilesets: [
              {
                firstgid: 1,
                image: new Image(),
                columns: 10
              }
            ],
            layers: [
              {
                name: 'test',
                data: [3 + 0x80000000 + 0x40000000 + 0x20000000]
              }
            ]
          });

          let r = tileEngine._rl.bind(tileEngine);
          let ctx;
          tileEngine._rl = function overrideR(layer, context) {
            ctx = context;
            sinon.stub(context, 'drawImage').callsFake(noop);
            sinon.stub(context, 'translate').callsFake(noop);
            sinon.stub(context, 'scale').callsFake(noop);
            sinon.stub(context, 'rotate').callsFake(noop);
            r(layer, context);
          };

          tileEngine.renderLayer('test');

          expect(ctx.translate.calledWith(5, 5)).to.be.true;
          expect(ctx.rotate.calledWith(Math.PI / 2)).to.be.true;
          expect(ctx.scale.calledWith(-1, 1)).to.be.true;
          expect(
            ctx.drawImage.calledWith(
              tileEngine.tilesets[0].image,
              20,
              0,
              10,
              10,
              -5,
              -5,
              10,
              10
            )
          ).to.be.true;
        });

        it('a tile flipped and turned anticlockwise', () => {
          let tileEngine = TileEngine({
            tilewidth: 10,
            tileheight: 10,
            width: 1,
            height: 1,
            tilesets: [
              {
                firstgid: 1,
                image: new Image(),
                columns: 10
              }
            ],
            layers: [
              {
                name: 'test',
                data: [3 + 0x20000000]
              }
            ]
          });

          let r = tileEngine._rl.bind(tileEngine);
          let ctx;
          tileEngine._rl = function overrideR(layer, context) {
            ctx = context;
            sinon.stub(context, 'drawImage').callsFake(noop);
            sinon.stub(context, 'translate').callsFake(noop);
            sinon.stub(context, 'scale').callsFake(noop);
            sinon.stub(context, 'rotate').callsFake(noop);
            r(layer, context);
          };

          tileEngine.renderLayer('test');

          expect(ctx.translate.calledWith(5, 5)).to.be.true;
          expect(ctx.rotate.calledWith(-Math.PI / 2)).to.be.true;
          expect(ctx.scale.calledWith(-1, 1)).to.be.true;
          expect(
            ctx.drawImage.calledWith(
              tileEngine.tilesets[0].image,
              20,
              0,
              10,
              10,
              -5,
              -5,
              10,
              10
            )
          ).to.be.true;
        });
      } else {
        it('does not rotate tile', () => {
          let tileEngine = TileEngine({
            tilewidth: 10,
            tileheight: 10,
            width: 1,
            height: 1,
            tilesets: [
              {
                firstgid: 1,
                image: new Image(),
                columns: 10
              }
            ],
            layers: [
              {
                name: 'test',
                data: [3 + 0x80000000]
              }
            ]
          });

          let r = tileEngine._rl.bind(tileEngine);
          let ctx;
          tileEngine._rl = function overrideR(layer, context) {
            ctx = context;
            sinon.stub(context, 'drawImage').callsFake(noop);
            sinon.stub(context, 'translate').callsFake(noop);
            sinon.stub(context, 'scale').callsFake(noop);
            r(layer, context);
          };

          tileEngine.renderLayer('test');

          expect(ctx.translate.called).to.be.false;
          expect(ctx.scale.called).to.be.false;
        });
      }
    });

    // --------------------------------------------------
    // tileEngine.objects
    // --------------------------------------------------
    describe('objects', () => {
      let tileEngine = null;

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
      });

      if (testContext.TILEENGINE_CAMERA) {
        it('should properly handle setting objects', () => {
          tileEngine.add({ foo: 'bar' });
          tileEngine.add({ faz: 'baz' });
          tileEngine.add({ hello: 'world' });

          let removeSpy = sinon.spy(tileEngine, 'remove');
          let addSpy = sinon.spy(tileEngine, 'add');
          let child = {
            thing1: 'thing2'
          };

          let oldObjects = tileEngine.objects;
          tileEngine.objects = [child];

          expect(removeSpy.calledWith(oldObjects)).to.be.true;
          expect(addSpy.calledWith([child])).to.be.true;
          expect(tileEngine.objects.length).to.equal(1);
          expect(tileEngine.objects[0]).to.equal(child);
        });
      } else {
        it('should not have objects', () => {
          expect(tileEngine.objects).to.not.exist;
        });
      }
    });

    // --------------------------------------------------
    // tileEngine.add
    // --------------------------------------------------
    describe('add', () => {
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

      if (testContext.TILEENGINE_CAMERA) {
        it('should add object', () => {
          expect(tileEngine.objects.length).to.equal(0);
          tileEngine.add(obj);
          expect(tileEngine.objects.length).to.equal(1);
        });

        it('should add multiple objects', () => {
          tileEngine.add(obj, {});
          expect(tileEngine.objects.length).to.equal(2);
        });

        it('should add an array of objects', () => {
          tileEngine.add([obj, {}]);
          expect(tileEngine.objects.length).to.equal(2);
        });

        it('should set the objects parent to the tileEngine', () => {
          tileEngine.add(obj);
          expect(obj.parent).to.equal(tileEngine);
        });
      } else {
        it('should not exist', () => {
          expect(tileEngine.add).to.not.exist;
        });
      }
    });

    // --------------------------------------------------
    // tileEngine.remove
    // --------------------------------------------------
    describe('remove', () => {
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

      if (testContext.TILEENGINE_CAMERA) {
        it('should remove object', () => {
          tileEngine.add(obj);
          tileEngine.remove(obj);
          expect(tileEngine.objects.length).to.equal(0);
        });

        it('should remove multiple objects', () => {
          let obj2 = {};
          tileEngine.add(obj, obj2);
          tileEngine.remove(obj, obj2);
          expect(tileEngine.objects.length).to.equal(0);
        });

        it('should remove an array of objects', () => {
          let obj2 = {};
          tileEngine.add(obj, obj2);
          tileEngine.remove([obj, obj2]);
          expect(tileEngine.objects.length).to.equal(0);
        });

        it('should remove the objects parent', () => {
          tileEngine.add(obj);
          tileEngine.remove(obj);
          expect(obj.parent).to.equal(null);
        });

        it('should not error if the object was not added before', () => {
          function fn() {
            tileEngine.remove(obj);
          }

          expect(fn).to.not.throw();
        });
      } else {
        it('should not exist', () => {
          expect(tileEngine.remove).to.not.exist;
        });
      }
    });

    // --------------------------------------------------
    // tileEngine.getPosition
    // --------------------------------------------------
    describe('getPosition', () => {
      let tileEngine, canvas;
      beforeEach(() => {
        canvas = getCanvas();
        canvas.style.position = 'absolute';
        canvas.style.left = '0px';
        canvas.style.top = '0px';

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
      });

      it('should translate event to position', () => {
        let position = tileEngine.getPosition({ x: 100, y: 100 });

        expect(position).to.deep.equal({
          x: 100,
          y: 100,
          row: 10,
          col: 10
        });
      });

      it('should take into account canvas position', () => {
        canvas.style.left = '100px';
        canvas.style.top = '50px';
        let position = tileEngine.getPosition({ x: 100, y: 100 });

        expect(position).to.deep.equal({
          x: 0,
          y: 50,
          row: 5,
          col: 0
        });
      });

      if (testContext.TILEENGINE_CAMERA) {
        it('should take into account camera', () => {
          tileEngine.sx = 50;
          tileEngine.sy = 100;
          let position = tileEngine.getPosition({ x: 100, y: 100 });
          console.log(position);

          expect(position).to.deep.equal({
            x: 150,
            y: 200,
            row: 20,
            col: 15
          });
        });
      } else {
        it('should not take into account camera', () => {
          tileEngine.sx = 50;
          tileEngine.sy = 100;
          let position = tileEngine.getPosition({ x: 100, y: 100 });

          expect(position).to.deep.equal({
            x: 100,
            y: 100,
            row: 10,
            col: 10
          });
        });
      }
    });
  }
);
