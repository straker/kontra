import * as kontra from '../../kontra.js';

kontra.on('myEvent', () => {
  console.log('fired!');
});
kontra.once('myEvent', () => {
  console.log('fired!');
});
kontra.off('myEvent', () => {});
kontra.emit('myEvent');

// args
kontra.on('myEvent', (num, str, bool, obj) => {
  console.log({num, str, bool, obj});
});
kontra.once('myEvent', (num, str, bool, obj) => {
  console.log({num, str, bool, obj});
});
kontra.emit('myEvent', 1, 'string', true, {});