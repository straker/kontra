import * as kontra from '../../kontra.js';

let vector: kontra.Vector = kontra.Vector();

let x: number = vector.x;
let y: number = vector.y;

let newVec: kontra.Vector = vector.add({x: 1, y: 2});
vector.add(newVec);
vector.add({x: 10, y: 10});
vector.subtract(newVec);
vector.subtract({x: 10, y: 10});
vector.scale(5);
vector.normalize();
vector.dot(newVec);
vector.dot({x: 10, y: 10});
vector.length();
vector.distance(newVec);
vector.distance({x: 10, y: 10});
vector.angle(newVec);
vector.clamp(10, 20, 100, 100);

// options
kontra.Vector(10);
kontra.Vector(10, 20);