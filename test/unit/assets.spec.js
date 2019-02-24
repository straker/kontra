import assets, { canUse } from '../../src/assets.js'

// --------------------------------------------------
// assets
// --------------------------------------------------
describe('assets', () => {
  let canMp3 = canUse.mp3;
  let canOgg = canUse.ogg;

  beforeEach(() => {
    assets.images = {};
    assets.audio = {};
    assets.data = {};

    assets.imagePath = '';
    assets.audioPath = '';
    assets.dataPath = '';

    canUse.mp3 = canMp3;
    canUse.ogg = canOgg;
  });

  // --------------------------------------------------
  // assets.load
  // --------------------------------------------------
  describe('load', () => {

    describe('images', () => {

      it('should load an image and resolve with it', (done) => {
        assets.load('/imgs/bullet.png').then(loadedAssets => {
          let image = loadedAssets[0];
          expect(assets.images['/imgs/bullet.png']).to.equal(image);
          expect(assets.images['/imgs/bullet']).to.equal(image);

          done();
        })
        .catch(e => {
          done(e);
        });
      });

      it('should load an image using imagePath', (done) => {
        assets.imagePath = '/imgs';

        assets.load('bullet.png').then(loadedAssets => {
          let image = loadedAssets[0];
          expect(assets.images['/imgs/bullet.png']).to.equal(image);
          expect(assets.images['bullet']).to.equal(image);

          done();
        })
        .catch(e => {
          done(e);
        });
      });

      it('should correctly join a relative image path', (done) => {
        assets.load('../imgs/bullet.png').then(loadedAssets => {
          let image = loadedAssets[0];
          expect(assets.images['../imgs/bullet.png']).to.equal(image);
          expect(assets.images['../imgs/bullet']).to.equal(image);

          done();
        })
        .catch(e => {
          done(e);
        });
      });

      it('should correctly join an image path', (done) => {
        assets.imagePath = '/imgs/';

        assets.load('/bullet.png').then(loadedAssets => {
          let image = loadedAssets[0];
          expect(assets.images['/imgs/bullet.png']).to.equal(image);
          expect(assets.images['bullet']).to.equal(image);

          done();
        })
        .catch(e => {
          done(e);
        });
      });

      it('should throw an error if an image failed to load', (done) => {
        assets.load('fake.png').then(image => {
          // should not get here
          done('no error thrown');
        })
        .catch(e => {
          done();
        });
      });

    });





    describe('data', () => {

      it('should load the data and resolve with it', (done) => {
        assets.load('/data/test.txt').then(loadedAssets => {
          let data = loadedAssets[0];
          expect(typeof data).to.equal('string');
          expect(assets.data['/data/test.txt']).to.equal(data);
          expect(assets.data['/data/test']).to.equal(data);

          done();
        })
        .catch(e => {
          done(e);
        });
      });

      it('should parse a JSON file', (done) => {
        assets.load('/data/test.json').then(loadedAssets => {
          let data = loadedAssets[0];
          expect(typeof data).to.equal('object');
          expect(assets.data['/data/test.json']).to.equal(data);
          expect(assets.data['/data/test']).to.equal(data);

          done();
        })
        .catch(e => {
          done(e);
        });
      });

      it('should load the data using dataPath', (done) => {
        assets.dataPath = '/data';

        assets.load('test.txt').then(loadedAssets => {
          let data = loadedAssets[0];
          expect(assets.data['/data/test.txt']).to.equal(data);
          expect(assets.data['test']).to.equal(data);

          done();
        })
        .catch(e => {
          done(e);
        });
      });

      it('should correctly join the data path', (done) => {
        assets.dataPath = '/data/';

        assets.load('/test.txt').then(loadedAssets => {
          let data = loadedAssets[0];
          expect(assets.data['/data/test.txt']).to.equal(data);
          expect(assets.data['test']).to.equal(data);

          done();
        })
        .catch(e => {
          done(e);
        });
      });

      it('should throw an error if the data failed to load', (done) => {
        assets.load('fake.txt').then(loadedAssets => {
          let data = loadedAssets[0];
          // should not get here
          done('no error thrown');
        })
        .catch(e => {
          done();
        });
      });

    });




    describe('audio', () => {
      it('should load the audio and resolve with it', (done) => {
        assets.load('/audio/shoot.mp3').then(loadedAssets => {
          let audio = loadedAssets[0];
          expect(assets.audio['/audio/shoot.mp3']).to.equal(audio);
          expect(assets.audio['/audio/shoot']).to.equal(audio);

          done();
        })
        .catch(e => {
          done(e);
        });
      });

      it('should load the correct audio file based on browser support (mp3)', (done) => {
        canUse.mp3 = true;
        canUse.ogg = false;

        assets.load(['/audio/shoot.ogg', '/audio/shoot.mp3']).then(loadedAssets => {
          let audio = loadedAssets[0];
          expect(assets.audio['/audio/shoot.mp3']).to.equal(audio);
          expect(assets.audio['/audio/shoot']).to.equal(audio);

          done();
        })
        .catch(e => {
          done(e);
        });
      });

      it('should load the correct audio file based on browser support (ogg)', (done) => {
        canUse.mp3 = false;
        canUse.ogg = true;

        assets.load(['/audio/shoot.ogg', '/audio/shoot.mp3']).then(loadedAssets => {
          let audio = loadedAssets[0];
          expect(assets.audio['/audio/shoot.ogg']).to.equal(audio);
          expect(assets.audio['/audio/shoot']).to.equal(audio);

          done();
        })
        .catch(e => {
          done(e);
        });
      });

      it('should load the audio using audioPath', (done) => {
        assets.audioPath = '/audio';

        assets.load('shoot.mp3').then(loadedAssets => {
          let audio = loadedAssets[0];
          expect(assets.audio['/audio/shoot.mp3']).to.equal(audio);
          expect(assets.audio['shoot']).to.equal(audio);

          done();
        })
        .catch(e => {
          done(e);
        });
      });

      it('should correctly join the audio path', (done) => {
        assets.audioPath = '/audio/';

        assets.load('/shoot.mp3').then(loadedAssets => {
          let audio = loadedAssets[0];
          expect(assets.audio['/audio/shoot.mp3']).to.equal(audio);
          expect(assets.audio['shoot']).to.equal(audio);

          done();
        })
        .catch(e => {
          done(e);
        });
      });

      it('should throw an error if the audio failed to load', (done) => {
        assets.load('fake.mp3').then(loadedAssets => {
          let audio = loadedAssets[0];
          // should not get here
          done('no error thrown');
        })
        .catch(e => {
          done();
        });
      });

      it('should throw an error if no audio source can be played', (done) => {
        assets.load('cantPlay.aaa').then(loadedAssets => {
          let audio = loadedAssets[0];
          // should not get here
          done('no error thrown');
        })
        .catch(e => {
          done();
        });
      });

    });





    // all
    it('should call the correct load function for all passed assets', (done) => {
      assets.load('/imgs/bullet.png', ['/audio/shoot.mp3', '/audio/shoot.ogg'], '/data/test.json')
        .then(loadedAssets => {
          let image = loadedAssets[0];
          let audio = loadedAssets[1];
          let data = loadedAssets[2];

          expect(assets.images['/imgs/bullet']).to.equal(image);
          expect(assets.audio['/audio/shoot']).to.equal(audio);
          expect(assets.data['/data/test']).to.equal(data);

          done();
        })
        .catch(e => {
          done(e);
        });

    });

  });

});