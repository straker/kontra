import GameObject, { GameObjectClass } from '../../src/gameObject.js';
import { getContext } from '../../src/core.js';
import { noop } from '../../src/utils.js';
import { degToRad } from '../../src/helpers.js';

// test-context:start
let testContext = {
  GAMEOBJECT_ANCHOR: true,
  GAMEOBJECT_GROUP: true,
  GAMEOBJECT_OPACITY: true,
  GAMEOBJECT_ROTATION: true,
  GAMEOBJECT_SCALE: true
};
// test-context:end

// --------------------------------------------------
// gameObject
// --------------------------------------------------
describe(
  'gameObject with context: ' + JSON.stringify(testContext, null, 4),
  () => {
    let spy, gameObject;
    beforeEach(() => {
      gameObject = GameObject();
    });

    afterEach(() => {
      spy && spy.restore && spy.restore();
    });

    it('should export class', () => {
      expect(GameObjectClass).to.be.a('function');
    });

    // --------------------------------------------------
    // init
    // --------------------------------------------------
    describe('init', () => {
      it('should set default properties', () => {
        expect(gameObject.context).to.equal(getContext());
        expect(gameObject.width).to.equal(0);
        expect(gameObject.height).to.equal(0);
      });

      it('should set width and height properties', () => {
        gameObject = GameObject({ width: 10, height: 20 });

        expect(gameObject.width).to.equal(10);
        expect(gameObject.height).to.equal(20);
      });

      it('should set context property', () => {
        let canvas = document.createElement('canvas');
        let context = canvas.getContext('2d');
        gameObject = GameObject({ context });

        expect(gameObject.context).to.equal(context);
      });

      it('should set any property', () => {
        gameObject = GameObject({ myProp: 'foo' });

        expect(gameObject.myProp).to.equal('foo');
      });

      it('should set render function', () => {
        gameObject = GameObject({ render: noop });

        expect(gameObject._rf).to.equal(noop);
      });

      it('should not override properties from parent object', () => {
        class MyClass extends GameObjectClass {
          init() {
            super.init({
              width: 20,
              height: 30
            });
          }
        }

        let obj = new MyClass();
        expect(obj.width).to.equal(20);
        expect(obj.height).to.equal(30);
      });

      if (testContext.GAMEOBJECT_ANCHOR) {
        it('should set default anchor', () => {
          expect(gameObject.anchor).to.deep.equal({ x: 0, y: 0 });
        });

        it('should set anchor property', () => {
          gameObject = GameObject({ anchor: { x: 0.5, y: 0.5 } });

          expect(gameObject.anchor).to.deep.equal({ x: 0.5, y: 0.5 });
        });
      } else {
        it('should not default anchor', () => {
          expect(gameObject.anchor).to.not.exist;
        });
      }

      if (testContext.GAMEOBJECT_GROUP) {
        it('should set default children', () => {
          expect(gameObject.children).to.deep.equal([]);
        });

        it('should set children property', () => {
          gameObject = GameObject({
            children: [GameObject(), GameObject()]
          });

          expect(gameObject.children).to.have.lengthOf(2);
        });

        it('should call "addChild" for each child', () => {
          spy = sinon
            .stub(GameObjectClass.prototype, 'addChild')
            .callsFake(noop);

          gameObject = GameObject({ children: ['child1', 'child2'] });

          expect(spy.calledWith(['child1', 'child2'])).to.be.true;
        });
      } else {
        it('should not default children', () => {
          expect(gameObject.children).to.not.exist;
        });
      }

      if (testContext.GAMEOBJECT_OPACITY) {
        it('should set default opacity', () => {
          expect(gameObject.opacity).to.equal(1);
        });

        it('should set opacity property', () => {
          gameObject = GameObject({ opacity: 0.5 });

          expect(gameObject.opacity).to.equal(0.5);
        });
      } else {
        it('should not default opacity', () => {
          expect(gameObject.opacity).to.not.exist;
        });
      }

      if (testContext.GAMEOBJECT_ROTATION) {
        it('should set default camera', () => {
          expect(gameObject.rotation).to.equal(0);
        });

        it('should set rotation property', () => {
          gameObject = GameObject({ rotation: 0.5 });

          expect(gameObject.rotation).to.equal(0.5);
        });
      } else {
        it('should not default camera', () => {
          expect(gameObject.rotation).to.not.exist;
        });
      }

      if (testContext.GAMEOBJECT_SCALE) {
        it('should set default camera', () => {
          expect(gameObject.scaleX).to.equal(1);
          expect(gameObject.scaleY).to.equal(1);
        });

        it('should set scaleX and scaleY properties', () => {
          gameObject = GameObject({ scaleX: 10, scaleY: 20 });

          expect(gameObject.scaleX).to.equal(10);
          expect(gameObject.scaleY).to.equal(20);
        });
      } else {
        it('should not default camera', () => {
          expect(gameObject.scaleY).to.not.exist;
          expect(gameObject.scaleY).to.not.exist;
        });
      }
    });

    // --------------------------------------------------
    // render
    // --------------------------------------------------
    describe('render', () => {
      afterEach(() => {
        gameObject.context.translate.restore &&
          gameObject.context.translate.restore();
        gameObject.context.rotate.restore &&
          gameObject.context.rotate.restore();
        gameObject.context.scale.restore &&
          gameObject.context.scale.restore();
      });

      it('should translate to the x and y position', () => {
        gameObject.x = 10;
        gameObject.y = 20;

        sinon.stub(gameObject.context, 'translate');

        gameObject.render();

        expect(gameObject.context.translate.calledWith(10, 20)).to.be
          .true;
      });

      it('should not translate if the position is 0', () => {
        sinon.stub(gameObject.context, 'translate');

        gameObject.render();

        expect(gameObject.context.translate.called).to.be.false;
      });

      if (testContext.GAMEOBJECT_ROTATION) {
        it('should rotate by the rotation', () => {
          gameObject.rotation = 10;

          sinon.stub(gameObject.context, 'rotate');

          gameObject.render();

          expect(gameObject.context.rotate.calledWith(10)).to.be.true;
        });

        it('should not rotate if the rotation is 0', () => {
          sinon.stub(gameObject.context, 'rotate');

          gameObject.render();

          expect(gameObject.context.rotate.called).to.be.false;
        });
      } else {
        it('should not rotate', () => {
          gameObject.rotation = 10;

          sinon.stub(gameObject.context, 'rotate');

          gameObject.render();

          expect(gameObject.context.rotate.called).to.be.false;
        });
      }

      if (testContext.GAMEOBJECT_SCALE) {
        it('should scale the canvas', () => {
          gameObject.scaleX = 2;
          gameObject.scaleY = 2;

          sinon.stub(gameObject.context, 'scale');

          gameObject.render();

          expect(gameObject.context.scale.calledWith(2, 2)).to.be
            .true;
        });

        it('should not scale if scaleX and scaleY are 1', () => {
          sinon.stub(gameObject.context, 'scale');

          gameObject.render();

          expect(gameObject.context.scale.called).to.be.false;
        });
      } else {
        it('should not scale', () => {
          gameObject.scaleX = 2;
          gameObject.scaleY = 2;

          sinon.stub(gameObject.context, 'scale');

          gameObject.render();

          expect(gameObject.context.scale.called).to.be.false;
        });
      }

      if (testContext.GAMEOBJECT_ANCHOR) {
        it('should translate to the anchor position', () => {
          gameObject.anchor = { x: 0.5, y: 0.5 };
          gameObject.width = 20;
          gameObject.height = 30;

          sinon.stub(gameObject.context, 'translate');

          gameObject.render();

          expect(
            gameObject.context.translate.firstCall.calledWith(
              -10,
              -15
            )
          ).to.be.true;
        });

        it('should not translate if the anchor position is {0, 0}', () => {
          sinon.stub(gameObject.context, 'translate');

          gameObject.render();

          expect(gameObject.context.translate.called).to.be.false;
        });

        it('should translate back to the x/y position', () => {
          gameObject.anchor = { x: 0.5, y: 0.5 };
          gameObject.width = 20;
          gameObject.height = 30;

          sinon.stub(gameObject.context, 'translate');

          gameObject.render();

          expect(
            gameObject.context.translate.secondCall.calledWith(10, 15)
          ).to.be.true;
        });
      } else {
        it('should not translate by anchor', () => {
          gameObject.anchor = { x: 0.5, y: 0.5 };
          gameObject.width = 20;
          gameObject.height = 30;

          sinon.stub(gameObject.context, 'translate');

          gameObject.render();

          expect(gameObject.context.translate.called).to.be.false;
        });
      }

      if (testContext.GAMEOBJECT_OPACITY) {
        it('should set the globalAlpha', () => {
          gameObject.opacity = 0.5;

          let spy = sinon.spy(
            CanvasRenderingContext2D.prototype,
            'globalAlpha',
            ['set']
          );

          gameObject.render();

          expect(spy.set.calledWith(0.5)).to.be.true;

          spy.set.restore();
        });
      } else {
        it('should not set the globalAlpha', () => {
          gameObject.opacity = 0.5;

          let spy = sinon.spy(
            CanvasRenderingContext2D.prototype,
            'globalAlpha',
            ['set']
          );

          gameObject.render();

          expect(spy.set.called).to.be.false;

          spy.set.restore();
        });
      }

      it('should call the default render function', () => {
        spy = sinon.spy(GameObjectClass.prototype, 'draw');

        // redeclare now that the spy is set
        gameObject = GameObject();
        gameObject.render();

        expect(spy.called).to.be.true;
      });

      it('should call a custom render function', () => {
        spy = sinon.spy();
        let gameObject = GameObject({
          render: spy
        });

        gameObject.render();

        expect(spy.called).to.be.true;
      });

      if (testContext.GAMEOBJECT_GROUP) {
        it('should call render on each child', () => {
          let child = {
            render: sinon.stub()
          };

          gameObject.children = [child];

          gameObject.render();

          expect(child.render.called).to.be.true;
        });
      } else {
        it('should not call render on each child', () => {
          let child = {
            render: sinon.stub()
          };

          gameObject.children = [child];

          gameObject.render();

          expect(child.render.called).to.be.false;
        });
      }
    });

    // --------------------------------------------------
    // world
    // --------------------------------------------------
    describe('world', () => {
      it('should default position and size properties', () => {
        expect(gameObject.world.x).to.equal(0);
        expect(gameObject.world.y).to.equal(0);
        expect(gameObject.world.width).to.equal(0);
        expect(gameObject.world.height).to.equal(0);
      });

      it('should update position', () => {
        gameObject.x = 10;
        gameObject.y = 20;

        expect(gameObject.world.x).to.equal(10);
        expect(gameObject.world.y).to.equal(20);
      });

      it('should update size', () => {
        gameObject.width = 10;
        gameObject.height = 20;

        expect(gameObject.world.width).to.equal(10);
        expect(gameObject.world.height).to.equal(20);
      });

      if (testContext.GAMEOBJECT_OPACITY) {
        it('should default opacity', () => {
          expect(gameObject.world.opacity).to.equal(1);
        });

        it('should update world opacity', () => {
          gameObject.opacity = 0.5;

          expect(gameObject.world.opacity).to.equal(0.5);
        });
      } else {
        it('should not have opacity', () => {
          expect(gameObject.world.opacity).to.not.exist;
        });
      }

      if (testContext.GAMEOBJECT_ROTATION) {
        it('should default rotation', () => {
          expect(gameObject.world.rotation).to.equal(0);
        });

        it('should update world rotation', () => {
          gameObject.rotation = 0.5;

          expect(gameObject.world.rotation).to.equal(0.5);
        });
      } else {
        it('should not have rotation', () => {
          expect(gameObject.world.rotation).to.not.exist;
        });
      }

      if (testContext.GAMEOBJECT_SCALE) {
        it('should default scale', () => {
          expect(gameObject.world.scaleX).to.equal(1);
          expect(gameObject.world.scaleY).to.equal(1);
        });

        it('should update world scale', () => {
          gameObject.scaleX = 2;
          gameObject.scaleY = 3;

          expect(gameObject.world.scaleX).to.equal(2);
          expect(gameObject.world.scaleY).to.equal(3);
        });

        it('should update size based on scale', () => {
          gameObject.width = 10;
          gameObject.height = 20;

          gameObject.scaleX = 2;
          gameObject.scaleY = 2;

          expect(gameObject.world.width).to.equal(20);
          expect(gameObject.world.height).to.equal(40);
        });
      } else {
        it('should not have scale', () => {
          expect(gameObject.world.scaleX).to.not.exist;
          expect(gameObject.world.scaleY).to.not.exist;
        });

        it('should not update size based on scale', () => {
          gameObject.width = 10;
          gameObject.height = 20;

          gameObject.scaleX = 2;
          gameObject.scaleY = 2;

          expect(gameObject.world.width).to.equal(10);
          expect(gameObject.world.height).to.equal(20);
        });
      }

      if (testContext.GAMEOBJECT_GROUP) {
        it('should update world of each child', () => {
          let parent = GameObject({
            children: [gameObject]
          });

          parent.x = 10;
          parent.y = 20;

          expect(gameObject.world.x).to.equal(10);
          expect(gameObject.world.y).to.equal(20);
        });

        if (testContext.GAMEOBJECT_OPACITY) {
          it('should update opacity based on parent', () => {
            GameObject({
              opacity: 0.5,
              children: [gameObject]
            });

            gameObject.opacity = 0.5;

            expect(gameObject.world.opacity).to.equal(0.25);
          });
        }

        if (testContext.GAMEOBJECT_ROTATION) {
          it('should update rotation based on parent', () => {
            GameObject({
              rotation: 10,
              children: [gameObject]
            });

            gameObject.rotation = 20;

            expect(gameObject.world.rotation).to.equal(30);
          });
        }

        if (testContext.GAMEOBJECT_SCALE) {
          it('should update scale based on parent', () => {
            GameObject({
              scaleX: 2,
              scaleY: 2,
              children: [gameObject]
            });

            gameObject.scaleX = 2;
            gameObject.scaleY = 3;

            expect(gameObject.world.scaleX).to.equal(4);
            expect(gameObject.world.scaleY).to.equal(6);
          });

          it('should update position based on parent scale', () => {
            GameObject({
              scaleX: 2,
              scaleY: 2,
              children: [gameObject]
            });

            gameObject.x = 10;
            gameObject.y = 20;

            expect(gameObject.world.x).to.equal(20);
            expect(gameObject.world.y).to.equal(40);
          });

          it('should update size based on all scales', () => {
            GameObject({
              scaleX: 2,
              scaleY: 2,
              children: [gameObject]
            });

            gameObject.width = 10;
            gameObject.height = 20;
            gameObject.scaleX = 3;
            gameObject.scaleY = 3;

            expect(gameObject.world.width).to.equal(60);
            expect(gameObject.world.height).to.equal(120);
          });
        }

        if (
          testContext.GAMEOBJECT_ANCHOR &&
          testContext.GAMEOBJECT_ROTATION &&
          testContext.GAMEOBJECT_SCALE
        ) {
          it('should work with complex example', () => {
            let parent = GameObject({
              x: 100,
              y: 100,
              width: 20,
              height: 20
            });

            let child = GameObject({
              x: 0,
              y: 0,
              width: 20,
              height: 20,
              rotation: degToRad(45)
            });

            let grandchild = GameObject({
              x: 25,
              y: -50,
              width: 20,
              height: 20,
              scaleX: 1.5,
              scaleY: 9,
              rotation: degToRad(25)
            });

            let greatGrandchild = GameObject({
              x: 0,
              y: -10,
              width: 20,
              height: 20
            });

            parent.children = [child];
            child.children = [grandchild];
            grandchild.children = [greatGrandchild];

            expect(parent.world.x).to.equal(100);
            expect(parent.world.y).to.equal(100);
            expect(parent.world.width).to.equal(20);
            expect(parent.world.height).to.equal(20);
            expect(parent.world.rotation).to.equal(0);

            expect(child.world.x).to.equal(100);
            expect(child.world.y).to.equal(100);
            expect(child.world.width).to.equal(20);
            expect(child.world.height).to.equal(20);
            expect(child.world.rotation).to.equal(degToRad(45));

            expect(grandchild.world.x).to.equal(153.03300858899107);
            expect(grandchild.world.y).to.equal(82.32233047033631);
            expect(grandchild.world.width).to.equal(30);
            expect(grandchild.world.height).to.equal(180);
            expect(grandchild.world.rotation).to.equal(degToRad(70));

            expect(greatGrandchild.world.x).to.equal(
              237.6053444597228
            );
            expect(greatGrandchild.world.y).to.equal(
              51.540517571026115
            );
            expect(greatGrandchild.world.width).to.equal(30);
            expect(greatGrandchild.world.height).to.equal(180);
            expect(greatGrandchild.world.rotation).to.equal(
              degToRad(70)
            );
          });
        }
      }
    });

    // --------------------------------------------------
    // group
    // --------------------------------------------------
    describe('group', () => {
      // --------------------------------------------------
      // addChild
      // --------------------------------------------------
      describe('addChild', () => {
        if (testContext.GAMEOBJECT_GROUP) {
          it('should add the object as a child', () => {
            let child = {
              foo: 'bar'
            };
            gameObject.addChild(child);

            expect(gameObject.children).deep.equal([child]);
          });

          it('should add multiple objects as a child', () => {
            let child1 = {
              foo: 'bar'
            };
            let child2 = {};
            gameObject.addChild(child1, child2);

            expect(gameObject.children).deep.equal([child1, child2]);
          });

          it('should add an array objects as a child', () => {
            let child1 = {
              foo: 'bar'
            };
            let child2 = {};
            gameObject.addChild([child1, child2]);

            expect(gameObject.children).deep.equal([child1, child2]);
          });

          it('should set the childs parent to the game object', () => {
            let child = {
              foo: 'bar'
            };
            gameObject.addChild(child);

            expect(child.parent).to.equal(gameObject);
          });

          it('should update the world property', () => {
            let child = GameObject({
              x: 10,
              y: 20
            });
            gameObject.x = 30;
            gameObject.y = 40;
            gameObject.addChild(child);

            expect(child.world.x).to.equal(40);
            expect(child.world.y).to.equal(60);
          });
        } else {
          it('should not have addChild', () => {
            expect(gameObject.addChild).to.not.exist;
          });
        }
      });

      // --------------------------------------------------
      // removeChild
      // --------------------------------------------------
      describe('removeChild', () => {
        if (testContext.GAMEOBJECT_GROUP) {
          it('should remove the object as a child', () => {
            let child = {
              foo: 'bar'
            };
            gameObject.addChild(child);
            gameObject.removeChild(child);

            expect(gameObject.children.length).to.equal(0);
          });

          it('should add multiple objects as a child', () => {
            let child1 = {
              foo: 'bar'
            };
            let child2 = {};
            gameObject.addChild(child1, child2);
            gameObject.removeChild(child1, child2);

            expect(gameObject.children).deep.equal([]);
          });

          it('should add an array objects as a child', () => {
            let child1 = {
              foo: 'bar'
            };
            let child2 = {};
            gameObject.addChild(child1, child2);
            gameObject.removeChild([child1, child2]);

            expect(gameObject.children).deep.equal([]);
          });

          it('should remove the childs parent', () => {
            let child = {
              foo: 'bar'
            };
            gameObject.addChild(child);
            gameObject.removeChild(child);

            expect(child.parent).to.equal(null);
          });

          it('should not error if child was not added', () => {
            let child = {
              foo: 'bar'
            };

            function fn() {
              gameObject.removeChild(child);
            }

            expect(fn).to.not.throw();
          });

          it('should update the world property', () => {
            let child = GameObject({
              x: 10,
              y: 20
            });
            gameObject.x = 30;
            gameObject.y = 40;
            gameObject.addChild(child);
            gameObject.removeChild(child);

            expect(child.world.x).to.equal(10);
            expect(child.world.y).to.equal(20);
          });
        } else {
          it('should not have removeChild', () => {
            expect(gameObject.removeChild).to.not.exist;
          });
        }
      });

      // --------------------------------------------------
      // children
      // --------------------------------------------------
      describe('children', () => {
        if (testContext.GAMEOBJECT_GROUP) {
          it('should properly handle setting children', () => {
            gameObject.addChild({ foo: 'bar' });
            gameObject.addChild({ faz: 'baz' });
            gameObject.addChild({ hello: 'world' });

            let removeSpy = sinon.spy(gameObject, 'removeChild');
            let addSpy = sinon.spy(gameObject, 'addChild');
            let child = {
              thing1: 'thing2'
            };

            let oldChildren = gameObject.children;
            gameObject.children = [child];

            expect(removeSpy.calledWith(oldChildren)).to.be.true;
            expect(addSpy.calledWith([child])).to.be.true;
            expect(gameObject.children.length).to.equal(1);
            expect(gameObject.children[0]).to.equal(child);
          });
        } else {
          it('should not have children', () => {
            expect(gameObject.children).to.not.exist;
          });
        }
      });

      // --------------------------------------------------
      // update
      // --------------------------------------------------
      describe('update', () => {
        it('should call the default update function', () => {
          spy = sinon.spy(GameObjectClass.prototype, 'advance');

          // redeclare now that the spy is set
          gameObject = GameObject();
          gameObject.update();

          expect(spy.called).to.be.true;
        });

        it('should call a custom update function', () => {
          spy = sinon.spy();
          let gameObject = GameObject({
            update: spy
          });

          gameObject.update();

          expect(spy.called).to.be.true;
        });

        if (testContext.GAMEOBJECT_GROUP) {
          it('should call update on each child', () => {
            let child = {
              update: sinon.stub()
            };

            gameObject.addChild(child);
            gameObject.update();

            expect(child.update.called).to.be.true;
          });
        } else {
          it('should not call update on each child', () => {
            let child = {
              update: sinon.stub()
            };

            gameObject.children = [child];

            gameObject.update();

            expect(child.update.called).to.be.false;
          });
        }
      });
    });

    // --------------------------------------------------
    // setScale
    // --------------------------------------------------
    describe('setScale', () => {
      if (testContext.GAMEOBJECT_SCALE) {
        it('should set the x and y scale', () => {
          gameObject.setScale(2, 2);

          expect(gameObject.scaleX).to.equal(2);
          expect(gameObject.scaleY).to.equal(2);
        });

        it('should default y to the x argument', () => {
          gameObject.setScale(2);

          expect(gameObject.scaleX).to.equal(2);
          expect(gameObject.scaleY).to.equal(2);
        });
      } else {
        it('should not have setScale', () => {
          expect(gameObject.setScale).to.not.exist;
        });
      }
    });
  }
);
