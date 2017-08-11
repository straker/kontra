// --------------------------------------------------
// kontra.assets
// --------------------------------------------------
describe('kontra.assets', function() {
  var canMp3 = kontra.assets._canUse.mp3;
  var canOgg = kontra.assets._canUse.ogg;

  beforeEach(function() {
    kontra.assets.images = {};
    kontra.assets.audio = {};
    kontra.assets.data = {};

    kontra.assets.imagePath = '';
    kontra.assets.audioPath = '';
    kontra.assets.dataPath = '';

    kontra.assets._canUse.mp3 = canMp3;
    kontra.assets._canUse.ogg = canOgg;
  });

  // --------------------------------------------------
  // kontra.assets.loadImage
  // --------------------------------------------------
  describe('loadImage', function() {

    it('should load the image and resolve with it', function(done) {
      kontra.assets.loadImage('/imgs/bullet.png').then(function(image) {
        expect(kontra.assets.images['/imgs/bullet.png']).to.equal(image);
        expect(kontra.assets.images['/imgs/bullet']).to.equal(image);

        done();
      })
      .catch(function(e) {
        done(e);
      });
    });

    it('should load the image using imagePath', function(done) {
      kontra.assets.imagePath = '/imgs';

      kontra.assets.loadImage('bullet.png').then(function(image) {
        expect(kontra.assets.images['/imgs/bullet.png']).to.equal(image);
        expect(kontra.assets.images['bullet']).to.equal(image);

        done();
      })
      .catch(function(e) {
        done(e);
      });
    });

    it('should correctly join the image path', function(done) {
      kontra.assets.imagePath = '/imgs/';

      kontra.assets.loadImage('/bullet.png').then(function(image) {
        expect(kontra.assets.images['/imgs/bullet.png']).to.equal(image);
        expect(kontra.assets.images['bullet']).to.equal(image);

        done();
      })
      .catch(function(e) {
        done(e);
      });
    });

    it('should throw an error if the image failed to load', function(done) {
      kontra.assets.loadImage('fake.png').then(function(image) {
        // should not get here
        done('no error thrown');
      })
      .catch(function(e) {
        done();
      });
    });

  });





  // --------------------------------------------------
  // kontra.assets.loadData
  // --------------------------------------------------
  describe('loadData', function() {

    it('should load the data and resolve with it', function(done) {
      kontra.assets.loadData('/data/test.txt').then(function(data) {
        expect(typeof data).to.equal('string');
        expect(kontra.assets.data['/data/test.txt']).to.equal(data);
        expect(kontra.assets.data['/data/test']).to.equal(data);

        done();
      })
      .catch(function(e) {
        done(e);
      });
    });

    it('should parse a JSON file', function(done) {
      kontra.assets.loadData('/data/test.json').then(function(data) {
        expect(typeof data).to.equal('object');
        expect(kontra.assets.data['/data/test.json']).to.equal(data);
        expect(kontra.assets.data['/data/test']).to.equal(data);

        done();
      })
      .catch(function(e) {
        done(e);
      });
    });

    it('should load the data using dataPath', function(done) {
      kontra.assets.dataPath = '/data';

      kontra.assets.loadData('test.txt').then(function(data) {
        expect(kontra.assets.data['/data/test.txt']).to.equal(data);
        expect(kontra.assets.data['test']).to.equal(data);

        done();
      })
      .catch(function(e) {
        done(e);
      });
    });

    it('should correctly join the data path', function(done) {
      kontra.assets.dataPath = '/data/';

      kontra.assets.loadData('/test.txt').then(function(data) {
        expect(kontra.assets.data['/data/test.txt']).to.equal(data);
        expect(kontra.assets.data['test']).to.equal(data);

        done();
      })
      .catch(function(e) {
        done(e);
      });
    });

    it('should throw an error if the data failed to load', function(done) {
      kontra.assets.loadData('fake.txt').then(function(data) {
        // should not get here
        done('no error thrown');
      })
      .catch(function(e) {
        done();
      });
    });

  });

  // --------------------------------------------------
  // kontra.assets.loadAudio
  // --------------------------------------------------
  describe('loadAudio', function() {

    it('should load the audio and resolve with it', function(done) {
      kontra.assets.loadAudio('/audio/shoot.mp3').then(function(audio) {
        expect(kontra.assets.audio['/audio/shoot.mp3']).to.equal(audio);
        expect(kontra.assets.audio['/audio/shoot']).to.equal(audio);

        done();
      })
      .catch(function(e) {
        done(e);
      });
    });

    it('should load the correct audio file based on browser support (mp3)', function(done) {
      kontra.assets._canUse.mp3 = true;
      kontra.assets._canUse.ogg = false;

      kontra.assets.loadAudio(['/audio/shoot.ogg', '/audio/shoot.mp3']).then(function(audio) {
        expect(kontra.assets.audio['/audio/shoot.mp3']).to.equal(audio);
        expect(kontra.assets.audio['/audio/shoot']).to.equal(audio);

        done();
      })
      .catch(function(e) {
        done(e);
      });
    });

    it('should load the correct audio file based on browser support (ogg)', function(done) {
      kontra.assets._canUse.mp3 = false;
      kontra.assets._canUse.ogg = true;

      kontra.assets.loadAudio(['/audio/shoot.ogg', '/audio/shoot.mp3']).then(function(audio) {
        expect(kontra.assets.audio['/audio/shoot.ogg']).to.equal(audio);
        expect(kontra.assets.audio['/audio/shoot']).to.equal(audio);

        done();
      })
      .catch(function(e) {
        done(e);
      });
    });

    it('should load the audio using audioPath', function(done) {
      kontra.assets.audioPath = '/audio';

      kontra.assets.loadAudio('shoot.mp3').then(function(audio) {
        expect(kontra.assets.audio['/audio/shoot.mp3']).to.equal(audio);
        expect(kontra.assets.audio['shoot']).to.equal(audio);

        done();
      })
      .catch(function(e) {
        done(e);
      });
    });

    it('should correctly join the audio path', function(done) {
      kontra.assets.audioPath = '/audio/';

      kontra.assets.loadAudio('/shoot.mp3').then(function(audio) {
        expect(kontra.assets.audio['/audio/shoot.mp3']).to.equal(audio);
        expect(kontra.assets.audio['shoot']).to.equal(audio);

        done();
      })
      .catch(function(e) {
        done(e);
      });
    });

    it('should throw an error if the audio failed to load', function(done) {
      kontra.assets.loadAudio('fake.mp3').then(function(audio) {
        // should not get here
        done('no error thrown');
      })
      .catch(function(e) {
        done();
      });
    });

    it('should throw an error if no audio source can be played', function(done) {
      kontra.assets.loadAudio('cantPlay.aaa').then(function(audio) {
        // should not get here
        done('no error thrown');
      })
      .catch(function(e) {
        done();
      });
    });

  });





  // --------------------------------------------------
  // kontra.assets.load
  // --------------------------------------------------
  describe('load', function() {

    it('should call loadImage for image assets', function() {
      sinon.stub(kontra.assets, 'loadImage', kontra._noop);

      kontra.assets.load('/imgs/bullet.png');

      expect(kontra.assets.loadImage.called).to.be.true;
      expect(kontra.assets.loadImage.calledWith('/imgs/bullet.png')).to.be.true;

      kontra.assets.loadImage.restore();
    });

    it('should call loadAudio for audio assets', function() {
      sinon.stub(kontra.assets, 'loadAudio', kontra._noop);

      kontra.assets.load('/audio/shoot.mp3');

      expect(kontra.assets.loadAudio.called).to.be.true;
      expect(kontra.assets.loadAudio.calledWith('/audio/shoot.mp3')).to.be.true;

      kontra.assets.loadAudio.restore();
    });

    it('should call loadData for data assets', function() {
      sinon.stub(kontra.assets, 'loadData', kontra._noop);

      kontra.assets.load('/data/test.json');

      expect(kontra.assets.loadData.called).to.be.true;
      expect(kontra.assets.loadData.calledWith('/data/test.json')).to.be.true;

      kontra.assets.loadData.restore();
    });

    it('should call the correct load function for all passed assets', function() {
      sinon.stub(kontra.assets, 'loadImage', kontra._noop);
      sinon.stub(kontra.assets, 'loadAudio', kontra._noop);
      sinon.stub(kontra.assets, 'loadData', kontra._noop);

      var audios = ['/audio/shoot.mp3', '/audio/shoot.ogg'];

      kontra.assets.load('/imgs/bullet.png', audios, '/data/test.json');

      expect(kontra.assets.loadImage.called).to.be.true;
      expect(kontra.assets.loadImage.calledWith('/imgs/bullet.png')).to.be.true;
      expect(kontra.assets.loadAudio.called).to.be.true;
      expect(kontra.assets.loadAudio.calledWith(audios)).to.be.true;
      expect(kontra.assets.loadData.called).to.be.true;
      expect(kontra.assets.loadData.calledWith('/data/test.json')).to.be.true;

      kontra.assets.loadImage.restore();
      kontra.assets.loadAudio.restore();
      kontra.assets.loadData.restore();
    });

  });

});