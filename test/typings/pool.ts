import * as kontra from '../../kontra.js';

let pool: kontra.Pool = kontra.Pool({
  create() {
    return kontra.Sprite();
  }
});

let objs: object[] = pool.objects;
let size: number = pool.size;
let maxSize: number = pool.maxSize;

let object: object = pool.get();
let obj = pool.get({
  x: 1,
  y: 2
});
let aliveObjs: object[] = pool.getAliveObjects();
pool.clear();
pool.update();
pool.update(1/60);
pool.render();

// options
kontra.Pool({
  create() {
    return kontra.Sprite();
  },
  maxSize: 2
});

// custom create
let customPool = kontra.Pool({
  create() {
    return {
      init() {},
      isAlive() {
        return true;
      },
      update() {},
      render() {}
    }
  }
});

// custom create with options
let customPoolOpts = kontra.Pool({
  create() {
    return {
      init(properties) {},
      isAlive() {
        return true;
      },
      update(dt) {},
      render() {}
    }
  }
});

// kontra object create
let spriteCreate = kontra.Pool({
  create: kontra.Sprite
});

// extends
class CustomPool extends kontra.PoolClass {}
let myPool = new CustomPool({
  create() {
    return kontra.Sprite();
  }
});
myPool.clear();