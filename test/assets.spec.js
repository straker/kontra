// --------------------------------------------------
// kontra.assets
// --------------------------------------------------
describe.only('kontra.assets', function() {

  // --------------------------------------------------
  // kontra.assets.loadImage
  // --------------------------------------------------
  describe('loadImage', function() {

    it('should load the image and resolve with it.', function(done) {
      kontra.assets.loadImage('imgs/bullet.gif').then(function(image) {
        expect(kontra.assets.images['imgs/bullet.gif']).to.equal(image);
        expect(kontra.assets.images['imgs/bullet']).to.equal(image);

        done();
      })
      .catch(function(e) {
        done(e);
      });
    });

//     asyncTest('should load the image using assetPaths.images', function() {
//       expect(6);

//       kontra.assetPaths.images = './imgs/';

//       kontra.loadImage('bullet.gif').then(function(image) {
//         ok(image, 'image successfully loaded.');
//         ok(image instanceof Image, 'image returned as Image object.');

//         ok(kontra.images['./imgs/bullet.gif'], 'asset \'./imgs/bullet.gif\' exists.');
//         equal(kontra.images['./imgs/bullet.gif'], image, 'asset \'./imgs/bullet.gif\' is the correct image.');

//         ok(kontra.images['bullet'], 'asset \'bullet\' exists.');
//         equal(kontra.images['bullet'], image, 'asset \'bullet\' is the correct image.');

//         start();
//       }, function(err) {
//         start();
//       });
//     });

//     asyncTest('should throw an error if the image fails to load.', function() {
//       expect(1);

//       kontra.loadImage('someFile.gif').then(function() {
//       }, function(err) {
//         ok(1, 'deferred promise was rejected.');
//         start();
//       });
//     });

//   });






// /***************************************************************
//  *
//  * loadAudio
//  *
//  ***************************************************************/
// module('kontra.loadAudio', {
//   teardown: function() {
//     resetKontra();
//   }
// });

// asyncTest('should load the audio and resolve with it.', function() {
//   expect(6);

//   kontra.loadAudio('./audio/shoot.mp3').then(function(audio) {
//     ok(audio, 'audio successfully loaded.');
//     ok(audio instanceof Audio, 'audio returned as audio object.');

//     ok(kontra.audios['./audio/shoot.mp3'], 'asset \'./audio/shoot.mp3\' exists.');
//     equal(kontra.audios['./audio/shoot.mp3'], audio, 'asset \'./audio/shoot.mp3\' is the correct audio.');

//     ok(kontra.audios['./audio/shoot'], 'asset \'./audio/shoot\' exists.');
//     equal(kontra.audios['./audio/shoot'], audio, 'asset \'./audio/shoot\' is the correct audio.');

//     start();
//   }, function(err) {
//     start();
//   });
// });

// asyncTest('should load the audio using assetPaths.audios', function() {
//   expect(6);

//   kontra.assetPaths.audios = './audio/';

//   kontra.loadAudio('shoot.mp3').then(function(audio) {
//     ok(audio, 'audio successfully loaded.');
//     ok(audio instanceof Audio, 'audio returned as audio object.');

//     ok(kontra.audios['./audio/shoot.mp3'], 'asset \'./audio/shoot.mp3\' exists.');
//     equal(kontra.audios['./audio/shoot.mp3'], audio, 'asset \'./audio/shoot.mp3\' is the correct audio.');

//     ok(kontra.audios['shoot'], 'asset \'shoot\' exists.');
//     equal(kontra.audios['shoot'], audio, 'asset \'shoot\' is the correct audio.');

//     start();
//   }, function(err) {
//     start();
//   });
// });


// asyncTest('should throw an error if the audio fails to load.', function() {
//   expect(1);

//   kontra.loadAudio('someFile.mp3').then(function() {
//   }, function(err) {
//     ok(1, 'deferred promise was rejected.');
//     start();
//   });
// });





// /***************************************************************
//  *
//  * loadData
//  *
//  ***************************************************************/
// module('kontra.loadData', {
//   teardown: function() {
//     resetKontra();
//   }
// });

// asyncTest('should load the parsed JSON.', function() {
//   expect(7);

//   kontra.loadData('./json/test.json').then(function(json) {
//     ok(json, 'json successfully loaded.');
//     ok(json.test, 'property \'test\' exists.');
//     equal(json.test, 'hello', 'property \'test\' is correct.');

//     ok(kontra.data['./json/test.json'], 'asset \'./json/test.json\' exists.');
//     equal(kontra.data['./json/test.json'], json, 'asset \'./json/test.json\' is the correct json.');

//     ok(kontra.data['./json/test'], 'asset \'./json/test\' exists.');
//     equal(kontra.data['./json/test'], json, 'asset \'./json/test\' is the correct json.');

//     start();
//   }, function(err) {
//     start();
//   });
// });


// asyncTest('should load the json using assetPaths.data', function() {
//   expect(7);

//   kontra.assetPaths.data = './json/';

//   kontra.loadData('test.json').then(function(json) {
//     ok(json, 'json successfully loaded.');
//     ok(json.test, 'property \'test\' exists.');
//     equal(json.test, 'hello', 'property \'test\' is correct.');

//     ok(kontra.data['./json/test.json'], 'asset \'./json/test.json\' exists.');
//     equal(kontra.data['./json/test.json'], json, 'asset \'./json/test.json\' is the correct json.');

//     ok(kontra.data['test'], 'asset \'test\' exists.');
//     equal(kontra.data['test'], json, 'asset \'test\' is the correct json.');

//     start();
//   }, function(err) {
//     start();
//   });
// });

// asyncTest('should throw an error if the json fails to load.', function() {
//   expect(1);

//   kontra.loadData('someFile.json').then(function() {
//   }, function(err) {
//     ok(1, 'deferred promise was rejected.');
//     start();
//   });
// });





// /***************************************************************
//  *
//  * loadAssets
//  *
//  ***************************************************************/
// module('kontra.loadAssets', {
//   teardown: function() {
//     resetKontra();
//   }
// });

// asyncTest('should load image assets as Images.', function() {
//   expect(4);

//   var counter = 4;
//   function done() {
//     --counter || start();
//   }

//   kontra.loadAssets('./imgs/bullet.jpeg').then(function() {
//     ok(kontra.images['./imgs/bullet.jpeg']  instanceof Image, '.jpeg loaded as an Image.');
//     done();
//   }, function(err) {
//     done();
//   });

//   kontra.loadAssets('./imgs/bullet.jpg').then(function() {
//     ok(kontra.images['./imgs/bullet.jpg'] instanceof Image, '.jpg loaded as an Image.');
//     done();
//   }, function(err) {
//     done();
//   });

//   kontra.loadAssets('./imgs/bullet.gif').then(function() {
//     ok(kontra.images['./imgs/bullet.gif'] instanceof Image, '.gif loaded as an Image.');
//     done();
//   }, function(err) {
//     done();
//   });

//   kontra.loadAssets('./imgs/bullet.png').then(function() {
//     ok(kontra.images['./imgs/bullet.png'] instanceof Image, '.png loaded as an Image.');
//     done();
//   }, function(err) {
//     done();
//   });
// });

// asyncTest('should throw an error if the browser cannot play an audio format.', function() {
//   expect(1);

//   kontra.loadAssets(['./audio/shoot.nope']).then(function() {
//   }, function(err) {
//     ok(1, 'browser could not load asset.');
//     start();
//   });
// });

// asyncTest('should load a single audio asset as Audio.', function() {
//   expect(1);

//   // find the first audio format that is playable and use it for the test
//   for (var format in kontra.canUse) {
//     if (kontra.canUse.hasOwnProperty(format) && kontra.canUse[format]) {
//       kontra.loadAssets('./audio/shoot.' + format).then(function() {
//         ok(kontra.audios['./audio/shoot'] instanceof Audio, 'asset \'./audio/shoot\' loaded as an Audio.');
//         start();
//       }, function(err) {
//         start();
//       });
//       break;
//     }
//   }
// });

// asyncTest('should load multiple audio assets as Audios.', function() {
//   expect(1);

//   kontra.loadAssets(['./audio/shoot.mp3', './audio/shoot.ogg', './audio/shoot.aac', './audio/shoot.m4a']).then(function() {
//     ok(kontra.audios['./audio/shoot'] instanceof Audio, 'asset \'./audio/shoot\' loaded as an Audio.');
//     start();
//   }, function(err) {
//     start();
//   });
// });

// asyncTest('should load .json assets.', function() {
//   expect(1);

//   kontra.loadAssets('./json/test.json').then(function(json) {
//     ok(kontra.data['./json/test.json'], '.json loaded as JSON.');
//     start();
//   }, function(err) {
//     start();
//   });
// });

// asyncTest('should immediately resolve if the asset is empty.', function() {
//   expect(1);

//   kontra.loadAssets().then(function() {
//     ok(1, 'deferred resolved with empty object.');
//     start();
//   }, function(err) {
//     start();
//   });
// });

// asyncTest('should propagate errors.', function() {
//   expect(1);

//   kontra.loadAssets('test.css').then(function() {
//   }, function(err) {
//     ok(1, 'error propagated.');
//     start();
//   });
// });

// asyncTest('should notify user of progress and properly count the number of assets for a single asset.', function() {
//   expect(2);

//   kontra.loadAssets('./imgs/bullet.jpeg').then(function() {
//   }, function(err) {
//   }, function(progress) {
//     ok(1, 'progress event fired ' + progress.loaded + ' time for single asset.');  // should fire once
//     if (progress.loaded === progress.total) {
//       equal(progress.total, 1, 'assets counted correctly for single asset.');
//       start();
//     }
//   });
// });

// asyncTest('should notify user of progress and properly count the number of assets for multiple assets.', function() {
//   expect(3);

//   kontra.loadAssets(
//     './imgs/bullet.jpeg',
//     './json/test.json'
//   ).then(function() {
//   }, function(err) {
//   }, function(progress) {
//     ok(1, 'progress event fired ' + progress.loaded + ' ' + (progress.loaded === 1 ? 'time' : 'times') + ' for multiple assets.');  // should fire twice
//     if (progress.loaded === progress.total) {
//       equal(progress.total, 2, 'assets counted correctly for multiple assets.');
//       start();
//     }
//   });
// });

  });
});