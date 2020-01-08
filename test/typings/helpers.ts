import * as kontra from '../../kontra.js';

let degrees: number = kontra.degToRad(22.35);
let radians: number = kontra.radToDeg(0.39);
let int: number = kontra.randInt(10, 20);
let value: number = kontra.lerp(10, 20, 0.5);
let percent: number = kontra.inverseLerp(10, 20, 15);
let clamp: number = kontra.clamp(10, 20, 30);