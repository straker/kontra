import Pool from '../../src/pool.js'
import { noop } from '../../src/utils.js'

// --------------------------------------------------
// pool
// --------------------------------------------------
describe('pool', () => {

  let sprite = function() {
    return {
      render: noop,
      update: function() {
        this.ttl--;
      },
      init: function(properties) {
        this.alive = properties.alive;

        for (let prop in properties) {
          this[prop] = properties[prop];
        }
      },
      isAlive: function() {
        return this.alive || this.ttl > 0;
      },
      ttl: 0
    };
  };





  // --------------------------------------------------
  // init
  // --------------------------------------------------
  describe('init', () => {

    it('should log an error if the create function is not passed', () => {
      function func() {
        Pool();
      }

      expect(func).to.throw();
    });

    it('should log an error if the create function did not return an object', () => {
      function func() {
        Pool({ create: noop});
      }

      expect(func).to.throw();
    });

    it('should log an error if the create function returned an object with missing functions', () => {
      function func() {
        Pool({create: function() {
          return {
            render: noop
          }
        }});
      }

      expect(func).to.throw();
    });

  });





  // --------------------------------------------------
  // get
  // --------------------------------------------------
  describe('get', () => {

    it('should call the objects init function', () => {
      let pool = Pool({
        create: sprite
      });

      let spy = sinon.spy(pool.objects[0], 'init');

      pool.get();

      expect(spy.called).to.be.ok;
    });

    it('should pass the properties to the objects init function', () => {
      let pool = Pool({
        create: sprite
      });

      let args = {
        x: 1
      };

      let spy = sinon.spy(pool.objects[0], 'init');

      pool.get(args);

      expect(spy.calledWith(args)).to.be.ok;
    });

    it('should use the first object in the pool and move it to the back of the pool', () => {
      let pool = Pool({
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
      for (let i = 0; i < 5; i++) {
        pool.objects[i].alive = false;
      }

      // update pool position
      pool.update();

      let expected = [
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

    it('should increase the size of the pool when there are no more objects', () => {
      let pool = Pool({
        create: sprite
      });

      expect(pool.size).to.equal(1);

      pool.get({alive: true});
      pool.get({alive: true});
      pool.get({alive: true});

      expect(pool.size).to.not.equal(1);
    });

    it('should not increase the size of the pool past the max size', () => {
      let pool = Pool({
        create: sprite,
        maxSize: 5
      });

      for (let i = 0; i < 10; i++) {
        pool.get({alive: true});
      }

      expect(pool.size).to.equal(5);
    });

    it('should not continue making objects if not needed', () => {
      let pool = Pool({
        create: sprite,
        maxSize: 500
      });

      for (let i = 0; i < 129; i++) {
        pool.get({
          ttl: 1
        });
      }

      expect(pool.size).to.not.equal(pool.maxSize);
      expect(pool.size).to.be.equal(256);
    });

  });





  // --------------------------------------------------
  // getAliveObjects
  // --------------------------------------------------
  describe('getAliveObjects', () => {

    it('should return only alive objects', () => {
      let id = 0;
      let pool = Pool({
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

    it('should return only alive objects after an update', () => {
      let id = 0;
      let pool = Pool({
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
  // update
  // --------------------------------------------------
  describe('update', () => {

    it('should call each alive objects update function', () => {
      let count = 0;

      let pool = Pool({
        create: function() {
          return {
            render: noop,
            update: function() {
              count++;
            },
            init: function(properties) { this.alive = properties.alive; },
            isAlive: function() { return this.alive; },
          }
        },
        maxSize: 5
      });

      for (let i = 0; i < 3; i++) {
        pool.get({alive: true});
      }

      pool.update();

      expect(count).to.equal(3);
    });

    it('should move a dead object to the front of the pool', () => {
      let pool = Pool({
        create: sprite,
        maxSize: 5
      });

      for (let i = 0; i < 5; i++) {
        pool.get({ttl: 2});
      }
      pool.objects[2].ttl = 1;

      let expected = [
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
  // render
  // --------------------------------------------------
  describe('render', () => {

    it('should call each alive objects render function', () => {
      let count = 0;

      let pool = Pool({
        create: function() {
          return {
            update: noop,
            render: function() {
              count++;
            },
            init: function(properties) { this.alive = properties.alive; },
            isAlive: function() { return this.alive; },
          }
        },
        maxSize: 5
      });

      for (let i = 0; i < 3; i++) {
        pool.get({alive: true});
      }

      pool.render();

      expect(count).to.equal(3);
    });

  });





  // --------------------------------------------------
  // clear
  // --------------------------------------------------
  describe('clear', () => {

    it('should empty the pool', () => {
      let pool = Pool({
        create: sprite,
        maxSize: 20
      });

      for (let i = 0; i < 20; i++) {
        pool.get({alive: true});
      }

      pool.clear();

      expect(pool.objects.length).to.equal(1);
      expect(pool.size).to.equal(1);
    });

  });
});