import * as kontra from '../../kontra.js';

let map: object = kontra.gamepadMap;
kontra.gamepadMap[0] = 'A';

kontra.initGamepad();
kontra.updateGamepad();

kontra.onGamepad('south', (gamepad: Gamepad, button: GamepadButton) => {
  console.log('south pressed');
});
kontra.onGamepad(['south', 'north', 'east'], () => {
  console.log('south, north, or east pressed');
});
kontra.onGamepad(['south', 'north', 'east'], () => {
  console.log('south, north, or east pressed');
}, {
  gamepad: 1,
  handler: 'gamepaddown'
});
kontra.onGamepad(['south', 'north', 'east'], () => {
  console.log('south, north, or east pressed');
}, {
  handler: 'gamepadup'
});

kontra.offGamepad('south');
kontra.offGamepad(['south', 'north', 'east']);
kontra.offGamepad(['south', 'north', 'east'], {
  gamepad: 1,
  handler: 'gamepaddown'
});
kontra.offGamepad(['south', 'north', 'east'], {
  handler: 'gamepadup'
});

kontra.gamepadPressed('south');
kontra.gamepadPressed('south', { gamepad: 1 });

kontra.gamepadAxis('leftstickx', 0);