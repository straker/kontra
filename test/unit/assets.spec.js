import * as assets from '../../src/assets.js'
import { on, off } from '../../src/events.js'

// --------------------------------------------------
// assets
// --------------------------------------------------
describe('assets', () => {
  beforeEach(() => {
    assets._reset();
  });

  afterEach(() => {
    assets._reset();
  });

  it('should export api', () => {
    expect(assets.imageAssets).to.be.an('object');
    expect(assets.audioAssets).to.be.an('object');
    expect(assets.dataAssets).to.be.an('object');
    expect(assets.setImagePath).to.be.an('function');
    expect(assets.setAudioPath).to.be.an('function');
    expect(assets.setDataPath).to.be.an('function');
    expect(assets.loadImage).to.be.an('function');
    expect(assets.loadAudio).to.be.an('function');
    expect(assets.loadData).to.be.an('function');
    expect(assets.load).to.be.an('function');
  });

  // --------------------------------------------------
  // loadImage
  // --------------------------------------------------
  describe('loadImage', () => {

    it('should load an image and resolve with it', done => {
      assets.loadImage('/imgs/bullet.png').then(image => {
        expect(assets.imageAssets['/imgs/bullet.png']).to.equal(image);
        expect(assets.imageAssets['/imgs/bullet']).to.equal(image);

        done();
      })
      .catch(done);
    });

    it('should resolve with the image if it is already loaded', done => {
      assets.loadImage('/imgs/bullet.png').then(image => {
        let spy = sinon.spy(window, 'Image');

        assets.loadImage('/imgs/bullet.png').then(img => {
          try {
            expect(spy.called).to.equal(false);
          } catch(e) {
            return done(e);
          }

          done();
        });
      })
      .catch(done);
    });

    it('should load an image using imagePath', done => {
      assets.setImagePath('/imgs');

      assets.loadImage('bullet.png').then(image => {
        expect(assets.imageAssets['/imgs/bullet.png']).to.equal(image);
        expect(assets.imageAssets['bullet']).to.equal(image);

        done();
      })
      .catch(done);
    });

    it('should correctly join a relative image path', done => {
      assets.loadImage('../imgs/bullet.png').then(image => {
        expect(assets.imageAssets['../imgs/bullet.png']).to.equal(image);
        expect(assets.imageAssets['../imgs/bullet']).to.equal(image);

        done();
      })
      .catch(done);
    });

    it('should correctly join an image path', done => {
      assets.setImagePath('/imgs/');

      assets.loadImage('/bullet.png').then(image => {
        expect(assets.imageAssets['/imgs/bullet.png']).to.equal(image);
        expect(assets.imageAssets['bullet']).to.equal(image);

        done();
      })
      .catch(done);
    });

    it('should throw an error if an image failed to load', done => {
      assets.loadImage('fake.png').then(image => {
        // should not get here
        done('no error thrown');
      })
      .catch(e => {
        done();
      });
    });

    it('should emit the assetLoaded event', done => {
      function loaded(asset, url) {
        // this needs to be called first otherwise every load event will call this
        // emitted function
        off('assetLoaded', loaded);

        try {
          expect(assets.imageAssets['/imgs/bullet.png']).to.equal(asset);
          expect(url).to.equal('/imgs/bullet.png');
        } catch(e) {
          done(e);
        }

        done();
      }
      on('assetLoaded', loaded);
      assets.loadImage('/imgs/bullet.png').catch(done);
    });

  });





  // --------------------------------------------------
  // loadData
  // --------------------------------------------------
  describe('loadData', () => {

    it('should load the data and resolve with it', done => {
      assets.loadData('/data/test.txt').then(data => {
        expect(typeof data).to.equal('string');
        expect(assets.dataAssets['/data/test.txt']).to.equal(data);
        expect(assets.dataAssets['/data/test']).to.equal(data);

        done();
      })
      .catch(done);
    });

    it('should resolve with the data if it is already loaded', done => {
      assets.loadData('/data/test.txt').then(image => {
        let spy = sinon.spy(window, 'fetch');

        assets.loadData('/data/test.txt').then(img => {
          try {
            expect(spy.called).to.equal(false);
          } catch(e) {
            return done(e);
          }

          done();
        });
      })
      .catch(done);
    });

    it('should parse a JSON file', done => {
      assets.loadData('/data/test.json').then(data => {
        expect(typeof data).to.equal('object');
        expect(assets.dataAssets['/data/test.json']).to.equal(data);
        expect(assets.dataAssets['/data/test']).to.equal(data);

        done();
      })
      .catch(done);
    });

    it('should load the data using dataPath', done => {
      assets.setDataPath('/data');

      assets.loadData('test.txt').then(data => {
        expect(assets.dataAssets['/data/test.txt']).to.equal(data);
        expect(assets.dataAssets['test']).to.equal(data);

        done();
      })
      .catch(done);
    });

    it('should correctly join the data path', done => {
      assets.setDataPath('/data/');

      assets.loadData('/test.txt').then(data => {
        expect(assets.dataAssets['/data/test.txt']).to.equal(data);
        expect(assets.dataAssets['test']).to.equal(data);

        done();
      })
      .catch(done);
    });

    it('should throw an error if the data failed to load', done => {
      assets.loadData('fake.txt').then(loadedAssets => {
        let data = loadedAssets[0];
        // should not get here
        done('no error thrown');
      })
      .catch(e => {
        done();
      });
    });

    it('should emit the assetLoaded event', done => {
      function loaded(asset, url) {
        // this needs to be called first otherwise every load event will call this
        // emitted function
        off('assetLoaded', loaded);

        try {
          expect(assets.dataAssets['/data/test.txt']).to.equal(asset);
          expect(url).to.equal('/data/test.txt');
        } catch(e) {
          return done(e);
        }

        done();
      }
      on('assetLoaded', loaded);
      assets.loadData('/data/test.txt').catch(done);
    });

  });





  // --------------------------------------------------
  // loadAudio
  // --------------------------------------------------
  describe('loadAudio', () => {

    it('should load the audio and resolve with it', done => {
      assets.loadAudio('/audio/shoot.mp3').then(audio => {
        expect(assets.audioAssets['/audio/shoot.mp3']).to.equal(audio);
        expect(assets.audioAssets['/audio/shoot']).to.equal(audio);

        done();
      })
      .catch(done);
    });

    it('should resolve with the audio if it is already loaded', done => {
      assets.loadAudio('/audio/shoot.mp3').then(image => {
        let spy = sinon.spy(Audio.prototype, 'addEventListener');

        assets.loadAudio('/audio/shoot.mp3').then(img => {
          try {
            expect(spy.called).to.equal(false);
          } catch(e) {
            return done(e);
          }

          done();
        });
      })
      .catch(done);
    });

    it('should load the correct audio file based on browser support (mp3)', done => {
      assets._setCanPlayFn(function() {
        return {
          mp3: true,
          ogg: false
        }
      });

      assets.loadAudio(['/audio/shoot.ogg', '/audio/shoot.mp3']).then(audio => {
        expect(assets.audioAssets['/audio/shoot.mp3']).to.equal(audio);
        expect(assets.audioAssets['/audio/shoot']).to.equal(audio);

        done();
      })
      .catch(done);
    });

    it('should load the correct audio file based on browser support (ogg)', done => {
      assets._setCanPlayFn(function() {
        return {
          mp3: false,
          ogg: true
        }
      });

      assets.loadAudio(['/audio/shoot.ogg', '/audio/shoot.mp3']).then(audio => {
        expect(assets.audioAssets['/audio/shoot.ogg']).to.equal(audio);
        expect(assets.audioAssets['/audio/shoot']).to.equal(audio);

        done();
      })
      .catch(done);
    });

    it('should load the first supported auto file in the array', done => {
      assets._setCanPlayFn(function() {
        return {
          mp3: true,
          ogg: true
        }
      });

      assets.loadAudio(['/audio/shoot.ogg', '/audio/shoot.mp3']).then(audio => {
        expect(audio.src.endsWith('/audio/shoot.ogg')).to.equal(true);
        done();
      })
      .catch(done);
    });

    it('should load the audio using audioPath', done => {
      assets.setAudioPath('/audio');

      assets.loadAudio('shoot.mp3').then(audio => {
        expect(assets.audioAssets['/audio/shoot.mp3']).to.equal(audio);
        expect(assets.audioAssets['shoot']).to.equal(audio);

        done();
      })
      .catch(done);
    });

    it('should correctly join the audio path', done => {
      assets.setAudioPath('/audio/');

      assets.loadAudio('/shoot.mp3').then(audio => {
        expect(assets.audioAssets['/audio/shoot.mp3']).to.equal(audio);
        expect(assets.audioAssets['shoot']).to.equal(audio);

        done();
      })
      .catch(done);
    });

    it('should throw an error if the audio failed to load', done => {
      assets.loadAudio('fake.mp3').then(audio => {
        // should not get here
        done('no error thrown');
      })
      .catch(e => {
        done();
      });
    });

    it('should throw an error if no audio source can be played', done => {
      assets.loadAudio('cantPlay.aaa').then(audio => {
        // should not get here
        done('no error thrown');
      })
      .catch(e => {
        done();
      });
    });

    it('should emit the assetLoaded event', done => {
      function loaded(asset, url) {
        // this needs to be called first otherwise every load event will call this
        // emitted function
        off('assetLoaded', loaded);

        try {
          expect(assets.audioAssets['/audio/shoot.mp3']).to.equal(asset);
          expect(url).to.equal('/audio/shoot.mp3');
        } catch(e) {
          done(e);
        }

        done();
      }
      on('assetLoaded', loaded);
      assets.loadAudio('/audio/shoot.mp3').catch(done);
    });

  });





  // --------------------------------------------------
  // load
  // --------------------------------------------------
  describe('load', () => {

    it('should load an image asset', done => {
      expect(assets.imageAssets).to.deep.equal({});

      assets.load('/imgs/bullet.png').then(loadedAssets => {
        expect(assets.imageAssets['/imgs/bullet']).to.equal(loadedAssets[0]);

        done();
      });
    });

    it('should load an audio asset', done => {
      expect(assets.audioAssets).to.deep.equal({});

      assets.load(['/audio/shoot.mp3', '/audio/shoot.ogg']).then(loadedAssets => {
        expect(assets.audioAssets['/audio/shoot']).to.equal(loadedAssets[0]);

        done();
      });
    });

    it('should load an data asset', done => {
      expect(assets.dataAssets).to.deep.equal({});

      assets.load('/data/test.json').then(loadedAssets => {
        expect(assets.dataAssets['/data/test']).to.equal(loadedAssets[0]);

        done();
      });
    });

    it('should load multiple assets', done => {
      assets.load('/imgs/bullet.png', ['/audio/shoot.mp3', '/audio/shoot.ogg'], '/data/test.json').then(loadedAssets => {
        expect(loadedAssets).to.have.lengthOf(3);

        done();
      });
    });

  });

});