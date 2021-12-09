import Vector, { VectorClass } from '../../src/vector.js';

// test-context:start
let testContext = {
  VECTOR_ANGLE: true,
  VECTOR_CLAMP: true,
  VECTOR_DISTANCE: true,
  VECTOR_DOT: true,
  VECTOR_LENGTH: true,
  VECTOR_NORMALIZE: true,
  VECTOR_SCALE: true,
  VECTOR_SUBTRACT: true
};
// test-context:end

// --------------------------------------------------
// vector
// --------------------------------------------------
describe(
  'vector with context: ' + JSON.stringify(testContext, null, 4),
  () => {
    it('should export class', () => {
      expect(VectorClass).to.be.a('function');
    });

    // --------------------------------------------------
    // init
    // --------------------------------------------------
    describe('init', () => {
      it('should set x and y', () => {
        let vector = Vector(10, 20);

        expect(vector.x).to.equal(10);
        expect(vector.y).to.equal(20);
      });
    });

    // --------------------------------------------------
    // add
    // --------------------------------------------------
    describe('add', () => {
      it('should add one vector to another', () => {
        let vector1 = Vector(10, 20);
        let vector2 = Vector(5, 10);

        let vector = vector1.add(vector2);

        expect(vector.x).to.deep.equal(15);
        expect(vector.y).to.deep.equal(30);
      });

      it('should not modify either vectors', () => {
        let vector1 = Vector(10, 20);
        let vector2 = Vector(5, 10);

        vector1.add(vector2);

        expect(vector1.x).to.deep.equal(10);
        expect(vector1.y).to.deep.equal(20);
        expect(vector2.x).to.deep.equal(5);
        expect(vector2.y).to.deep.equal(10);
      });
    });

    // --------------------------------------------------
    // subtract
    // --------------------------------------------------
    describe('subtract', () => {
      if (testContext.VECTOR_SUBTRACT) {
        it('should subtract one vector from another', () => {
          let vector1 = Vector(10, 20);
          let vector2 = Vector(5, 10);

          let vector = vector1.subtract(vector2);

          expect(vector.x).to.deep.equal(5);
          expect(vector.y).to.deep.equal(10);
        });

        it('should not modify either vectors', () => {
          let vector1 = Vector(10, 20);
          let vector2 = Vector(5, 10);

          vector1.subtract(vector2);

          expect(vector1.x).to.deep.equal(10);
          expect(vector1.y).to.deep.equal(20);
          expect(vector2.x).to.deep.equal(5);
          expect(vector2.y).to.deep.equal(10);
        });
      } else {
        it('should not have subtract', () => {
          let vector = Vector();
          expect(vector.subtract).to.not.exist;
        });
      }
    });

    // --------------------------------------------------
    // scale
    // --------------------------------------------------
    describe('scale', () => {
      if (testContext.VECTOR_SCALE) {
        it('should scale a vector by a scalar', () => {
          let vector1 = Vector(5, 10);

          let vector = vector1.scale(2);

          expect(vector.x).to.deep.equal(10);
          expect(vector.y).to.deep.equal(20);
        });

        it('should not modify the vector', () => {
          let vector1 = Vector(5, 10);

          vector1.scale(2);

          expect(vector1.x).to.deep.equal(5);
          expect(vector1.y).to.deep.equal(10);
        });
      } else {
        it('should not have scale', () => {
          let vector = Vector();
          expect(vector.scale).to.not.exist;
        });
      }
    });

    // --------------------------------------------------
    // normalize
    // --------------------------------------------------
    describe('normalize', () => {
      if (testContext.VECTOR_NORMALIZE) {
        it('should calculate the normalized vector', () => {
          let vector1 = Vector(4, 3);

          let normalize = vector1.normalize();

          expect(normalize.x).to.deep.equal(4 / 5);
          expect(normalize.y).to.deep.equal(3 / 5);
        });
      } else {
        it('should not have normalize', () => {
          let vector = Vector();
          expect(vector.normalize).to.not.exist;
        });
      }
    });

    // --------------------------------------------------
    // dot
    // --------------------------------------------------
    describe('dot', () => {
      if (testContext.VECTOR_DOT || testContext.VECTOR_ANGLE) {
        it('should calculate dot product of two vectors', () => {
          let vector1 = Vector(10, 20);
          let vector2 = Vector(5, 10);

          let dot = vector1.dot(vector2);

          expect(dot).to.deep.equal(250);
        });
      } else {
        it('should not have dot', () => {
          let vector = Vector();
          expect(vector.dot).to.not.exist;
        });
      }
    });

    // --------------------------------------------------
    // length
    // --------------------------------------------------
    describe('length', () => {
      if (
        testContext.VECTOR_LENGTH ||
        testContext.VECTOR_NORMALIZE ||
        testContext.VECTOR_ANGLE
      ) {
        it('should calculate the length of the vector', () => {
          let vector1 = Vector(4, 3);

          let length = vector1.length();

          expect(length).to.deep.equal(5);
        });
      } else {
        it('should not have length', () => {
          let vector = Vector();
          expect(vector.length).to.not.exist;
        });
      }
    });

    // --------------------------------------------------
    // distance
    // --------------------------------------------------
    describe('distance', () => {
      if (testContext.VECTOR_DISTANCE) {
        it('should calculate the distance between two vectors', () => {
          let vector1 = Vector(10, 20);
          let vector2 = Vector(6, 17);

          let distance = vector1.distance(vector2);

          expect(distance).to.deep.equal(5);
        });
      } else {
        it('should not have distance', () => {
          let vector = Vector();
          expect(vector.distance).to.not.exist;
        });
      }
    });

    // --------------------------------------------------
    // angle
    // --------------------------------------------------
    describe('angle', () => {
      if (testContext.VECTOR_ANGLE) {
        it('should calculate the angle between two vectors', () => {
          let vector1 = Vector(4, 3);
          let vector2 = Vector(3, 5);

          let angle = vector1.angle(vector2);

          expect(angle.toFixed(2)).to.deep.equal('0.39');
        });
      } else {
        it('should not have angle', () => {
          let vector = Vector();
          expect(vector.angle).to.not.exist;
        });
      }
    });

    // --------------------------------------------------
    // clamp
    // --------------------------------------------------
    describe('clamp', () => {
      if (testContext.VECTOR_CLAMP) {
        let vector;

        beforeEach(() => {
          vector = Vector(10, 20);
          vector.clamp(0, 10, 50, 75);
        });

        it('should clamp the vectors x value', () => {
          vector.x = -10;

          expect(vector.x).to.equal(0);

          vector.x = 100;

          expect(vector.x).to.equal(50);
        });

        it('should clamp the vectors y value', () => {
          vector.y = -10;

          expect(vector.y).to.equal(10);

          vector.y = 100;

          expect(vector.y).to.equal(75);
        });

        it('should preserve clamp settings when adding vectors', () => {
          let vec = vector.add(Vector(100, 100));

          expect(vec.x).to.equal(50);
          expect(vec.y).to.equal(75);
        });
      } else {
        it('should not have clamp', () => {
          let vector = Vector();
          expect(vector.clamp).to.not.exist;
        });
      }
    });
  }
);
