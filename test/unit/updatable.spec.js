import Updatable from '../../src/updatable.js';
import Vector from '../../src/vector.js';

// --------------------------------------------------
// updatable
// --------------------------------------------------
describe('updatable', () => {

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

    it('should return what init returns', () => {
      let myObj = {};
      spy = sinon.stub(Updatable.prototype, 'init').returns(myObj);

      object = new Updatable();

      expect(object).to.equal(myObj);
    });

  });





  // --------------------------------------------------
  // init
  // --------------------------------------------------
  describe('init', () => {

    it('should set default properties', () => {
      expect(object.position instanceof Vector.class).to.be.true;
      expect(object.position.x).to.equal(0);
      expect(object.position.y).to.equal(0);

      expect(object.velocity instanceof Vector.class).to.be.true;
      expect(object.velocity.x).to.equal(0);
      expect(object.velocity.y).to.equal(0);

      expect(object.acceleration instanceof Vector.class).to.be.true;
      expect(object.acceleration.x).to.equal(0);
      expect(object.acceleration.y).to.equal(0);

      expect(object.ttl).to.equal(Infinity);
    });

    it('should set x and y properties', () => {
      object = new Updatable({x: 10, y: 20});

      expect(object.position.x).to.equal(10);
      expect(object.position.y).to.equal(20);
    });

    it('should set dx and dy properties', () => {
      object = new Updatable({dx: 10, dy: 20});

      expect(object.velocity.x).to.equal(10);
      expect(object.velocity.y).to.equal(20);
    });

    it('should set ddx and ddy properties', () => {
      object = new Updatable({ddx: 10, ddy: 20});

      expect(object.acceleration.x).to.equal(10);
      expect(object.acceleration.y).to.equal(20);
    });

    it('should set ttl property', () => {
      object = new Updatable({ttl: 20});

      expect(object.ttl).to.equal(20);
    });

    it('should set any property', () => {
      object = new Updatable({myProp: 'foo'});

      expect(object.myProp).to.equal('foo');
    });

  });





  // --------------------------------------------------
  // position
  // --------------------------------------------------
  describe('position', () => {

    it('should set the position x property', () => {
      object.x = 10;

      expect(object.position.x).to.equal(10);
    });

    it('should return the position x property', () => {
      object.position.x = 10;

      expect(object.x).to.equal(10);
    });

    it('should set the position y property', () => {
      object.y = 10;

      expect(object.position.y).to.equal(10);
    });

    it('should return the position y property', () => {
      object.position.y = 10;

      expect(object.y).to.equal(10);
    });

  });





  // --------------------------------------------------
  // velocity
  // --------------------------------------------------
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





  // --------------------------------------------------
  // acceleration
  // --------------------------------------------------
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





  // --------------------------------------------------
  // isAlive
  // --------------------------------------------------
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

      object.update(1/60);

      expect(object.advance.calledWith(1/60)).to.be.true;
    });

  });





  // --------------------------------------------------
  // advance
  // --------------------------------------------------
  describe('advance', () => {

    it('should add the acceleration to the velocity', () => {
      object.velocity = Vector(5, 10);
      object.acceleration = Vector(15, 20);

      object.advance();

      expect(object.velocity.x).to.equal(20);
      expect(object.velocity.y).to.equal(30);
    });

    it('should add the velocity to the position', () => {
      object.position = Vector(5, 10);
      object.velocity = Vector(15, 20);

      object.advance();

      expect(object.position.x).to.equal(20);
      expect(object.position.y).to.equal(30);
    });

    it('should update ttl', () => {
      object.ttl = 10;

      object.advance();

      expect(object.ttl).to.equal(9);
    });

  });

});