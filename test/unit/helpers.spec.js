import * as helpers from '../../src/helpers.js'

// --------------------------------------------------
// helpers
// --------------------------------------------------
describe('helpers', () => {

  it('should export api', () => {
    expect(helpers.degToRad).to.be.an('function');
    expect(helpers.radToDeg).to.be.an('function');
    expect(helpers.randInt).to.be.an('function');
  });

  it('should convert degrees to radians', () => {
    expect(helpers.degToRad(22.35).toFixed(2)).to.equal('0.39');
  });

  it('should convert radians to degrees', () => {
    expect(helpers.radToDeg(0.39).toFixed(2)).to.equal('22.35');
  });

  it('should get random integer between range', () => {
    sinon.stub(Math, 'random').returns(0.25);
    expect(helpers.randInt(2, 10)).to.equal(4);
  });

});