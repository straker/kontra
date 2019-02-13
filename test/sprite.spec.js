// --------------------------------------------------
// kontra.vector
// --------------------------------------------------
describe('kontra.vector', function() {

  // --------------------------------------------------
  // kontra.vector.init
  // --------------------------------------------------
  describe('init', function() {

    it('should set x and y', function() {
      var vec = kontra.vector(10, 20);

      expect(vec.x).to.equal(10);
      expect(vec.y).to.equal(20);
    });

  });





  // --------------------------------------------------
  // kontra.vector.add
  // --------------------------------------------------
  describe('add', function() {

    it('should add one vector to another', function() {
      var vec1 = kontra.vector(10, 20);
      var vec2 = kontra.vector(5, 10);

      vec1.add(vec2)

      expect(vec1.x).to.eql(15);
      expect(vec1.y).to.eql(30);
    });

    it('should incorporate dt if passed', function() {
      var vec1 = kontra.vector(10, 20);
      var vec2 = kontra.vector(5, 10);

      vec1.add(vec2, 2)

      expect(vec1.x).to.eql(20);
      expect(vec1.y).to.eql(40);
    });

    it('should default vector to 0 with empty parameters', function() {
      var vec1 = kontra.vector(10, 20);

      vec1.add({x: 10});

      expect(vec1.y).to.eql(20);

      vec1 = kontra.vector(10, 20);
      vec1.add({y: 10});

      expect(vec1.x).to.eql(10);
    });

  });





  // --------------------------------------------------
  // kontra.vector.clamp
  // --------------------------------------------------
  describe('clamp', function() {
    var vec;

    beforeEach(function() {
      vec = kontra.vector(10, 20);
      vec.clamp(0, 10, 50, 75);
    })

    it('should clamp the vectors x value', function() {
      vec.x = -10;

      expect(vec.x).to.equal(0);

      vec.x = 100;

      expect(vec.x).to.equal(50);
    });

    it('should clamp the vectors y value', function() {
      vec.y = -10;

      expect(vec.y).to.equal(10);

      vec.y = 100;

      expect(vec.y).to.equal(75);
    });

  });

});





// --------------------------------------------------
// kontra.sprite
// --------------------------------------------------
describe('kontra.sprite', function() {

  before(function() {
    if (!kontra.canvas) {
      var canvas = document.createElement('canvas');
      canvas.width = canvas.height = 600;
      kontra.init(canvas);
    }
  });

  // --------------------------------------------------
  // kontra.sprite.init
  // --------------------------------------------------
  describe('init', function() {

    it('should set default properties on the sprite when passed no arguments', function() {
      var sprite = kontra.sprite();

      expect(sprite.context).to.equal(kontra.context);
      expect(sprite.width).to.equal(0);
      expect(sprite.height).to.equal(0);
      expect(sprite.position.constructor.name).to.equal('Vector');
      expect(sprite.velocity.constructor.name).to.equal('Vector');
      expect(sprite.acceleration.constructor.name).to.equal('Vector');
      expect(sprite.ttl).to.equal(Infinity);
    });

    it('should set basic properties of width, height, color, x, and y', function() {
      var sprite = kontra.sprite({
        x: 10,
        y: 20,
        color: 'red',
        width: 5,
        height: 15
      });

      expect(sprite.x).to.equal(10);
      expect(sprite.y).to.equal(20);
      expect(sprite.color).to.equal('red');
      expect(sprite.width).to.equal(5);
      expect(sprite.height).to.equal(15);
    });

    it('should set properties of velocity, acceleration, and a different context', function() {
      var context = {foo: 'bar'};

      var sprite = kontra.sprite({
        dx: 2,
        dy: 1,
        ddx: 0.5,
        ddy: 0.2,
        context: context
      });

      expect(sprite.dx).to.equal(2);
      expect(sprite.dy).to.equal(1);
      expect(sprite.ddx).to.equal(0.5);
      expect(sprite.ddy).to.equal(0.2);
      expect(sprite.context).to.equal(context);
    });

    it('should keep the position, velocity, and acceleration vectors in sync', function() {
      var sprite = kontra.sprite();

      sprite.x = 10;
      sprite.y = 20;
      sprite.dx = 2;
      sprite.dy = 1;
      sprite.ddx = 0.5;
      sprite.ddy = 0.2;

      expect(sprite.position.x).to.equal(10);
      expect(sprite.position.y).to.equal(20);
      expect(sprite.velocity.x).to.equal(2);
      expect(sprite.velocity.y).to.equal(1);
      expect(sprite.acceleration.x).to.equal(0.5);
      expect(sprite.acceleration.y).to.equal(0.2);
    });

    it('should set the width and height of the sprite to an image if passed', function() {
      var img = new Image();
      img.width = 10;
      img.height = 20;

      var sprite = kontra.sprite({
        image: img
      });

      expect(sprite.image).to.equal(img);
      expect(sprite.width).to.equal(10);
      expect(sprite.height).to.equal(20);
    });

    it('should set the width and height of the sprite to an animation if passed', function() {
      // simple animation object from kontra.spriteSheet
      var animations = {
        'walk': {
          width: 10,
          height: 20,
          clone: function() {
            return this;
          }
        }
      };

      var sprite = kontra.sprite({
        animations: animations
      });

      expect(sprite.animations).to.eql(animations);
      expect(sprite._ca).to.equal(animations.walk);
      expect(sprite.width).to.equal(10);
      expect(sprite.height).to.equal(20);
    });

    it('should clone any animations to prevent frame corruption', function() {

      var animations = {
        'walk': {
          width: 10,
          height: 20,
          clone: function() {
            return this;
          }
        }
      };

      sinon.spy(animations.walk, 'clone');

      var sprite = kontra.sprite({
        animations: animations
      });

      expect(animations.walk.clone.called).to.be.true;
    });

    it('should set all additional properties on the sprite', function() {
      var sprite = kontra.sprite({
        foo: 'bar',
        alive: true
      });

      expect(sprite.foo).to.equal('bar');
      expect(sprite.alive).to.be.true;
    });

    it('should have required properties for kontra.pool', function() {
      var sprite = kontra.sprite();
      expect(typeof sprite.init).to.equal('function');
      expect(typeof sprite.update).to.equal('function');
      expect(typeof sprite.isAlive).to.equal('function');
    });

  });





  // --------------------------------------------------
  // kontra.sprite.update
  // --------------------------------------------------
  describe('update', function() {

    it('should move a rect sprite by its velocity and acceleration', function() {
      var sprite = kontra.sprite({
        x: 10,
        y: 20,
        dx: 2,
        dy: 1,
        ddx: 0.5,
        ddy: 0.2
      });

      sprite.update();

      expect(sprite.dx).to.equal(2.5);
      expect(sprite.dy).to.equal(1.2);
      expect(sprite.x).to.equal(12.5);
      expect(sprite.y).to.equal(21.2);
    });

    it('should move an image sprite by its velocity and acceleration', function() {
      var img = new Image();
      img.width = 10;
      img.height = 20;

      var sprite = kontra.sprite({
        x: 10,
        y: 20,
        dx: 2,
        dy: 1,
        ddx: 0.5,
        ddy: 0.2,
        image: img
      });

      sprite.update();

      expect(sprite.dx).to.equal(2.5);
      expect(sprite.dy).to.equal(1.2);
      expect(sprite.x).to.equal(12.5);
      expect(sprite.y).to.equal(21.2);
    });

    it('should move an animation sprite by its velocity and acceleration', function() {
      // simple animation object from kontra.spriteSheet
      var animations = {
        'walk': {
          width: 10,
          height: 20,
          update: kontra._noop,
          clone: function() {
            return this;
          }
        }
      };

      var sprite = kontra.sprite({
        x: 10,
        y: 20,
        dx: 2,
        dy: 1,
        ddx: 0.5,
        ddy: 0.2,
        animations: animations
      });

      sprite.update();

      expect(sprite.dx).to.equal(2.5);
      expect(sprite.dy).to.equal(1.2);
      expect(sprite.x).to.equal(12.5);
      expect(sprite.y).to.equal(21.2);
    });

  });





  // --------------------------------------------------
  // kontra.sprite.render
  // --------------------------------------------------
  describe('render', function() {

    it('should draw a rect sprite', function() {
      var sprite = kontra.sprite({
        x: 10,
        y: 20
      });

      sinon.stub(sprite.context, 'fillRect').callsFake(kontra._noop);

      sprite.render();

      expect(sprite.context.fillRect.called).to.be.ok;

      sprite.context.fillRect.restore();
    });

    it('should draw an image sprite', function() {
      var img = new Image();
      img.width = 10;
      img.height = 20;

      var sprite = kontra.sprite({
        x: 10,
        y: 20,
        image: img
      });

      sinon.stub(sprite.context, 'drawImage').callsFake(kontra._noop);

      sprite.render();

      expect(sprite.context.drawImage.called).to.be.ok;

      sprite.context.drawImage.restore();
    });

    it('should draw an animation sprite', function() {
      // simple animation object from kontra.spriteSheet
      var animations = {
        'walk': {
          width: 10,
          height: 20,
          update: kontra._noop,
          render: kontra._noop,
          clone: function() {
            return this;
          }
        }
      };

      var sprite = kontra.sprite({
        x: 10,
        y: 20,
        animations: animations
      });

      sinon.stub(sprite._ca, 'render').callsFake(kontra._noop);

      sprite.render();

      expect(sprite._ca.render.called).to.be.ok;

      sprite._ca.render.restore();
    });

    it('should rotate the sprite', function() {
      var sprite = kontra.sprite({
        x: 10,
        y: 20,
        rotation: Math.PI
      });

      sinon.stub(sprite.context, 'rotate').callsFake(kontra._noop);

      sprite.render();

      expect(sprite.context.rotate.called).to.be.ok;

      sprite.context.rotate.restore();
    });

    it('should draw a rect sprite and take into account sprite.anchor', function() {
      var sprite = kontra.sprite({
        x: 10,
        y: 20,
        width: 100,
        height: 50,
        anchor: {
          x: 0.5,
          y: 0.5
        }
      });

      sinon.stub(sprite.context, 'fillRect').callsFake(kontra._noop);

      sprite.render();

      expect(sprite.context.fillRect.calledWith(-50, -25, 100, 50)).to.be.ok;

      sprite.anchor = {x: 1, y: 1};
      sprite.render();

      expect(sprite.context.fillRect.calledWith(-100, -50, 100, 50)).to.be.ok;

      sprite.context.fillRect.restore();
    });

    it('should draw an image sprite and take into account sprite.anchor and custom width', function() {
      var img = new Image();
      img.width = 10;
      img.height = 20;

      var sprite = kontra.sprite({
        x: 10,
        y: 20,
        image: img,
        anchor: {
          x: 0.5,
          y: 0.5
        }
      });

      sinon.stub(sprite.context, 'drawImage').callsFake(kontra._noop);

      sprite.render();
      expect(sprite.context.drawImage.calledWith(img, 0, 0, 10, 20, -5, -10, 10, 20)).to.be.ok;

      sprite.anchor = {x: 1, y: 1};
      sprite.render();

      expect(sprite.context.drawImage.calledWith(img, 0, 0, 10, 20, -10, -20, 10, 20)).to.be.ok;

      sprite.width = 20;
      sprite.render();

      expect(sprite.context.drawImage.calledWith(img, 0, 0, 10, 20, -20, -20, 20, 20)).to.be.ok;

      sprite.context.drawImage.restore();
    });

    it('should draw an animation sprite and take into account sprite.anchor', function() {
      var animations = {
        'walk': {
          width: 10,
          height: 20,
          update: kontra._noop,
          render: kontra._noop,
          clone: function() {
            return this;
          }
        }
      };

      var sprite = kontra.sprite({
        x: 10,
        y: 20,
        animations: animations,
        anchor: {
          x: 0.5,
          y: 0.5
        }
      });

      sinon.stub(sprite._ca, 'render').callsFake(kontra._noop);

      sprite.render();

      expect(sprite._ca.render.calledWithMatch({x: -5, y: -10, context: sprite.context})).to.be.ok;

      sprite.anchor = {x: 1, y: 1};
      sprite.render();

      expect(sprite._ca.render.calledWithMatch({x: -10, y: -20, context: sprite.context})).to.be.ok;

      sprite._ca.render.restore();
    });

  });





  // --------------------------------------------------
  // kontra.sprite.collidesWith
  // --------------------------------------------------
  describe('collidesWith', function() {

    it('should correctly detect collision between two objects', function() {
      var sprite1 = kontra.sprite({
        x: 10,
        y: 20,
        width: 10,
        height: 20
      });

      var sprite2 = kontra.sprite({
        x: 19,
        y: 39,
        width: 10,
        height: 20
      });

      expect(sprite1.collidesWith(sprite2)).to.be.true;

      sprite2.x = 10;
      sprite2.y = 20;

      expect(sprite1.collidesWith(sprite2)).to.be.true;

      sprite2.x = 1;
      sprite2.y = 1;

      expect(sprite1.collidesWith(sprite2)).to.be.true;

      sprite2.x = 20;
      sprite2.y = 40;

      expect(sprite1.collidesWith(sprite2)).to.be.false;

      sprite2.x = 0;
      sprite2.y = 0;

      expect(sprite1.collidesWith(sprite2)).to.be.false;
    });

    it('should take into account sprite.anchor', function() {
      var sprite1 = kontra.sprite({
        x: 10,
        y: 20,
        width: 10,
        height: 20,
        anchor: {
          x: 0.5,
          y: 0.5
        }
      });

      var sprite2 = kontra.sprite({
        x: 10,
        y: 20,
        width: 10,
        height: 20
      });

      expect(sprite1.collidesWith(sprite2)).to.be.true;

      sprite1.anchor = {x: 1, y: 0};

      expect(sprite1.collidesWith(sprite2)).to.be.false;

      sprite2.anchor = {x: 1, y: 0};

      expect(sprite1.collidesWith(sprite2)).to.be.true;
    });

  });





  // --------------------------------------------------
  // kontra.sprite.isAlive
  // --------------------------------------------------
  describe('isAlive', function() {

    it('should return true when the sprite is alive', function() {
      var sprite = kontra.sprite();

      expect(sprite.isAlive()).to.be.true;

      sprite.ttl = 1;

      expect(sprite.isAlive()).to.be.true;

      sprite.ttl = -0;

      expect(sprite.isAlive()).to.be.false;
    });

  });





  // --------------------------------------------------
  // kontra.sprite.playAnimation
  // --------------------------------------------------
  describe('playAnimation', function() {

    it('should set the animation to play', function() {
      var animations = {
        'walk': {
          width: 10,
          height: 20,
          reset: sinon.spy(),
          clone: function() {
            return this;
          }
        },
        'idle': {
          width: 10,
          height: 20,
          reset: sinon.spy(),
          clone: function() {
            return this;
          }
        }
      };

      var sprite = kontra.sprite({
        animations: animations
      });

      expect(sprite._ca).to.equal(animations.walk);

      sprite.playAnimation('idle');

      expect(sprite._ca).to.equal(animations.idle);
    });

  });

  it('should reset the animation if it doesn\'t loop', function() {
    var animations = {
      'walk': {
        width: 10,
        height: 20,
        loop: false,
        reset: sinon.spy(),
        clone: function() {
          return this;
        }
      }
    };

    var sprite = kontra.sprite({
      animations: animations
    });

    sprite.playAnimation('walk');

    expect(animations.walk.reset.called).to.be.true;
  });

});