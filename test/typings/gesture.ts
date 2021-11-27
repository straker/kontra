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

kontra.onGesture('panleft', (evt: TouchEvent, touches: object) => {
  console.log('panleft');
});