import Vector from '../../src/vector.js'

// --------------------------------------------------
// vector
// --------------------------------------------------
describe('vector', () => {

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

      let vector = vector1.add(vector2)

      expect(vector.x).to.eql(15);
      expect(vector.y).to.eql(30);
    });

    it('should incorporate dt if passed', () => {
      let vector1 = Vector(10, 20);
      let vector2 = Vector(5, 10);

      let vector = vector1.add(vector2, 2)

      expect(vector.x).to.eql(20);
      expect(vector.y).to.eql(40);
    });

    it('should default vector to 0 with empty parameters', () => {
      let vector1 = Vector(10, 20);

      let vector = vector1.add({x: 10});

      expect(vector.y).to.eql(20);

      vector1 = Vector(10, 20);
      vector = vector1.add({y: 10});

      expect(vector.x).to.eql(10);
    });

  });





  // --------------------------------------------------
  // clamp
  // --------------------------------------------------
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

  });

});