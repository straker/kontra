// --------------------------------------------------
// kontra.animation
// --------------------------------------------------
describe('kontra.animation', function() {
  var animation;

  before(function() {
    if (!kontra.canvas) {
      var canvas = document.createElement('canvas');
      canvas.width = canvas.height = 600;
      kontra.init(canvas);
    }
  });

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
  describe('init', function() {

    it('should set properties on the animation', function() {
      expect(animation.frames).to.eql([1,2,3,4]);
      expect(animation.frameRate).to.equal(30);
      expect(animation.width).to.equal(5);
      expect(animation.height).to.equal(5);
      expect(animation.loop).to.equal(true);
    });

  });





  // --------------------------------------------------
  // kontra.animation.clone
  // --------------------------------------------------
  describe('clone', function() {

    it('should return a new animation with the same properties', function() {
      var anim = animation.clone();

      expect(anim).to.not.equal(animation);
      expect(anim).to.eql(animation);
    });

  });





  // --------------------------------------------------
  // kontra.animation.update
  // --------------------------------------------------
  describe('update', function() {

    it('should not update the current frame if not enough time has passed', function() {
      animation.update();

      expect(animation._frame).to.equal(0);
    });

    it('should take no parameter and update the current frame correctly', function() {
      for (var i = 0; i < 3; i++) {
        animation.update();
      }

      expect(animation._frame).to.equal(1);
    });

    it('should take dt as a parameter and update the current frame correctly', function() {
      animation.update(1/30);

      expect(animation._frame).to.equal(1);
    });

    it('should restart the animation when finished', function() {
      for (var i = 0; i < 7; i++) {
        animation.update();
      }

      expect(animation._frame).to.equal(3);

      animation.update();

      expect(animation._frame).to.equal(0);
    });

    it('should not reset the animation if loop is false', function() {
      animation.loop = false;

      for (var i = 0; i < 7; i++) {
        animation.update();
      }

      expect(animation._frame).to.equal(3);

      animation.update();

      expect(animation._frame).to.equal(3);
    });

  });





  // --------------------------------------------------
  // kontra.animation.draw
  // --------------------------------------------------
  describe('draw', function() {

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

      animation._frame = 2;

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

});





// --------------------------------------------------
// kontra.spriteSheet
// --------------------------------------------------
describe('kontra.spriteSheet', function() {

  // --------------------------------------------------
  // kontra.spriteSheet.init
  // --------------------------------------------------
  describe('init', function() {

    it('should log an error if no image is provided', function() {
      function func() {
        kontra.spriteSheet();
      }

      expect(func).to.throw();
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
      sinon.stub(kontra.spriteSheet.prototype, 'createAnimations').callsFake(kontra._noop);

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
  describe('createAnimations', function() {
    var spriteSheet;

    beforeEach(function() {
      spriteSheet = kontra.spriteSheet({
        image: new Image(100, 200),
        frameWidth: 10,
        frameHeight: 10
      });
    })

    it('should log an error if no frames property was passed', function() {
      function func() {
        spriteSheet.createAnimations({
          'walk': {}
        });
      }

      expect(func).to.throw();
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

  });

});