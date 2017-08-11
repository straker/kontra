// --------------------------------------------------
// kontra.pool
// --------------------------------------------------
describe('kontra.pool', function() {

  var sprite = function() {
    return {
      render: kontra._noop,
      update: function() {
        this.ttl--;
      },
      init: function(properties) {
        this.alive = properties.alive;

        for(prop in properties) {
          this[prop] = properties[prop];
        }
      },
      isAlive: function() {
        return this.alive || this.ttl > 0;
      },
    };
  };





  // --------------------------------------------------
  // kontra.pool.init
  // --------------------------------------------------
  describe('init', function() {

    it('should log an error if the create function is not passed', function() {
      function func() {
        kontra.pool();
      }

      expect(func).to.throw();
    });

    it('should log an error if the create function did not return an object', function() {
      function func() {
        kontra.pool({create:kontra._noop});
      }

      expect(func).to.throw();
    });

    it('should log an error if the create function returned an object with missing functions', function() {
      function func() {
        kontra.pool({create: function() {
          return {
            render: kontra._noop
          }
        }});
      }

      expect(func).to.throw();
    });

  });





  // --------------------------------------------------
  // kontra.pool.get
  // --------------------------------------------------
  describe('get', function() {

    it('should call the objects init function', function() {
      var pool = kontra.pool({
        create: sprite
      });

      var spy = sinon.spy(pool.objects[0], 'init');

      pool.get();

      expect(spy.called).to.be.ok;
    });

    it('should pass the properties to the objects init function', function() {
      var pool = kontra.pool({
        create: sprite
      });

      var args = {
        x: 1
      };

      var spy = sinon.spy(pool.objects[0], 'init');

      pool.get(args);

      expect(spy.calledWith(args)).to.be.ok;
    });

    it('should use the first object in the pool and move it to the back of the pool', function() {
      var pool = kontra.pool({
        create: sprite,
        maxSize: 5,
      });

      // fill the pool
      pool.get({alive: true});
      pool.get({alive: true});
      pool.get({alive: true});
      pool.get({alive: true});
      pool.get({alive: true});

      // kill objects in the pool
      for (var i = 0; i < 5; i++) {
        pool.objects[i].alive = false;
      }

      // update pool position
      pool.update();

      var expected = [
        pool.objects[1],
        pool.objects[2],
        pool.objects[3],
        pool.objects[4],
        pool.objects[0]
      ]

      pool.get();

      expect(pool.objects[0]).to.equal(expected[0]);
      expect(pool.objects[1]).to.equal(expected[1]);
      expect(pool.objects[2]).to.equal(expected[2]);
      expect(pool.objects[3]).to.equal(expected[3]);
      expect(pool.objects[4]).to.equal(expected[4]);
    });

    it('should increase the size of the pool when there are no more objects', function() {
      var pool = kontra.pool({
        create: sprite
      });

      expect(pool.size).to.equal(1);

      pool.get({alive: true});
      pool.get({alive: true});
      pool.get({alive: true});

      expect(pool.size).to.not.equal(1);
    });

    it('should not increase the size of the pool past the max size', function() {
      var pool = kontra.pool({
        create: sprite,
        maxSize: 5
      });

      for (var i = 0; i < 10; i++) {
        pool.get({alive: true});
      }

      expect(pool.size).to.equal(5);
    });

  });





  // --------------------------------------------------
  // kontra.pool.getAliveObjects
  // --------------------------------------------------
  describe('getAliveObjects', function() {

    it('should return only alive objects', function() {
      var id = 0;
      var pool = kontra.pool({
        create: sprite,
        maxSize: 5
      });

      pool.get({alive: true, id: id++});

      expect(pool.getAliveObjects().length).to.equal(1);
      expect(pool.getAliveObjects()[0].id).to.equal(0);

      pool.get({alive: true, id: id++});
      pool.get({alive: true, id: id++});

      expect(pool.getAliveObjects().length).to.equal(3);
      expect(pool.getAliveObjects()[0].id).to.equal(0);
      expect(pool.getAliveObjects()[1].id).to.equal(1);
      expect(pool.getAliveObjects()[2].id).to.equal(2);
    });

    it('should return only alive objects after an update', function() {
      var id = 0;
      var pool = kontra.pool({
        create: sprite,
        maxSize: 5
      });

      pool.get({alive: true, id: id++});
      pool.get({alive: true, id: id++});
      pool.get({alive: true, id: id++});

      pool.getAliveObjects()[1].alive = false;
      pool.update();

      expect(pool.getAliveObjects().length).to.equal(2);
      expect(pool.getAliveObjects()[0].id).to.equal(0);
      expect(pool.getAliveObjects()[1].id).to.equal(2);
    });

  });





  // --------------------------------------------------
  // kontra.pool.update
  // --------------------------------------------------
  describe('update', function() {

    it('should call each alive objects update function', function() {
      var count = 0;

      var pool = kontra.pool({
        create: function() {
          return {
            render: kontra._noop,
            update: function() {
              count++;
            },
            init: function(properties) { this.alive = properties.alive; },
            isAlive: function() { return this.alive; },
          }
        },
        maxSize: 5
      });

      for (var i = 0; i < 3; i++) {
        pool.get({alive: true});
      }

      pool.update();

      expect(count).to.equal(3);
    });

    it('should move a dead object to the front of the pool', function() {
      var pool = kontra.pool({
        create: sprite,
        maxSize: 5
      });

      for (var i = 0; i < 5; i++) {
        pool.get({ttl: 2});
      }
      pool.objects[2].ttl = 1;

      var expected = [
        pool.objects[2],
        pool.objects[0],
        pool.objects[1],
        pool.objects[3],
        pool.objects[4]
      ];

      expect(pool.objects[0].isAlive()).to.be.true;

      pool.update();

      expect(pool.getAliveObjects().length).to.equal(4);
      expect(pool.objects[0].isAlive()).to.be.false;
      expect(pool.getAliveObjects().indexOf(pool.objects[0])).to.equal(-1);

      expect(pool.objects[0]).to.equal(expected[0]);
      expect(pool.objects[1]).to.equal(expected[1]);
      expect(pool.objects[2]).to.equal(expected[2]);
      expect(pool.objects[3]).to.equal(expected[3]);
      expect(pool.objects[4]).to.equal(expected[4]);
    });

  });





  // --------------------------------------------------
  // kontra.pool.render
  // --------------------------------------------------
  describe('render', function() {

    it('should call each alive objects render function', function() {
      var count = 0;

      var pool = kontra.pool({
        create: function() {
          return {
            update: kontra._noop,
            render: function() {
              count++;
            },
            init: function(properties) { this.alive = properties.alive; },
            isAlive: function() { return this.alive; },
          }
        },
        maxSize: 5
      });

      for (var i = 0; i < 3; i++) {
        pool.get({alive: true});
      }

      pool.render();

      expect(count).to.equal(3);
    });

  });





  // --------------------------------------------------
  // kontra.pool.clear
  // --------------------------------------------------
  describe('clear', function() {

    it('should empty the pool', function() {
      var pool = kontra.pool({
        create: sprite,
        maxSize: 20
      });

      for (var i = 0; i < 20; i++) {
        pool.get({alive: true});
      }

      pool.clear();

      expect(pool.objects.length).to.equal(1);
      expect(pool.size).to.equal(1);
    });

  });
});