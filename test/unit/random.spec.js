import * as random from '../../src/random.js';

// --------------------------------------------------
// random
// --------------------------------------------------
describe('random', () => {
  it('should export api', () => {
    expect(random.rand).to.be.an('function');
    expect(random.randInt).to.be.an('function');
    expect(random.getSeed).to.be.an('function');
    expect(random.seedRand).to.be.an('function');
  });

  // --------------------------------------------------
  // rand
  // --------------------------------------------------
  describe('rand', () => {
    it('should get random integer between range', () => {
      expect(random.rand()).to.be.within(0, 1);
    });
  });

  // --------------------------------------------------
  // randInt
  // --------------------------------------------------
  describe('randInt', () => {
    it('should get random integer between range', () => {
      expect(random.randInt(2, 10)).to.be.within(2, 10);
    });
  });

  // --------------------------------------------------
  // seedRand
  // --------------------------------------------------
  describe('seedRand', () => {
    it('should seed with value', () => {
      random.seedRand(2859059487);
      expect(random.rand()).to.equal(0.26133555523119867);

      for (let i = 0; i < 20; i++) {
        random.rand();
      }

      expect(random.rand()).to.equal(0.08834491996094584);
    });

    it('should seed with string', () => {
      random.seedRand('kontra');
      expect(random.rand()).to.equal(0.26133555523119867);

      for (let i = 0; i < 20; i++) {
        random.rand();
      }

      expect(random.rand()).to.equal(0.08834491996094584);
    });

    it('should seed with time by default', () => {
      sinon.stub(Date, 'now').returns(2859059487);
      random.seedRand();

      expect(random.rand()).to.equal(0.26133555523119867);

      for (let i = 0; i < 20; i++) {
        random.rand();
      }

      expect(random.rand()).to.equal(0.08834491996094584);
    });
  });

  // --------------------------------------------------
  // getSeed
  // --------------------------------------------------
  describe('getSeed', () => {
    it('should return the seed', () => {
      random.seedRand('kontra');
      expect(random.getSeed()).to.equal(2859059487);
    });
  });
});
