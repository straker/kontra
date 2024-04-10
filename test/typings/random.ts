import * as kontra from '../../kontra.js';

let rand: number = kontra.rand();
let randInt: number = kontra.randInt(10, 20);

function randFn(): number {
  return 12;
}
let randIntWithFunc: number = kontra.randInt(10, 20, randFn);

let seed: number = kontra.getSeed();

kontra.seedRand('kontra');
kontra.seedRand(Date.now());
kontra.seedRand(123489719875);
kontra.seedRand();