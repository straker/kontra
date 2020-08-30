import * as kontra from '../../kontra.js';

let degToRad: number = kontra.degToRad(22.35);
let radToDeg: number = kontra.radToDeg(0.39);

let sourceSprite = kontra.Sprite({x: 0, y: 0});
let targetSprite = kontra.Sprite({x: 10, y: 10});
let angleToTargetXY: number = kontra.angleToTarget({x: 0, y: 0}, {x: 10, y: 10});
let angleToTargetSprite = kontra.angleToTarget(sourceSprite, targetSprite);

let point: {x: number, y: number} = kontra.rotatePoint({x: 0, y: 0}, Math.PI);

let randInt: number = kontra.randInt(10, 20);

let seed: Function = kontra.seedRand('kontra');
let rand: number = seed();

let lerp: number = kontra.lerp(10, 20, 0.5);
let inverseLerp: number = kontra.inverseLerp(10, 20, 15);
let clamp: number = kontra.clamp(10, 20, 30);

kontra.setStoreItem('key', true);
let item: boolean = kontra.getStoreItem('key');

let collision: boolean = kontra.collides({
  x: 10,
  y: 20,
  width: 100,
  height: 100
}, {
  x: 20,
  y: 40,
  width: 25,
  height: 25
});

// sprites
let sprite1 = kontra.Sprite();
let sprite2 = kontra.Sprite();

let theyCollides = kontra.collides(sprite1, sprite2);

// rotation
sprite1.rotation = Math.PI;
let nope = kontra.collides(sprite1, sprite2);

// anchor
sprite1.anchor = {x: 0.5, y: 0.5};
let withAnchor = kontra.collides(sprite1, sprite2);

// scale
sprite1.scale = {x: 2, y: 2};
let withScale = kontra.collides(sprite1, sprite2);

let rect = kontra.getWorldRect({
  x: 10,
  y: 20,
  width: 100,
  height: 100
});

// sprites
rect = kontra.getWorldRect(sprite1);