import Updatable from '../../src/updatable.js';
import Vector, { VectorClass } from '../../src/vector.js';

// test-context:start
let testContext = {
  GAMEOBJECT_VELOCITY: true,
  GAMEOBJECT_ACCELERATION: true,
  GAMEOBJECT_TTL: true,
  VECTOR_SCALE: true
};
// test-context:end

// --------------------------------------------------
// updatable
// --------------------------------------------------
describe(
  'updatable with context: ' + JSON.stringify(testContext, null, 4),
  () => {
    let object;
    beforeEach(() => {
      object = new Updatable();
    });

    // --------------------------------------------------
    // constructor
    // --------------------------------------------------
    describe('constructor', () => {
      let spy;
      afterEach(() => {
        spy.restore();
      });

      it('should call init', () => {
        spy = sinon.spy(Updatable.prototype, 'init');

        let props = {};
        object = new Updatable(props);

        expect(spy.calledWith(props)).to.be.true;
      });
    });

    // --------------------------------------------------
    // init
    // --------------------------------------------------
    describe('init', () => {
      it('should default position', () => {
        expect(object.position instanceof VectorClass).to.be.true;
        expect(object.position.x).to.equal(0);
        expect(object.position.y).to.equal(0);
      });

      if (testContext.GAMEOBJECT_VELOCITY) {
        it('should default velocity', () => {
          expect(object.velocity instanceof VectorClass).to.be.true;
          expect(object.velocity.x).to.equal(0);
          expect(object.velocity.y).to.equal(0);
        });
      } else {
        it('should not have velocity', () => {
          expect(object.velocity).to.not.exist;
        });
      }

      if (testContext.GAMEOBJECT_ACCELERATION) {
        it('should default acceleration', () => {
          expect(object.acceleration instanceof VectorClass).to.be
            .true;
          expect(object.acceleration.x).to.equal(0);
          expect(object.acceleration.y).to.equal(0);
        });
      } else {
        it('should not have acceleration', () => {
          expect(object.acceleration).to.not.exist;
        });
      }

      if (testContext.GAMEOBJECT_TTL) {
        it('should default ttl', () => {
          expect(object.ttl).to.equal(Infinity);
        });
      } else {
        it('should not have ttl', () => {
          expect(object.ttl).to.not.exist;
        });
      }

      if (testContext.GAMEOBJECT_VELOCITY) {
        it('should set dx and dy properties', () => {
          object = new Updatable({ dx: 10, dy: 20 });

          expect(object.velocity.x).to.equal(10);
          expect(object.velocity.y).to.equal(20);
        });
      }

      if (testContext.GAMEOBJECT_ACCELERATION) {
        it('should set ddx and ddy properties', () => {
          object = new Updatable({ ddx: 10, ddy: 20 });

          expect(object.acceleration.x).to.equal(10);
          expect(object.acceleration.y).to.equal(20);
        });
      }

      if (testContext.GAMEOBJECT_TTL) {
        it('should set ttl property', () => {
          object = new Updatable({ ttl: 20 });

          expect(object.ttl).to.equal(20);
        });
      }

      it('should set any property', () => {
        object = new Updatable({ myProp: 'foo' });

        expect(object.myProp).to.equal('foo');
      });
    });

    // --------------------------------------------------
    // velocity
    // --------------------------------------------------
    if (testContext.GAMEOBJECT_VELOCITY) {
      describe('velocity', () => {
        it('should set the velocity x property', () => {
          object.dx = 10;

          expect(object.velocity.x).to.equal(10);
        });

        it('should return the velocity x property', () => {
          object.velocity.x = 10;

          expect(object.dx).to.equal(10);
        });

        it('should set the velocity y property', () => {
          object.dy = 10;

          expect(object.velocity.y).to.equal(10);
        });

        it('should return the velocity y property', () => {
          object.velocity.y = 10;

          expect(object.dy).to.equal(10);
        });
      });
    }

    // --------------------------------------------------
    // acceleration
    // --------------------------------------------------
    if (testContext.GAMEOBJECT_ACCELERATION) {
      describe('acceleration', () => {
        it('should set the acceleration x property', () => {
          object.ddx = 10;

          expect(object.acceleration.x).to.equal(10);
        });

        it('should return the acceleration x property', () => {
          object.acceleration.x = 10;

          expect(object.ddx).to.equal(10);
        });

        it('should set the acceleration y property', () => {
          object.ddy = 10;

          expect(object.acceleration.y).to.equal(10);
        });

        it('should return the acceleration y property', () => {
          object.acceleration.y = 10;

          expect(object.ddy).to.equal(10);
        });
      });
    }

    // --------------------------------------------------
    // isAlive
    // --------------------------------------------------
    if (testContext.GAMEOBJECT_TTL) {
      describe('isAlive', () => {
        it('should return true if ttl is above 0', () => {
          object.ttl = 20;

          expect(object.isAlive()).to.be.true;
        });

        it('should return true if ttl is less than 0', () => {
          object.ttl = 0;

          expect(object.isAlive()).to.be.false;

          object.ttl = -20;

          expect(object.isAlive()).to.be.false;
        });
      });
    }

    // --------------------------------------------------
    // update
    // --------------------------------------------------
    describe('update', () => {
      it('should call the advance function', () => {
        sinon.stub(object, 'advance');

        object.update();

        expect(object.advance.called).to.be.true;
      });

      it('should pass dt', () => {
        sinon.stub(object, 'advance');

        object.update(1 / 60);

        expect(object.advance.calledWith(1 / 60)).to.be.true;
      });
    });

    // --------------------------------------------------
    // advance
    // --------------------------------------------------
    describe('advance', () => {
      if (
        testContext.GAMEOBJECT_VELOCITY &&
        testContext.GAMEOBJECT_ACCELERATION
      ) {
        it('should add the acceleration to the velocity', () => {
          object.velocity = Vector(5, 10);
          object.acceleration = Vector(15, 20);

          object.advance();

          expect(object.velocity.x).to.equal(20);
          expect(object.velocity.y).to.equal(30);
        });

        if (testContext.VECTOR_SCALE) {
          it('should use dt to scale the acceleration', () => {
            object.velocity = Vector(5, 10);
            object.acceleration = Vector(10, 20);

            object.advance(0.5);

            expect(object.velocity.x).to.equal(10);
            expect(object.velocity.y).to.equal(20);
          });
        } else {
          it('should not use dt to scale the acceleration', () => {
            object.velocity = Vector(5, 10);
            object.acceleration = Vector(15, 20);

            object.advance(0.5);

            expect(object.velocity.x).to.equal(20);
            expect(object.velocity.y).to.equal(30);
          });
        }
      }

      if (testContext.GAMEOBJECT_VELOCITY) {
        it('should add the velocity to the position', () => {
          object.position = Vector(5, 10);
          object.velocity = Vector(15, 20);

          object.advance();

          expect(object.position.x).to.equal(20);
          expect(object.position.y).to.equal(30);
        });

        if (testContext.VECTOR_SCALE) {
          it('should use dt to scale the velocity', () => {
            object.position = Vector(5, 10);
            object.velocity = Vector(10, 20);

            object.advance(0.5);

            expect(object.position.x).to.equal(10);
            expect(object.position.y).to.equal(20);
          });
        } else {
          it('should not use dt to scale the velocity', () => {
            object.position = Vector(5, 10);
            object.velocity = Vector(15, 20);

            object.advance(0.5);

            expect(object.position.x).to.equal(20);
            expect(object.position.y).to.equal(30);
          });
        }
      } else {
        it('should not modify the position', () => {
          object.position = Vector(5, 10);
          object.velocity = Vector(15, 20);

          object.advance();

          expect(object.position.x).to.equal(5);
          expect(object.position.y).to.equal(10);
        });
      }

      if (testContext.GAMEOBJECT_TTL) {
        it('should update ttl', () => {
          object.ttl = 10;

          object.advance();

          expect(object.ttl).to.equal(9);
        });
      } else {
        it('should not modify the ttl', () => {
          object.ttl = 10;

          object.advance();

          expect(object.ttl).to.equal(10);
        });
      }
    });
  }
);
