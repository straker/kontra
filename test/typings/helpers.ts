import * as kontra from '../../kontra.js';

let degToRad: number = kontra.degToRad(22.35);
let radToDeg: number = kontra.radToDeg(0.39);

let sourceSprite = kontra.Sprite({x: 0, y: 0});
let targetSprite = kontra.Sprite({x: 10, y: 10});
let angleToTargetXY: number = kontra.angleToTarget({x: 0, y: 0}, {x: 10, y: 10});
let angleToTargetSprite = kontra.angleToTarget(sourceSprite, targetSprite);

let randInt: number = kontra.randInt(10, 20);
let lerp: number = kontra.lerp(10, 20, 0.5);
let inverseLerp: number = kontra.inverseLerp(10, 20, 15);
let clamp: number = kontra.clamp(10, 20, 30);