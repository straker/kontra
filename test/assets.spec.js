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
  // kontra.assets.load
  // --------------------------------------------------
  describe('load', function() {

    // images
    it('should load an image and resolve with it', function(done) {
      kontra.assets.load('/imgs/bullet.png').then(function(assets) {
        var image = assets[0];
        expect(kontra.assets.images['/imgs/bullet.png']).to.equal(image);
        expect(kontra.assets.images['/imgs/bullet']).to.equal(image);

        done();
      })
      .catch(function(e) {
        done(e);
      });
    });

    it('should load an image using imagePath', function(done) {
      kontra.assets.imagePath = '/imgs';

      kontra.assets.load('bullet.png').then(function(assets) {
        var image = assets[0];
        expect(kontra.assets.images['/imgs/bullet.png']).to.equal(image);
        expect(kontra.assets.images['bullet']).to.equal(image);

        done();
      })
      .catch(function(e) {
        done(e);
      });
    });

    it('should correctly join a relative image path', function(done) {
      kontra.assets.load('../imgs/bullet.png').then(function(assets) {
        var image = assets[0];
        expect(kontra.assets.images['../imgs/bullet.png']).to.equal(image);
        expect(kontra.assets.images['../imgs/bullet']).to.equal(image);

        done();
      })
      .catch(function(e) {
        done(e);
      });
    });

    it('should correctly join an image path', function(done) {
      kontra.assets.imagePath = '/imgs/';

      kontra.assets.load('/bullet.png').then(function(assets) {
        var image = assets[0];
        expect(kontra.assets.images['/imgs/bullet.png']).to.equal(image);
        expect(kontra.assets.images['bullet']).to.equal(image);

        done();
      })
      .catch(function(e) {
        done(e);
      });
    });

    it('should throw an error if an image failed to load', function(done) {
      kontra.assets.load('fake.png').then(function(image) {
        // should not get here
        done('no error thrown');
      })
      .catch(function(e) {
        done();
      });
    });





    // data
    it('should load the data and resolve with it', function(done) {
      kontra.assets.load('/data/test.txt').then(function(assets) {
        var data = assets[0];
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
      kontra.assets.load('/data/test.json').then(function(assets) {
        var data = assets[0];
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

      kontra.assets.load('test.txt').then(function(assets) {
        var data = assets[0];
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

      kontra.assets.load('/test.txt').then(function(assets) {
        var data = assets[0];
        expect(kontra.assets.data['/data/test.txt']).to.equal(data);
        expect(kontra.assets.data['test']).to.equal(data);

        done();
      })
      .catch(function(e) {
        done(e);
      });
    });

    it('should throw an error if the data failed to load', function(done) {
      kontra.assets.load('fake.txt').then(function(assets) {
        var data = assets[0];
        // should not get here
        done('no error thrown');
      })
      .catch(function(e) {
        done();
      });
    });





    // audio
    it('should load the audio and resolve with it', function(done) {
      kontra.assets.load('/audio/shoot.mp3').then(function(assets) {
        var audio = assets[0];
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

      kontra.assets.load(['/audio/shoot.ogg', '/audio/shoot.mp3']).then(function(assets) {
        var audio = assets[0];
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

      kontra.assets.load(['/audio/shoot.ogg', '/audio/shoot.mp3']).then(function(assets) {
        var audio = assets[0];
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

      kontra.assets.load('shoot.mp3').then(function(assets) {
        var audio = assets[0];
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

      kontra.assets.load('/shoot.mp3').then(function(assets) {
        var audio = assets[0];
        expect(kontra.assets.audio['/audio/shoot.mp3']).to.equal(audio);
        expect(kontra.assets.audio['shoot']).to.equal(audio);

        done();
      })
      .catch(function(e) {
        done(e);
      });
    });

    it('should throw an error if the audio failed to load', function(done) {
      kontra.assets.load('fake.mp3').then(function(assets) {
        var audio = assets[0];
        // should not get here
        done('no error thrown');
      })
      .catch(function(e) {
        done();
      });
    });

    it('should throw an error if no audio source can be played', function(done) {
      kontra.assets.load('cantPlay.aaa').then(function(assets) {
        var audio = assets[0];
        // should not get here
        done('no error thrown');
      })
      .catch(function(e) {
        done();
      });
    });





    // all
    it('should call the correct load function for all passed assets', function(done) {
      kontra.assets.load('/imgs/bullet.png', ['/audio/shoot.mp3', '/audio/shoot.ogg'], '/data/test.json')
        .then(function(assets) {
          var image = assets[0];
          var audio = assets[1];
          var data = assets[2];

          expect(kontra.assets.images['/imgs/bullet']).to.equal(image);
          expect(kontra.assets.audio['/audio/shoot']).to.equal(audio);
          expect(kontra.assets.data['/data/test']).to.equal(data);

          done();
        })
        .catch(function(e) {
          done(e);
        });

    });

  });

});