import * as assets from '../../src/assets.js'

// --------------------------------------------------
// assets
// --------------------------------------------------
describe.only('assets', () => {
  beforeEach(() => {
    assets._reset();
  });

  it('should export', () => {
    expect(assets.images).to.be.ok;
    expect(assets.audio).to.be.ok;
    expect(assets.data).to.be.ok;
    expect(assets.setImagePath).to.be.ok;
    expect(assets.setAudioPath).to.be.ok;
    expect(assets.setDataPath).to.be.ok;
    expect(assets.loadImage).to.be.ok;
    expect(assets.loadAudio).to.be.ok;
    expect(assets.loadData).to.be.ok;
    expect(assets.load).to.be.ok;
  });

  // --------------------------------------------------
  // loadImage
  // --------------------------------------------------
  describe('loadImage', () => {

    it('should load an image and resolve with it', done => {
      assets.loadImage('/imgs/bullet.png').then(image => {
        expect(assets.images['/imgs/bullet.png']).to.equal(image);
        expect(assets.images['/imgs/bullet']).to.equal(image);

        done();
      })
      .catch(e => {
        done(e);
      });
    });

    it('should load an image and resolve with it', done => {
      assets.loadImage('/imgs/bullet.png').then(image => {
        expect(assets.images['/imgs/bullet.png']).to.equal(image);
        expect(assets.images['/imgs/bullet']).to.equal(image);

        done();
      })
      .catch(e => {
        done(e);
      });
    });

    it('should load an image using imagePath', done => {
      assets.setImagePath('/imgs');

      assets.loadImage('bullet.png').then(image => {
        expect(assets.images['/imgs/bullet.png']).to.equal(image);
        expect(assets.images['bullet']).to.equal(image);

        done();
      })
      .catch(e => {
        done(e);
      });
    });

    it('should correctly join a relative image path', done => {
      assets.loadImage('../imgs/bullet.png').then(image => {
        expect(assets.images['../imgs/bullet.png']).to.equal(image);
        expect(assets.images['../imgs/bullet']).to.equal(image);

        done();
      })
      .catch(e => {
        done(e);
      });
    });

    it('should correctly join an image path', done => {
      assets.setImagePath('/imgs/');

      assets.loadImage('/bullet.png').then(image => {
        expect(assets.images['/imgs/bullet.png']).to.equal(image);
        expect(assets.images['bullet']).to.equal(image);

        done();
      })
      .catch(e => {
        done(e);
      });
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

  });





  // --------------------------------------------------
  // loadData
  // --------------------------------------------------
  describe('loadData', () => {

    it('should load the data and resolve with it', done => {
      assets.loadData('/data/test.txt').then(data => {
        expect(typeof data).to.equal('string');
        expect(assets.data['/data/test.txt']).to.equal(data);
        expect(assets.data['/data/test']).to.equal(data);

        done();
      })
      .catch(e => {
        done(e);
      });
    });

    it('should parse a JSON file', done => {
      assets.loadData('/data/test.json').then(data => {
        expect(typeof data).to.equal('object');
        expect(assets.data['/data/test.json']).to.equal(data);
        expect(assets.data['/data/test']).to.equal(data);

        done();
      })
      .catch(e => {
        done(e);
      });
    });

    it('should load the data using dataPath', done => {
      assets.setDataPath('/data');

      assets.loadData('test.txt').then(data => {
        expect(assets.data['/data/test.txt']).to.equal(data);
        expect(assets.data['test']).to.equal(data);

        done();
      })
      .catch(e => {
        done(e);
      });
    });

    it('should correctly join the data path', done => {
      assets.setDataPath('/data/');

      assets.loadData('/test.txt').then(data => {
        expect(assets.data['/data/test.txt']).to.equal(data);
        expect(assets.data['test']).to.equal(data);

        done();
      })
      .catch(e => {
        done(e);
      });
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

  });





  // --------------------------------------------------
  // loadAudio
  // --------------------------------------------------
  describe('loadAudio', () => {

    it('should load the audio and resolve with it', done => {
      assets.loadAudio('/audio/shoot.mp3').then(audio => {
        expect(assets.audio['/audio/shoot.mp3']).to.equal(audio);
        expect(assets.audio['/audio/shoot']).to.equal(audio);

        done();
      })
      .catch(e => {
        done(e);
      });
    });

    it('should load the correct audio file based on browser support (mp3)', done => {
      assets._setCanPlayFn(function() {
        return {
          mp3: true,
          ogg: false
        }
      });

      assets.loadAudio(['/audio/shoot.ogg', '/audio/shoot.mp3']).then(audio => {
        expect(assets.audio['/audio/shoot.mp3']).to.equal(audio);
        expect(assets.audio['/audio/shoot']).to.equal(audio);

        done();
      })
      .catch(e => {
        done(e);
      });
    });

    it('should load the correct audio file based on browser support (ogg)', done => {
      assets._setCanPlayFn(function() {
        return {
          mp3: false,
          ogg: true
        }
      });

      assets.loadAudio(['/audio/shoot.ogg', '/audio/shoot.mp3']).then(audio => {
        expect(assets.audio['/audio/shoot.ogg']).to.equal(audio);
        expect(assets.audio['/audio/shoot']).to.equal(audio);

        done();
      })
      .catch(e => {
        done(e);
      });
    });

    it('should load the audio using audioPath', done => {
      assets.setAudioPath('/audio');

      assets.loadAudio('shoot.mp3').then(audio => {
        expect(assets.audio['/audio/shoot.mp3']).to.equal(audio);
        expect(assets.audio['shoot']).to.equal(audio);

        done();
      })
      .catch(e => {
        done(e);
      });
    });

    it('should correctly join the audio path', done => {
      assets.setAudioPath('/audio/');

      assets.loadAudio('/shoot.mp3').then(audio => {
        expect(assets.audio['/audio/shoot.mp3']).to.equal(audio);
        expect(assets.audio['shoot']).to.equal(audio);

        done();
      })
      .catch(e => {
        done(e);
      });
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

  });





  // --------------------------------------------------
  // load
  // --------------------------------------------------
  describe('load', () => {

    it('should load an image asset', done => {
      expect(assets.images).to.deep.equal({});

      assets.load('/imgs/bullet.png').then(loadedAssets => {
        expect(assets.images['/imgs/bullet']).to.equal(loadedAssets[0]);

        done();
      });
    });

    it('should load an audio asset', done => {
      expect(assets.audio).to.deep.equal({});

      assets.load(['/audio/shoot.mp3', '/audio/shoot.ogg']).then(loadedAssets => {
        expect(assets.audio['/audio/shoot']).to.equal(loadedAssets[0]);

        done();
      });
    });

    it('should load an data asset', done => {
      expect(assets.data).to.deep.equal({});

      assets.load('/data/test.json').then(loadedAssets => {
        expect(assets.data['/data/test']).to.equal(loadedAssets[0]);

        done();
      });
    });

  });

});