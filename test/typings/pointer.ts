import * as kontra from '../../kontra.js';

let x: number = kontra.pointer.x;
let y: number = kontra.pointer.y;
let radius: number = kontra.pointer.radius;

kontra.initPointer();

kontra.track({one: 1});
kontra.track({one: 1}, {two: 2});

kontra.untrack({one: 1});
kontra.untrack({one: 1}, {two: 2});

let over: boolean = kontra.pointerOver({one: 1});

kontra.onPointerDown((evt: MouseEvent, object: object) => {
  let target = evt.target;
  if (object) {
    console.log('over!');
  }
});
kontra.onPointerDown((evt: MouseEvent) => {
  let target = evt.target;
  console.log('no object');
});
kontra.onPointerDown(() => {});

kontra.onPointerUp((evt: MouseEvent, object: object) => {
  let target = evt.target;
  if (object) {
    console.log('up!');
  }
});
kontra.onPointerUp((evt: MouseEvent) => {
  let target = evt.target;
  console.log('no object');
});
kontra.onPointerUp(() => {});

let pressed: boolean = kontra.pointerPressed('left');