import GameObject from './gameObject.js'
import { init, getCanvas, getContext } from '../../src/core.js'
import { noop } from '../../src/utils.js'

let testGameObject = new GameObject();

// optional properties
let hasGroup = testGameObject.hasOwnProperty('children');
let hasVelocity = testGameObject.hasOwnProperty('velocity');
let hasAcceleration = testGameObject.hasOwnProperty('acceleration');
let hasRotation = typeof testGameObject.rotation !== 'undefined';
let hasTTL = testGameObject.hasOwnProperty('ttl');
let hasAnchor = testGameObject.hasOwnProperty('anchor');
let hasCamera = testGameObject.hasOwnProperty('sx');

let properties = {
  group: hasGroup,
  velocity: hasVelocity,
  acceleration: hasAcceleration,
  rotation: hasRotation,
  ttl: hasTTL,
  anchor: hasAnchor,
  camera: hasCamera
};

// --------------------------------------------------
// gameObject
// --------------------------------------------------
describe('gameObject with properties: ' + JSON.stringify(properties,null,4), () => {

  before(() => {
    if (!getCanvas()) {
      let canvas = document.createElement('canvas');
      canvas.width = canvas.height = 600;
      init(canvas);
    }
  });

  // --------------------------------------------------
  // init
  // --------------------------------------------------
  describe('init', () => {

    it('should set default properties on the gameObject when passed no arguments', () => {
      let gameObject = new GameObject();

      // defaults
      expect(gameObject.context).to.equal(getContext());
      expect(gameObject.width).to.equal(0);
      expect(gameObject.height).to.equal(0);
      expect(gameObject.position.constructor.name).to.equal('Vector');

      // options
      if (hasVelocity) {
        expect(gameObject.velocity.constructor.name).to.equal('Vector');
      }
      if (hasAcceleration) {
        expect(gameObject.acceleration.constructor.name).to.equal('Vector');
      }
      if (hasTTL) {
        expect(gameObject.ttl).to.equal(Infinity);
      }
    });

    it('should set basic properties of width, height, color, x, and y', () => {
      let gameObject = new GameObject({
        x: 10,
        y: 20,
        color: 'red',
        width: 5,
        height: 15
      });

      expect(gameObject.x).to.equal(10);
      expect(gameObject.y).to.equal(20);
      expect(gameObject.color).to.equal('red');
      expect(gameObject.width).to.equal(5);
      expect(gameObject.height).to.equal(15);
    });

    it('should set properties of velocity, acceleration, and a different context', () => {
      let context = {foo: 'bar'};

      let gameObject = new GameObject({
        dx: 2,
        dy: 1,
        ddx: 0.5,
        ddy: 0.2,
        context: context
      });

      expect(gameObject.dx).to.equal(2);
      expect(gameObject.dy).to.equal(1);
      expect(gameObject.ddx).to.equal(0.5);
      expect(gameObject.ddy).to.equal(0.2);
      expect(gameObject.context).to.equal(context);
    });

    it('should keep the position, velocity, and acceleration vectors in sync', () => {
      let gameObject = new GameObject();

      gameObject.x = 10;
      gameObject.y = 20;

      if (hasVelocity) {
        gameObject.dx = 2;
        gameObject.dy = 1;
      }
      if (hasAcceleration) {
        gameObject.ddx = 0.5;
        gameObject.ddy = 0.2;
      }

      expect(gameObject.position.x).to.equal(10);
      expect(gameObject.position.y).to.equal(20);

      if (hasVelocity) {
        expect(gameObject.velocity.x).to.equal(2);
        expect(gameObject.velocity.y).to.equal(1);
      }
      if (hasAcceleration) {
        expect(gameObject.acceleration.x).to.equal(0.5);
        expect(gameObject.acceleration.y).to.equal(0.2);
      }
    });

    it('should set all additional properties on the gameObject', () => {
      let gameObject = new GameObject({
        foo: 'bar',
        alive: true
      });

      expect(gameObject.foo).to.equal('bar');
      expect(gameObject.alive).to.be.true;
    });

    if (hasTTL) {
      it('should have required properties for kontra.pool', () => {
        let gameObject = new GameObject();
        expect(typeof gameObject.init).to.equal('function');
        expect(typeof gameObject.update).to.equal('function');
        expect(typeof gameObject.isAlive).to.equal('function');
      });
    }

  });





  // --------------------------------------------------
  // update
  // --------------------------------------------------
  describe('update', () => {

    if (hasVelocity || hasAcceleration) {
      it('should move a rect gameObject by its velocity and acceleration', () => {
        let gameObject = new GameObject({
          x: 10,
          y: 20,
          dx: 2,
          dy: 1,
          ddx: 0.5,
          ddy: 0.2
        });

        gameObject.update();

        if (hasAcceleration && hasVelocity) {
          expect(gameObject.dx).to.equal(2.5);
          expect(gameObject.dy).to.equal(1.2);
          expect(gameObject.x).to.equal(12.5);
          expect(gameObject.y).to.equal(21.2);
        }
        else if (hasVelocity) {
          expect(gameObject.x).to.equal(12);
          expect(gameObject.y).to.equal(21);
        }
      });
    }

    if(hasTTL) {
      it('should decrement ttl', () => {
        let gameObject = new GameObject({
          ttl: 2
        });

        gameObject.update();

        expect(gameObject.ttl).to.equal(1);
      });
    }

  });





  // --------------------------------------------------
  // render
  // --------------------------------------------------
  describe('render', () => {

    if (hasRotation) {
      it('should rotate the gameObject', () => {
        let gameObject = new GameObject({
          x: 10,
          y: 20,
          rotation: Math.PI
        });

        sinon.stub(gameObject.context, 'rotate').callsFake(noop);

        gameObject.render();

        expect(gameObject.context.rotate.calledWith(Math.PI)).to.be.ok;

        gameObject.context.rotate.restore();
      });
    }

    if (hasAnchor) {
      it('should take into account gameObject.anchor', () => {
        let gameObject = new GameObject({
          x: 10,
          y: 20,
          width: 100,
          height: 50,
          anchor: {
            x: 0.5,
            y: 0.5
          },
          color: true
        });

        sinon.stub(gameObject, '_dc').callsFake(noop);

        gameObject.render();

        expect(gameObject._dc.calledWith(-50, -25)).to.be.ok;

        gameObject.anchor = {x: 1, y: 1};
        gameObject.render();

        expect(gameObject._dc.calledWith(-100, -50)).to.be.ok;

        gameObject._dc.restore();
      });
    }

    if (hasCamera) {
      it('should draw the gameObject at the viewX and viewY', () => {
        let gameObject = new GameObject({
          x: 10,
          y: 20
        });

        sinon.stub(gameObject.context, 'translate').callsFake(noop);

        gameObject.render();

        expect(gameObject.context.translate.calledWith(10, 20)).to.be.ok;

        gameObject.sx = 200;
        gameObject.sy = 200;

        gameObject.render();

        expect(gameObject.context.translate.calledWith(-190, -180)).to.be.ok;

        gameObject.context.translate.restore();
      });
    }

  });





  // --------------------------------------------------
  // isAlive
  // --------------------------------------------------
  if (hasTTL) {
    describe('isAlive', () => {

      it('should return true when the gameObject is alive', () => {
        let gameObject = new GameObject();

        expect(gameObject.isAlive()).to.be.true;

        gameObject.ttl = 1;

        expect(gameObject.isAlive()).to.be.true;
      });

      it('should return false when the gameObject is not alive', () => {
        let gameObject = new GameObject({
          ttl: 0
        });

        expect(gameObject.isAlive()).to.be.false;
      });

    });
  }





  // --------------------------------------------------
  // viewX/Y
  // --------------------------------------------------
  if (hasCamera) {
    describe('viewX/Y', () => {

      it('should return the position + camera', () => {
        let gameObject = new GameObject({
          x: 10,
          y: 20
        });

        expect(gameObject.viewX).to.equal(10);
        expect(gameObject.viewY).to.equal(20);

        gameObject.sx = 50;
        gameObject.sy = 50;

        expect(gameObject.viewX).to.equal(-40);
        expect(gameObject.viewY).to.equal(-30);
      });

      it('should be readonly', () => {
        let gameObject = new GameObject({
          x: 10,
          y: 20
        });

        gameObject.viewX = 100;
        gameObject.viewY = 100;

        expect(gameObject.viewX).to.equal(10);
        expect(gameObject.viewY).to.equal(20);
      });

    });
  }





  // --------------------------------------------------
  // group
  // --------------------------------------------------
  if (hasGroup) {
    describe('group', () => {

      it('should set default properties on the gameObject', () => {
        let gameObject = new GameObject();

        expect(gameObject.localPosition.constructor.name).to.equal('Vector');
        expect(Array.isArray(gameObject.children)).to.be.true;

        if (hasRotation) {
          expect(gameObject.localRotation).to.equal(0);
        }
      });





      // --------------------------------------------------
      // addChild
      // --------------------------------------------------
      describe('addChild', () => {

        it('should add the object as a child', () => {
          let gameObject = new GameObject();
          let child = {
            foo: 'bar'
          };
          gameObject.addChild(child);

          expect(gameObject.children).deep.equal([child]);
        });

        it('should set the childs parent to the game object', () => {
          let gameObject = new GameObject();
          let child = {
            foo: 'bar'
          };
          gameObject.addChild(child);

          expect(child.parent).to.equal(gameObject);
        });

        it('should set the childs localPosition', () => {
          let gameObject = new GameObject({
            x: 20,
            y: 20
          });
          let child = new GameObject({
            x: 30,
            y: 35
          });

          gameObject.addChild(child);

          expect(child.x).to.equal(30);
          expect(child.y).to.equal(35);
          expect(child.localPosition.x).to.equal(10);
          expect(child.localPosition.y).to.equal(15);
        });

        if (hasRotation) {
          it('should set the childs localRotation', () => {
            let gameObject = new GameObject({
              x: 20,
              y: 20,
              rotation: 10
            });
            let child = new GameObject({
              x: 30,
              y: 35,
              rotation: 30
            });

            gameObject.addChild(child);

            expect(child.rotation).to.equal(30)
            expect(child.localRotation).to.equal(20);
          });
        }

      });





      // --------------------------------------------------
      // removeChild
      // --------------------------------------------------
      describe('removeChild', () => {

        it('should remove the object as a child', () => {
          let gameObject = new GameObject();
          let child = {
            foo: 'bar'
          };
          gameObject.addChild(child);
          gameObject.removeChild(child);

          expect(gameObject.children.length).to.equal(0);
        });

        it('should remove the childs parent', () => {
          let gameObject = new GameObject();
          let child = {
            foo: 'bar'
          };
          gameObject.addChild(child);
          gameObject.removeChild(child);

          expect(child.parent).to.equal(null);
        });

        it('should set the childs localPosition to its position', () => {
          let gameObject = new GameObject({
            x: 20,
            y: 20
          });
          let child = new GameObject({
            x: 30,
            y: 35
          });

          gameObject.addChild(child);
          gameObject.removeChild(child);

          expect(child.x).to.equal(30);
          expect(child.y).to.equal(35);
          expect(child.localPosition.x).to.equal(30);
          expect(child.localPosition.y).to.equal(35);
        });

        if (hasRotation) {
          it('should set the childs localRotation to its rotation', () => {
            let gameObject = new GameObject({
              x: 20,
              y: 20,
              rotation: 10
            });
            let child = new GameObject({
              x: 30,
              y: 35,
              rotation: 30
            });

            gameObject.addChild(child);
            gameObject.removeChild(child);

            expect(child.rotation).to.equal(30)
            expect(child.localRotation).to.equal(30);
          });
        }

      });





      // --------------------------------------------------
      // rotation/x/y
      // --------------------------------------------------
      let props = ['x', 'y'];
      if (hasRotation) {
        props.push('rotation');
      }

      props.forEach(prop => {
        describe(`position.${prop}`, () => {
          let gameObject, child;

          beforeEach(() => {
            gameObject = new GameObject({
              [prop]: 15
            });
            child = new GameObject();
            gameObject.addChild(child);
          });

          it(`should set the ${prop}`, () => {
            child[prop] = 20;

            expect(child[prop]).to.equal(20);
          });

          it(`should set the local ${prop} relative to the parent`, () => {
            child[prop] = 20;

            if (prop === 'rotation') {
              expect(child.localRotation).to.equal(5);
            }
            else {
              expect(child.localPosition[prop]).to.equal(5);
            }
          });

          it(`should not change the parent ${prop}`, () => {
            child[prop] = 20;

            expect(gameObject[prop]).to.equal(15);
          });

          it(`should update the local ${prop} each time`, () => {
            child[prop] = 20;
            child[prop] = 40;
            child[prop] = 60;

            if (prop === 'rotation') {
              expect(child.localRotation).to.equal(45);
            }
            else {
              expect(child.localPosition[prop]).to.equal(45);
            }
          });

          it('should update all child positions', () => {
            let child2 = new GameObject();
            gameObject.addChild(child2);

            if (prop === 'rotation') {
              child.localRotation = 10;
              child2.localRotation = 5;
            }
            else {
              child.localPosition[prop] = 10;
              child2.localPosition[prop] = 5;
            }

            gameObject[prop] = 20;

            expect(child[prop]).to.equal(30);
            expect(child2[prop]).to.equal(25);
          });

          it('should update the entire child hierarchy', () => {
            let child2 = new GameObject();
            let child3 = new GameObject();
            child.addChild(child2);
            child2.addChild(child3);

            if (prop === 'rotation') {
              child.localRotation = 10;
              child2.localRotation = 5;
              child3.localRotation = 15;
            }
            else {
              child.localPosition[prop] = 10;
              child2.localPosition[prop] = 5;
              child3.localPosition[prop] = 15;
            }

            gameObject[prop] = 20;

            expect(child[prop]).to.equal(30);
            expect(child2[prop]).to.equal(35);
            expect(child3[prop]).to.equal(50);
          });

        });
      });

    });
  }

});
