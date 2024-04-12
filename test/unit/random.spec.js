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
    it('should get random value between 0 and <1', () => {
      expect(random.rand()).to.be.within(0, 1);
    });

    it('should work if seed has not been seeded', () => {
      random._reset();
      expect(random.rand).to.not.throw();
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
    function testSeededRandom() {
      expect(random.rand()).to.equal(0.26133555523119867);

      for (let i = 0; i < 20; i++) {
        random.rand();
      }

      expect(random.rand()).to.equal(0.08834491996094584);
    }

    // all seed values = 2859059487
    it('should seed with value', () => {
      random.seedRand(2859059487);

      testSeededRandom();
    });

    it('should seed with string', () => {
      random.seedRand('kontra');

      testSeededRandom();
    });

    it('should seed with time by default', () => {
      sinon.stub(Date, 'now').returns(2859059487);
      random.seedRand();

      testSeededRandom();
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
