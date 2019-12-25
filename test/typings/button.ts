import * as kontra from '../../kontra.js';

let button: kontra.Button = kontra.Button({
  text: 'Hello World!',
  color: 'black',
  font: '32px Arial'
});

let str: string = button.text;
let color: string = button.color;
let font: string = button.font;
let textAlign: string = button.textAlign;
let width: number = button.width;
let height: number = button.height;
let disabled: boolean = button.disabled;
let focused: boolean = button.focused;

button.enable();
button.disable();
button.focus();
button.blur();

// inheritance
button.x += 20;
button.rotation = Math.PI;
button.advance();
button.render();

// options
kontra.Text({
  x: 10,
  y: 20,
  text: 'Hello World!',
  color: 'black',
  font: '32px Arial',
  textAlign: 'right',
  width: 200,
  onEnable() {},
  onDisable() {},
  onFocus() {},
  onBlur() {},
  onUp() {}
});