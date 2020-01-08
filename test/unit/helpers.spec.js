import * as helpers from '../../src/helpers.js'

// --------------------------------------------------
// helpers
// --------------------------------------------------
describe('helpers', () => {

  it('should export api', () => {
    expect(helpers.degToRad).to.be.an('function');
    expect(helpers.radToDeg).to.be.an('function');
    expect(helpers.angleToTarget).to.be.an('function');
    expect(helpers.randInt).to.be.an('function');
    expect(helpers.lerp).to.be.an('function');
    expect(helpers.inverseLerp).to.be.an('function');
    expect(helpers.clamp).to.be.an('function');
  });

  // --------------------------------------------------
  // degToRad
  // --------------------------------------------------
  describe('degToRad', () => {

    it('should convert degrees to radians', () => {
      expect(helpers.degToRad(22.35).toFixed(2)).to.equal('0.39');
    });

  });





  // --------------------------------------------------
  // radToDeg
  // --------------------------------------------------
  describe('radToDeg', () => {

    it('should convert radians to degrees', () => {
      expect(helpers.radToDeg(0.39).toFixed(2)).to.equal('22.35');
    });

  });





  // --------------------------------------------------
  // angleToTarget
  // --------------------------------------------------
  describe('angleToTarget', () => {

    it('should return the angle to the target', () => {
      let source = {x: 300, y: 300};
      let target = {x: 100, y: 100};
      expect(helpers.angleToTarget(source, target).toFixed(2)).to.equal('-0.79');
      expect(helpers.angleToTarget(target, source).toFixed(2)).to.equal('2.36');
    });

  });




  // --------------------------------------------------
  // randInt
  // --------------------------------------------------
  describe('randInt', () => {

    it('should get random integer between range', () => {
      sinon.stub(Math, 'random').returns(0.25);
      expect(helpers.randInt(2, 10)).to.equal(4);
      Math.random.restore();
    });

  });





  // --------------------------------------------------
  // lerp
  // --------------------------------------------------
  describe('lerp', () => {

    it('should calculate the linear interpolation', () => {
      expect(helpers.lerp(10, 20, 0.5)).to.equal(15);
    });

    it('should handle negative numbers', () => {
      expect(helpers.lerp(-10, 20, 0.5)).to.equal(5);
    });

    it('should handle percentages greater than 1', () => {
      expect(helpers.lerp(10, 20, 2)).to.equal(30);
    });

    it('should handle negative percentages', () => {
      expect(helpers.lerp(10, 20, -1)).to.equal(0);
    });

  });





  // --------------------------------------------------
  // inverseLerp
  // --------------------------------------------------
  describe('inverseLerp', () => {

    it('should calculate the inverse linear interpolation', () => {
      expect(helpers.inverseLerp(10, 20, 15)).to.equal(0.5);
    });

    it('should handle negative numbers', () => {
      expect(helpers.inverseLerp(-10, 20, 5)).to.equal(0.5);
    });

    it('should handle percentages greater than 1', () => {
      expect(helpers.inverseLerp(10, 20, 30)).to.equal(2);
    });

    it('should handle negative percentages', () => {
      expect(helpers.inverseLerp(10, 20, 0)).to.equal(-1);
    });

  });





  // --------------------------------------------------
  // clamp
  // --------------------------------------------------
  describe('clamp', () => {

    it('should clamp the value when below min', () => {
      expect(helpers.clamp(10, 20, 5)).to.equal(10);
    });

    it('should clamp the value when above max', () => {
      expect(helpers.clamp(10, 20, 30)).to.equal(20);
    });

    it('should retain the number when between min and max', () => {
      expect(helpers.clamp(10, 20, 15)).to.equal(15);
    });

  });

});