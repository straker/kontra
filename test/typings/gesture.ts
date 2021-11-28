import * as kontra from '../../kontra.js';

kontra.initGesture();

let map: object = kontra.gestureMap;
kontra.gestureMap.pan = {
  touches: 1,
  threshold: 10,
  touchstart(touches: object) {
    console.log('touchstart');
  },
  touchmove() {
    console.log('touchmove');
  },
  touchend() {
    console.log('touchend');
  }
};
kontra.gestureMap.foo = {
  touches: 2,
  touchstart(touches: object) {
    console.log('touchstart');
  }
}
kontra.gestureMap.bar = {
  touches: 2,
  touchmove(touches: object) {
    console.log('touchmove');
  }
}
kontra.gestureMap.baz = {
  touches: 2,
  touchend(touches: object) {
    console.log('touchend');
  }
}

kontra.onGesture('panleft', (evt: TouchEvent, touches: object) => {
  console.log('panleft');
});