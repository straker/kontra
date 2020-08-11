import * as kontra from '../../kontra.js';

let gameObject: kontra.GameObject = kontra.GameObject();

let position: kontra.Vector = gameObject.position;
let velocity: kontra.Vector = gameObject.velocity;
let acceleration: kontra.Vector = gameObject.acceleration;
let width: number = gameObject.width;
let height: number = gameObject.height;
let context: CanvasRenderingContext2D = gameObject.context;
let children: kontra.GameObject[] = gameObject.children;
let rotation: number = gameObject.rotation;
let ttl: number = gameObject.ttl;
let anchor: {x: number, y: number} = gameObject.anchor;
let sx: number = gameObject.sx;
let sy: number = gameObject.sy;
let x: number = gameObject.x;
let y: number = gameObject.y;
let dx: number = gameObject.dx;
let dy: number = gameObject.dy;
let ddx: number = gameObject.ddx;
let ddy: number = gameObject.ddy;
let scaleX: number = gameObject.scaleX;
let scaleY: number = gameObject.scaleY;
let opacity: number = gameObject.opacity;
let world: {
  x: number,
  y: number,
  width: number,
  height: number,
  rotation: number,
  opacity: number,
  scaleX: number,
  scaleY: number
} = gameObject.world;

let alive: boolean = gameObject.isAlive();
gameObject.addChild(kontra.GameObject());
gameObject.removeChild(kontra.GameObject());
gameObject.update();
gameObject.update(1/60);
gameObject.advance();
gameObject.advance(1/60);
gameObject.render();
gameObject.render(() => true);
gameObject.draw();
gameObject.setScale(1);
gameObject.setScale(1, 2);

// options
kontra.GameObject({
  x: 10,
  y: 20,
  width: 100,
  height: 100,
  dx: 2,
  dy: 2,
  ddx: 2,
  ddy: 2,
  ttl: 10,
  rotation: 10,
  anchor: {x: 2, y: 2},
  scaleX: 2,
  scaleY: 2,
  opacity: 0.5,
  context: document.createElement('canvas').getContext('2d'),
  update() {},
  render() {}
});

// custom props
kontra.GameObject({
  name: 'myObject'
});