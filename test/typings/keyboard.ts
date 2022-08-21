import * as kontra from '../../kontra.js';

let map: object = kontra.keyMap;
kontra.keyMap.namedKey = 'namedKey';

kontra.initKeys();

kontra.onKey('a', (evt: KeyboardEvent) => {
  console.log('a pressed');
});
kontra.onKey(['a', 'b', 'c'], () => {
  console.log('a, b, or c pressed');
});
kontra.onKey(['a', 'b', 'c'], () => {
  console.log('a, b, or c pressed');
}, {
  preventDefault: true,
  handler: 'keydown'
});
kontra.onKey(['a', 'b', 'c'], () => {
  console.log('a, b, or c pressed');
}, {
  handler: 'keyup'
});


kontra.offKey('a');
kontra.offKey(['a', 'b', 'c']);

let pressed: boolean = kontra.keyPressed('a');
kontra.keyPressed(['a', 'b', 'c']);