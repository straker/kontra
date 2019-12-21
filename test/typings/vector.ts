import * as kontra from '../../kontra.js';

let vector: kontra.Vector = kontra.Vector();

let x: number = vector.x;
let y: number = vector.y;

let newVec: kontra.Vector = vector.add({x: 1, y: 2});
vector.add(newVec, 1/60);

vector.clamp(10, 20, 100, 100);

// options
kontra.Vector(10);
kontra.Vector(10, 20);