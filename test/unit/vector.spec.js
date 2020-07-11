import Vector from '../../src/vector.js'

let testVector = Vector();

// optional properties
let hasSubtract = typeof testVector.subtract !== 'undefined';
let hasScale = typeof testVector.scale !== 'undefined';
let hasNormalize = typeof testVector.normalize !== 'undefined';
let hasDot = typeof testVector.dot !== 'undefined';
let hasLength = typeof testVector.length !== 'undefined';
let hasDistance = typeof testVector.distance !== 'undefined';
let hasAngle = typeof testVector.angle !== 'undefined';
let hasClamp = typeof testVector.clamp !== 'undefined';

let properties = {
  subtract: hasSubtract,
  scale: hasScale,
  normalize: hasNormalize,
  dot: hasDot,
  length: hasLength,
  distance: hasDistance,
  angle: hasAngle,
  clamp: hasClamp
};

// --------------------------------------------------
// vector
// --------------------------------------------------
describe('vector with properties: ' + JSON.stringify(properties,null,4), () => {

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

      let vector = vector1.add(vector2);

      expect(vector1.x).to.deep.equal(10);
      expect(vector1.y).to.deep.equal(20);
      expect(vector2.x).to.deep.equal(5);
      expect(vector2.y).to.deep.equal(10);
    });

  });





  // --------------------------------------------------
  // subtract
  // --------------------------------------------------
  if (hasSubtract) {
    describe('subtract', () => {

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

        let vector = vector1.subtract(vector2);

        expect(vector1.x).to.deep.equal(10);
        expect(vector1.y).to.deep.equal(20);
        expect(vector2.x).to.deep.equal(5);
        expect(vector2.y).to.deep.equal(10);
      });

    });
  }





  // --------------------------------------------------
  // scale
  // --------------------------------------------------
  if (hasScale) {
    describe('scale', () => {

      it('should scale a vector by a scalar', () => {
        let vector1 = Vector(5, 10);

        let vector = vector1.scale(2);

        expect(vector.x).to.deep.equal(10);
        expect(vector.y).to.deep.equal(20);
      });

      it('should not modify the vector', () => {
        let vector1 = Vector(5, 10);

        let vector = vector1.scale(2);

        expect(vector1.x).to.deep.equal(5);
        expect(vector1.y).to.deep.equal(10);
      });

    });
  }





  // --------------------------------------------------
  // normalize
  // --------------------------------------------------
  if (hasNormalize) {
    describe('normalize', () => {

      it('should calculate the normalized vector', () => {
        let vector1 = Vector(4, 3);

        let normalize = vector1.normalize();

        expect(normalize.x).to.deep.equal(4/5);
        expect(normalize.y).to.deep.equal(3/5);
      });

    });
  }





  // --------------------------------------------------
  // dot
  // --------------------------------------------------
  if (hasDot) {
    describe('dot', () => {

      it('should calculate dot product of two vectors', () => {
        let vector1 = Vector(10, 20);
        let vector2 = Vector(5, 10);

        let dot = vector1.dot(vector2);

        expect(dot).to.deep.equal(250);
      });

    });
  }





  // --------------------------------------------------
  // length
  // --------------------------------------------------
  if (hasLength) {
    describe('length', () => {

      it('should calculate the length of the vector', () => {
        let vector1 = Vector(4, 3);

        let length = vector1.length();

        expect(length).to.deep.equal(5);
      });

    });
  }





  // --------------------------------------------------
  // distance
  // --------------------------------------------------
  if (hasDistance) {
    describe('distance', () => {

      it('should calculate the distance between two vectors', () => {
        let vector1 = Vector(10, 20);
        let vector2 = Vector(6, 17);

        let distance = vector1.distance(vector2);

        expect(distance).to.deep.equal(5);
      });

    });
  }





  // --------------------------------------------------
  // angle
  // --------------------------------------------------
  if (hasAngle) {
    describe('angle', () => {

      it('should calculate the angle between two vectors', () => {
        let vector1 = Vector(4, 3);
        let vector2 = Vector(3, 5);

        let angle = vector1.angle(vector2);

        expect(angle.toFixed(2)).to.deep.equal('0.39');
      });

    });
  }





  // --------------------------------------------------
  // clamp
  // --------------------------------------------------
  if (hasClamp) {
    describe('clamp', () => {
      let vector;

      beforeEach(() => {
        vector = Vector(10, 20);
        vector.clamp(0, 10, 50, 75);
      })

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

    });
  }

});