import * as kontra from '../../kontra.js';

let vector: kontra.Vector = kontra.Vector();

let x: number = vector.x;
let y: number = vector.y;

vector.set({x: 10, y: 10});
let newVec: kontra.Vector = vector.add({x: 1, y: 2});
vector.add(newVec);
vector.add({x: 10, y: 10});
let subtract: kontra.Vector = vector.subtract(newVec);
vector.subtract({x: 10, y: 10});
let scale: kontra.Vector = vector.scale(5);
let normalize: kontra.Vector = vector.normalize();
let dot: number = vector.dot(newVec);
vector.dot({x: 10, y: 10});
let length: number = vector.length();
let distance: number = vector.distance(newVec);
vector.distance({x: 10, y: 10});
let angle: number = vector.angle(newVec);
vector.clamp(10, 20, 100, 100);

// options
kontra.Vector(10);
kontra.Vector(10, 20);
kontra.Vector({x: 10, y: 20});

// extends
class CustomVector extends kontra.VectorClass {}
let myVec = new CustomVector();
myVec.add(newVec);