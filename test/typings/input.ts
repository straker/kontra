import * as kontra from '../../kontra.js';

kontra.initInput();

kontra.onInput('south', () => {
  console.log('south gamepad pressed');
});
kontra.onInput(['arrowleft', 'south'], () => {});
kontra.onInput('south', () => {}, { gamepad: { gamepad: 1 }});
kontra.onInput('arrowleft', () => {}, { key: { handler: 'keydown' }});

kontra.offInput('south');
kontra.offInput(['south', 'arrowleft']);
kontra.offInput('south', { gamepad: { gamepad: 1 }});
kontra.offInput('arrowleft', { key: { handler: 'keydown' }});
