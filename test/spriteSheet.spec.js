// --------------------------------------------------
// kontra.animation
// --------------------------------------------------
describe('', function() {
  var animation;

  beforeEach(function() {
    animation = kontra.animation({
      frames: [1,2,3,4],
      frameRate: 30,
      spriteSheet: {
        image: new Image(),
        framesPerRow: 2,
        frame: {
          width: 5,
          height: 5
        }
      }
    });
  });


  // --------------------------------------------------
  // kontra.animation.init
  // --------------------------------------------------
  describe('kontra.animation.init', function() {

    it('should set properties on the animation', function() {
      expect(animation.frames).to.eql([1,2,3,4]);
      expect(animation.frameRate).to.equal(30);
      expect(animation.width).to.equal(5);
      expect(animation.height).to.equal(5);
    });

  });





  // --------------------------------------------------
  // kontra.animation.update
  // --------------------------------------------------
  describe('kontra.animation.update', function() {

    it('should not update the current frame if not enough time has passed', function() {
      animation.update();

      expect(animation.currentFrame).to.equal(0);
    });

    it('should take no parameter and update the current frame correctly', function() {
      for (var i = 0; i < 3; i++) {
        animation.update();
      }

      expect(animation.currentFrame).to.equal(1);
    });

    it('should take dt as a parameter and update the current frame correctly', function() {
      animation.update(1/30);

      expect(animation.currentFrame).to.equal(1);
    });

    it('should restart the animation when finished', function() {
      for (var i = 0; i < 7; i++) {
        animation.update();
      }

      expect(animation.currentFrame).to.equal(3);

      animation.update();

      expect(animation.currentFrame).to.equal(0);
    });

  });





  // --------------------------------------------------
  // kontra.animation.draw
  // --------------------------------------------------
  describe('kontra.animation.draw', function() {

    it('should draw the spriteSheet at its initial frame', function() {
      var context = {drawImage: sinon.stub()};

      animation.render({
        x: 10,
        y: 10,
        context: context
      });

      expect(context.drawImage.called).to.be.ok;
      expect(context.drawImage.calledWith(
        animation.spriteSheet.image,
        5, 0, 5, 5, 10, 10, 5, 5
      )).to.be.ok;
    });

    it('should use the default context', function() {
      sinon.stub(kontra.context, 'drawImage');

      animation.render({
        x: 10,
        y: 10
      });

      expect(kontra.context.drawImage.called).to.be.ok;

      kontra.context.drawImage.restore();
    });

    it('should draw the spriteSheet in the middle of the animation', function() {
      var context = {drawImage: sinon.stub()};

      animation.currentFrame = 2;

      animation.render({
        x: 10,
        y: 10,
        context: context
      });

      expect(context.drawImage.called).to.be.ok;
      expect(context.drawImage.calledWith(
        animation.spriteSheet.image,
        5, 5, 5, 5, 10, 10, 5, 5
      )).to.be.ok;
    });

  });





  // --------------------------------------------------
  // kontra.animation.stop
  // --------------------------------------------------
  describe('kontra.animation.stop', function() {

    it('should continue the animation', function() {
      animation.stop();

      expect(animation.update).to.equal(kontra.noop);
      expect(animation.render).to.equal(kontra.noop);
    });

  });





  // --------------------------------------------------
  // kontra.animation.pause
  // --------------------------------------------------
  describe('kontra.animation.pause', function() {

    it('should continue the animation', function() {
      animation.pause();

      expect(animation.update).to.equal(kontra.noop);
      expect(animation.render).to.equal(animation._draw);
    });

  });




  // --------------------------------------------------
  // kontra.animation.play
  // --------------------------------------------------
  describe('kontra.animation.play', function() {

    it('should continue the animation', function() {
      animation.stop();
      animation.play();

      expect(animation.update).to.equal(animation._advance);
      expect(animation.render).to.equal(animation._draw);
    });

  });

});





// --------------------------------------------------
// kontra.spriteSheet
// --------------------------------------------------
describe('', function() {

  // --------------------------------------------------
  // kontra.spriteSheet.init
  // --------------------------------------------------
  describe('kontra.spriteSheet.init', function() {

    it('should log an error if no image is provided', function() {
      sinon.stub(kontra, 'logError', kontra.noop);

      kontra.spriteSheet();

      expect(kontra.logError.called).to.be.ok;

      kontra.logError.restore();
    });

    it('should initialize properties on the spriteSheet when passed an image', function() {
      var spriteSheet = kontra.spriteSheet({
        image: new Image(100, 200),
        frameWidth: 10,
        frameHeight: 10
      });

      expect(spriteSheet.frame.width).to.equal(10);
      expect(spriteSheet.frame.height).to.equal(10);
      expect(spriteSheet.framesPerRow).to.equal(10);
    });

    it('should create animations if passed an animation object', function() {
      sinon.stub(kontra.spriteSheet.prototype, 'createAnimations', kontra.noop);

      var spriteSheet = kontra.spriteSheet({
        image: new Image(100, 200),
        frameWidth: 10,
        frameHeight: 10,
        animations: {}
      });

      expect(kontra.spriteSheet.prototype.createAnimations.called).to.be.ok;

      kontra.spriteSheet.prototype.createAnimations.restore();
    });

  });





  // --------------------------------------------------
  // kontra.spriteSheet.createAnimations
  // --------------------------------------------------
  describe('kontra.spriteSheet.createAnimations', function() {
    var spriteSheet;

    beforeEach(function() {
      spriteSheet = kontra.spriteSheet({
        image: new Image(100, 200),
        frameWidth: 10,
        frameHeight: 10
      });
    })

    it('should log an error if no animations object was passed', function() {
      sinon.stub(kontra, 'logError', kontra.noop);

      spriteSheet.createAnimations();

      expect(kontra.logError.called).to.be.ok;

      kontra.logError.restore();
    });

    it('should log an error if the animations object was empty', function() {
      sinon.stub(kontra, 'logError', kontra.noop);

      spriteSheet.createAnimations({});

      expect(kontra.logError.called).to.be.ok;

      kontra.logError.restore();
    });

    it('should log an error if no frames property was passed', function() {
      sinon.stub(kontra, 'logError', kontra.noop);

      spriteSheet.createAnimations({
        'walk': {}
      });

      expect(kontra.logError.called).to.be.ok;

      kontra.logError.restore();
    });

    it('should accept a single frame', function() {
      spriteSheet.createAnimations({
        walk: {
          frames: 1
        }
      });

      expect(spriteSheet.animations.walk).to.exist;
      expect(spriteSheet.animations.walk.frames).to.eql([1]);
    });

    it('should accept a string of ascending consecutive frames', function() {
      spriteSheet.createAnimations({
        walk: {
          frames: '1..5'
        }
      });

      expect(spriteSheet.animations.walk).to.exist;
      expect(spriteSheet.animations.walk.frames).to.eql([1,2,3,4,5]);
    });

    it('should accept a string of descending consecutive frames', function() {
      spriteSheet.createAnimations({
        walk: {
          frames: '5..1'
        }
      });

      expect(spriteSheet.animations.walk).to.exist;
      expect(spriteSheet.animations.walk.frames).to.eql([5,4,3,2,1]);
    });

    it('should accept an array of consecutive frames', function() {
      spriteSheet.createAnimations({
        walk: {
          frames: [1,2,3]
        }
      });

      expect(spriteSheet.animations.walk).to.exist;
      expect(spriteSheet.animations.walk.frames).to.eql([1,2,3]);
    });

    it('should accept an array of non-consecutive frames', function() {
      spriteSheet.createAnimations({
        walk: {
          frames: [1,3,5]
        }
      });

      expect(spriteSheet.animations.walk).to.exist;
      expect(spriteSheet.animations.walk.frames).to.eql([1,3,5]);
    });

    it('should accept a mixture of numbers, strings, and arrays', function() {
      spriteSheet.createAnimations({
        walk: {
          frames: [1, '2..3', 4, 5, '4..1']
        }
      });

      expect(spriteSheet.animations.walk).to.exist;
      expect(spriteSheet.animations.walk.frames).to.eql([1,2,3,4,5,4,3,2,1]);
    });

    it('should log an error if passed an improper frames property', function() {
      sinon.stub(kontra, 'logError', kontra.noop);

      spriteSheet.createAnimations({
        walk: {
          frames: {}
        }
      });

      expect(kontra.logError.called).to.be.ok;

      kontra.logError.restore();
    });

  });

});