import * as kontra from '../../kontra.js';

let map: object = kontra.keyMap;
kontra.keyMap.namedKey = 'namedKey';

kontra.initKeys();

kontra.bindKeys('a', (evt: KeyboardEvent) => {
  console.log('a pressed');
});
kontra.bindKeys(['a', 'b', 'c'], () => {
  console.log('a, b, or c pressed');
});

kontra.unbindKeys('a');
kontra.unbindKeys(['a', 'b', 'c']);

let pressed: boolean = kontra.keyPressed('a');