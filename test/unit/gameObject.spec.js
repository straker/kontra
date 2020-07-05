import GameObject from '../../src/gameObject.js'
import { getContext } from '../../src/core.js'
import { noop } from '../../src/utils.js'

let testGameObject = GameObject();

// optional properties used to test that each permutation of
// options works correctly
let hasGroup = testGameObject.hasOwnProperty('children');
let hasVelocity = testGameObject.hasOwnProperty('velocity');
let hasAcceleration = testGameObject.hasOwnProperty('acceleration');
let hasRotation = typeof testGameObject.rotation !== 'undefined';
let hasTTL = testGameObject.hasOwnProperty('ttl');
let hasAnchor = testGameObject.hasOwnProperty('anchor');
let hasCamera = typeof testGameObject.sx !== 'undefined';
let hasScale = testGameObject.hasOwnProperty('scale');
let hasOpacity = typeof testGameObject.opacity !== 'undefined';

let properties = {
  group: hasGroup,
  velocity: hasVelocity,
  acceleration: hasAcceleration,
  rotation: hasRotation,
  ttl: hasTTL,
  anchor: hasAnchor,
  camera: hasCamera,
  scale: hasScale,
  opacity: hasOpacity
};

// --------------------------------------------------
// gameObject
// --------------------------------------------------
describe('gameObject with properties: ' + JSON.stringify(properties,null,4), () => {

  // --------------------------------------------------
  // init
  // --------------------------------------------------
  describe('init', () => {

    it('should set default properties on the gameObject when passed no arguments', () => {
      let gameObject = GameObject();

      // defaults
      expect(gameObject.context).to.equal(getContext());
      expect(gameObject.width).to.equal(0);
      expect(gameObject.height).to.equal(0);
      expect(gameObject.position.constructor.name).to.equal('Vector');

      // options
      if (hasGroup) {
        expect(gameObject.children).to.eql([]);
      }

      if (hasVelocity) {
        expect(gameObject.velocity.constructor.name).to.equal('Vector');
      }
      if (hasAcceleration) {
        expect(gameObject.acceleration.constructor.name).to.equal('Vector');
      }

      if (hasRotation) {
        expect(gameObject.rotation).to.equal(0);
      }

      if (hasTTL) {
        expect(gameObject.ttl).to.equal(Infinity);
      }

      if (hasAnchor) {
        expect(gameObject.anchor).to.eql({x: 0, y: 0});
      }

      if (hasCamera) {
        expect(gameObject.sx).to.equal(0);
        expect(gameObject.sy).to.equal(0);
      }

      if (hasScale) {
        expect(gameObject.scale).to.eql({x: 1, y: 1});
      }

      if (hasOpacity) {
        expect(gameObject.opacity).to.equal(1);
      }
    });

    it('should set basic properties of width, height, color, x, and y', () => {
      let gameObject = GameObject({
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

      let gameObject = GameObject({
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
      let gameObject = GameObject();

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
      let gameObject = GameObject({
        foo: 'bar',
        alive: true
      });

      expect(gameObject.foo).to.equal('bar');
      expect(gameObject.alive).to.be.true;
    });

    if (hasTTL) {
      it('should have required properties for kontra.pool', () => {
        let gameObject = GameObject();
        expect(typeof gameObject.init).to.equal('function');
        expect(typeof gameObject.update).to.equal('function');
        expect(typeof gameObject.isAlive).to.equal('function');
      });
    }

    if (hasGroup) {
      it('should call addChild for passed in children', () => {
        let spy = sinon.spy(GameObject.prototype, 'addChild');

        let gameObject = GameObject({
          children: [GameObject(), GameObject()]
        });

        expect(spy.calledTwice).to.be.true;

        GameObject.prototype.addChild.restore();
      });
    }

    if (hasScale) {
      it('should call setScale with the passed in scale', () => {
        let spy = sinon.spy(GameObject.prototype, 'setScale');

        let gameObject = GameObject({
          scale: {x: 2, y: 2}
        });

        expect(spy.calledWith(2, 2)).to.be.true;

        GameObject.prototype.setScale.restore();
      });
    }

  });





  // --------------------------------------------------
  // update
  // --------------------------------------------------
  describe('update', () => {

    if (hasVelocity || hasAcceleration) {
      it('should move a rect gameObject by its velocity and acceleration', () => {
        let gameObject = GameObject({
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

    if (hasTTL) {
      it('should decrement ttl', () => {
        let gameObject = GameObject({
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

    if (hasCamera) {
      it('should draw the gameObject at the viewX and viewY', () => {
        let gameObject = GameObject({
          x: 10,
          y: 20
        });

        sinon.stub(gameObject.context, 'translate').callsFake(noop);

        gameObject.render();

        expect(gameObject.context.translate.firstCall.calledWith(10, 20)).to.be.true;

        gameObject.context.translate.resetHistory();
        gameObject.sx = 200;
        gameObject.sy = 200;

        gameObject.render();

        expect(gameObject.context.translate.firstCall.calledWith(-190, -180)).to.be.true;

        gameObject.context.translate.restore();
      });

      it('should not translate if sx and sy are 0', () => {
        let gameObject = GameObject({
          x: 0,
          y: 0
        });

        sinon.stub(gameObject.context, 'translate').callsFake(noop);

        gameObject.render();

        expect(gameObject.context.translate.called).to.be.false;

        gameObject.context.translate.restore();
      });
    }

    if (hasRotation) {
      it('should rotate the gameObject', () => {
        let gameObject = GameObject({
          x: 10,
          y: 20,
          rotation: Math.PI
        });

        sinon.stub(gameObject.context, 'rotate').callsFake(noop);

        gameObject.render();

        expect(gameObject.context.rotate.calledWith(Math.PI)).to.be.true;

        gameObject.context.rotate.restore();
      });

      it('should not rotate if sx and sy are 0', () => {
        let gameObject = GameObject({
          rotation: 0
        });

        sinon.stub(gameObject.context, 'rotate').callsFake(noop);

        gameObject.render();

        expect(gameObject.context.rotate.called).to.be.false;

        gameObject.context.rotate.restore();
      });
    }

    if (hasAnchor) {
      it('should take into account gameObject.anchor', () => {
        let gameObject = GameObject({
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

        sinon.stub(gameObject.context, 'translate').callsFake(noop);

        gameObject.render();

        expect(gameObject.context.translate.secondCall.calledWith(-50, -25)).to.be.true;

        gameObject.context.translate.resetHistory();
        gameObject.anchor = {x: 1, y: 1};
        gameObject.render();

        expect(gameObject.context.translate.secondCall.calledWith(-100, -50)).to.be.true;

        gameObject.context.translate.restore();
      });

      it('should not translate if anchor.x and anchor.y are 0', () => {
        let gameObject = GameObject({
          x: 0,
          y: 0,
          anchor: {x: 0, y: 0}
        });

        sinon.stub(gameObject.context, 'translate').callsFake(noop);

        gameObject.render();

        expect(gameObject.context.translate.called).to.be.false;

        gameObject.context.translate.restore();
      });
    }

    if (hasAnchor && hasScale) {
      it('should take into account the scaled with and height and anchor', () => {
        let gameObject = GameObject({
          x: 10,
          y: 20,
          width: 100,
          height: 50,
          anchor: {
            x: 0.5,
            y: 0.5
          },
          scale: {x: 2, y: 2},
          color: true
        });

        sinon.stub(gameObject.context, 'translate').callsFake(noop);

        gameObject.render();

        expect(gameObject.context.translate.secondCall.calledWith(-100, -50)).to.be.true;

        gameObject.context.translate.resetHistory();
        gameObject.scale = {x: 1, y: 1};
        gameObject.render();

        expect(gameObject.context.translate.secondCall.calledWith(-50, -25)).to.be.true;

        gameObject.context.translate.restore();
      });
    }

    if (hasScale) {
      it('should scale the canvas', () => {
        let gameObject = GameObject({
          x: 10,
          y: 20,
          width: 100,
          height: 50,
          scale: {x: 2, y: 2},
          color: true
        });

        sinon.stub(gameObject.context, 'scale').callsFake(noop);

        gameObject.render();

        expect(gameObject.context.scale.calledWith(2, 2)).to.be.true;

        gameObject.context.scale.resetHistory();
        gameObject.scale = {x: 1, y: 1};
        gameObject.render();

        expect(gameObject.context.scale.calledWith(1, 1)).to.be.true;

        gameObject.context.scale.restore();
      });

      it('should not scale if scale.x and scale.y are 0', () => {
        let gameObject = GameObject({
          scale: {x: 0, y: 0}
        });

        sinon.stub(gameObject.context, 'scale').callsFake(noop);

        gameObject.render();

        expect(gameObject.context.scale.called).to.be.false;

        gameObject.context.scale.restore();
      });
    }

    if (hasGroup) {
      it('should call render on each child', () => {
        let child = {
          render: sinon.stub()
        };

        let gameObject = GameObject({
          x: 10,
          y: 20,
          width: 100,
          height: 50,
          children: [child],
          color: true
        });

        gameObject.render();

        expect(child.render.called).to.be.true;
      });
    }

    if (hasOpacity) {
      it('should set the globalAlpha', () => {
        let gameObject = GameObject({
          x: 0,
          y: 0,
          opacity: 1
        });

        var spy = sinon.spy(gameObject.context, 'globalAlpha', ['set']);

        gameObject.render();

        expect(spy.set.called).to.be.true;

        spy.restore();
      });
    }

  });





  // --------------------------------------------------
  // isAlive
  // --------------------------------------------------
  if (hasTTL) {
    describe('isAlive', () => {

      it('should return true when the gameObject is alive', () => {
        let gameObject = GameObject();

        expect(gameObject.isAlive()).to.be.true;

        gameObject.ttl = 1;

        expect(gameObject.isAlive()).to.be.true;
      });

      it('should return false when the gameObject is not alive', () => {
        let gameObject = GameObject({
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
        let gameObject = GameObject({
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
        let gameObject = GameObject({
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

      // --------------------------------------------------
      // addChild
      // --------------------------------------------------
      describe('addChild', () => {

        it('should add the object as a child', () => {
          let gameObject = GameObject();
          let child = {
            foo: 'bar'
          };
          gameObject.addChild(child);

          expect(gameObject.children).deep.equal([child]);
        });

        it('should set the childs parent to the game object', () => {
          let gameObject = GameObject();
          let child = {
            foo: 'bar'
          };
          gameObject.addChild(child);

          expect(child.parent).to.equal(gameObject);
        });

        it('should set the childs relative position', () => {
          let gameObject = GameObject({
            x: 30,
            y: 35
          });
          let child = GameObject({
            x: 0,
            y: 0
          });

          gameObject.addChild(child);

          expect(child.x).to.equal(30);
          expect(child.y).to.equal(35);
        });

        it('should set the childs absolute position', () => {
          let gameObject = GameObject({
            x: 30,
            y: 35
          });
          let child = GameObject({
            x: 0,
            y: 0
          });

          gameObject.addChild(child, { absolute: true });

          expect(child.x).to.equal(0);
          expect(child.y).to.equal(0);
        });

        if (hasRotation) {
          it('should set the childs rotation', () => {
            let gameObject = GameObject({
              x: 20,
              y: 20,
              rotation: 30
            });
            let child = GameObject({
              x: 30,
              y: 35,
              rotation: 10
            });

            gameObject.addChild(child);

            expect(child.rotation).to.equal(40);
          });
        }

        if (hasScale) {
          it('should set the childs scale', () => {
            let gameObject = GameObject({
              x: 20,
              y: 20,
              scale: {x: 2, y: 2}
            });
            let child = GameObject({
              x: 30,
              y: 35,
              scale: {x: 1, y: 1}
            });

            gameObject.addChild(child);

            expect(child.scale.x).to.equal(2);
            expect(child.scale.y).to.equal(2);
          });
        }

        if (hasCamera) {
          it('should set the childs relative sx and sy', () => {
            let gameObject = GameObject({
              x: 20,
              y: 20,
              sx: 30,
              sy: 40,
            });
            let child = GameObject({
              x: 30,
              y: 35,
              sx: 10,
              sy: 10
            });

            gameObject.addChild(child);

            expect(child.sx).to.equal(40);
            expect(child.sy).to.equal(50);
          });

          it('should set the childs absolute sx and sy', () => {
            let gameObject = GameObject({
              x: 20,
              y: 20,
              sx: 30,
              sy: 40,
            });
            let child = GameObject({
              x: 30,
              y: 35,
              sx: 10,
              sy: 10
            });

            gameObject.addChild(child, { absolute: true });

            expect(child.sx).to.equal(10);
            expect(child.sy).to.equal(10);
          });
        }

        if (hasOpacity) {
          it('should set the childs final opacity', () => {
            let gameObject = GameObject({
              x: 20,
              y: 20,
              opacity: 0.5
            });
            let child = GameObject({
              x: 30,
              y: 35,
              opacity: 1
            });

            gameObject.addChild(child);

            expect(child.finalOpacity).to.equal(0.5);
          });

          it('should not change the childs opacity', () => {
            let gameObject = GameObject({
              x: 20,
              y: 20,
              opacity: 0.5
            });
            let child = GameObject({
              x: 30,
              y: 35,
              opacity: 1
            });

            gameObject.addChild(child);

            expect(child.opacity).to.equal(1);
          });
        }

      });





      // --------------------------------------------------
      // removeChild
      // --------------------------------------------------
      describe('removeChild', () => {

        it('should remove the object as a child', () => {
          let gameObject = GameObject();
          let child = {
            foo: 'bar'
          };
          gameObject.addChild(child);
          gameObject.removeChild(child);

          expect(gameObject.children.length).to.equal(0);
        });

        it('should remove the childs parent', () => {
          let gameObject = GameObject();
          let child = {
            foo: 'bar'
          };
          gameObject.addChild(child);
          gameObject.removeChild(child);

          expect(child.parent).to.equal(null);
        });

        it('should not error if child was not added', () => {
          let gameObject = GameObject();
          let child = {
            foo: 'bar'
          };

          function fn() {
            gameObject.removeChild(child);
          }

          expect(fn).to.not.throw();
        });
      });





      // --------------------------------------------------
      // x/y/rotation/sx/sy
      // --------------------------------------------------
      let props = ['x', 'y'];
      if (hasRotation) {
        props.push('rotation');
      }
      if (hasCamera) {
        props.push('sx', 'sy');
      }

      props.forEach(prop => {
        describe(`gameObject.${prop}`, () => {
          let gameObject, child;

          beforeEach(() => {
            gameObject = GameObject({
              [prop]: 15
            });
            child = GameObject();
            gameObject.addChild(child);
          });

          it(`should set the ${prop}`, () => {
            child[prop] = 20;

            expect(child[prop]).to.equal(20);
          });

          it(`should not change the parent ${prop}`, () => {
            child[prop] = 20;

            expect(gameObject[prop]).to.equal(15);
          });

          it('should update all children', () => {
            let child2 = GameObject();
            gameObject.addChild(child2);

            child[prop] = 10;
            child2[prop] = 5;

            gameObject[prop] = 20;

            expect(child[prop]).to.equal(15);
            expect(child2[prop]).to.equal(10);
          });

          it('should update the entire child hierarchy', () => {
            let child2 = GameObject();
            let child3 = GameObject();
            child.addChild(child2);
            child2.addChild(child3);

            child[prop] = 10;
            child2[prop] = 5;
            child3[prop] = 15;

            gameObject[prop] = 20;

            expect(child[prop]).to.equal(15);
            expect(child2[prop]).to.equal(10);
            expect(child3[prop]).to.equal(20);
          });

        });
      });

      if (hasOpacity) {
        describe(`gameObject.finalOpacity`, () => {
          let gameObject, child;

          beforeEach(() => {
            gameObject = GameObject({
              opacity: 1
            });
            child = GameObject();
            gameObject.addChild(child);
          });

          it(`should set the finalOpacity`, () => {
            child.opacity = 0.5;

            expect(child.finalOpacity).to.equal(0.5);
          });

          it(`should not change the parent opacity`, () => {
            child.opacity = 0.5;

            expect(gameObject.opacity).to.equal(1);
          });

          it('should update all children', () => {
            let child2 = GameObject();
            gameObject.addChild(child2);

            child.opacity = 0.5;
            child2.opacity = 0.25;

            gameObject.opacity = 0.75;

            expect(child.finalOpacity).to.equal(0.375);
            expect(child2.finalOpacity).to.equal(0.1875);
          });

          it('should update the entire child hierarchy', () => {
            let child2 = GameObject();
            let child3 = GameObject();
            child.addChild(child2);
            child2.addChild(child3);

            child.opacity = 0.5;
            child2.opacity = 0.5;
            child3.opacity = 0.5;

            gameObject.opacity = 0.75;

            expect(child.finalOpacity).to.equal(0.375);
            expect(child2.finalOpacity).to.equal(0.1875);
            expect(child3.finalOpacity).to.equal(0.09375);
          });

          it('should update the final opacity of a sprite in the middle of the hierarchy', () => {
            let child2 = GameObject();
            let child3 = GameObject();
            child.addChild(child2);
            child2.addChild(child3);

            child.opacity = 0.5;
            child2.opacity = 0.5;
            child3.opacity = 0.5;

            child2.opacity = 0.75;

            expect(child2.finalOpacity).to.equal(0.375);
          });

        });
      }

    });
  }





  if (hasScale) {
    // --------------------------------------------------
    // setScale
    // --------------------------------------------------
    describe('setScale', () => {

      it('should set the x and y scale', () => {
        let gameObject = GameObject();
        gameObject.setScale(2, 2);

        expect(gameObject.scale.x).to.equal(2);
        expect(gameObject.scale.y).to.equal(2);
      });

      it('should default y to the x argument', () => {
        let gameObject = GameObject();
        gameObject.setScale(2);

        expect(gameObject.scale.x).to.equal(2);
      });

      if (hasGroup) {
        it('should update all children', () => {
            let gameObject = GameObject({
              scale: {x: 15, y: 15}
            });
            let child = GameObject();
            gameObject.addChild(child);

            let child2 = GameObject();
            gameObject.addChild(child2);

            child.scale = {x: 10, y: 10};
            child2.scale = {x: 5, y: 5};

            gameObject.setScale(20, 20);

            expect(child.scale).to.eql({x: 15, y: 15});
            expect(child2.scale).to.eql({x: 10, y: 10});
        });
      }
    });





    // --------------------------------------------------
    // scaledWidth/scaledHeight
    // --------------------------------------------------
    describe('scaledWidth/scaledHeight', () => {
      it('should return the scaled width', () => {
        let gameObject = GameObject({
          width: 20,
          scale: {x: 2, y: 2}
        });

        expect(gameObject.scaledWidth).to.equal(40);
      });

      it('should return the scaled height', () => {
        let gameObject = GameObject({
          height: 20,
          scale: {x: 2, y: 2}
        });

        expect(gameObject.scaledHeight).to.equal(40);
      });
    });
  }

});
