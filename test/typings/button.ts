import * as kontra from '../../kontra.js';

let button: kontra.Button = kontra.Button({
  padX: 0,
  padY: 10,
  text: {
    text: 'Hello World!',
    color: 'black',
    font: '32px Arial',
    align: {x: 0.5, y: 0.5}
  },
});

let str: string = button.text;
let padX: number = button.padX;
let padY: number = button.padY;
let text: kontra.Text = button.textNode;
let disabled: boolean = button.disabled;
let focused: boolean = button.focused;
let hovered: boolean = button.hovered;
let pressed: boolean = button.pressed;

button.enable();
button.disable();
button.focus();
button.blur();
button.destroy();
button.onEnable();
button.onDisable();
button.onFocus();
button.onBlur();

// inheritance
button.x += 20;
button.rotation = Math.PI;
button.advance();
button.render();

// options
kontra.Button({
  x: 10,
  y: 20,
  text: {
    text: 'Hello World!',
    color: 'black',
    font: '32px Arial',
    textAlign: 'right',
    width: 200
  },
  onEnable() {},
  onDisable() {},
  onFocus() {},
  onBlur() {},
  onUp() {}
});

// extends
class CustomButton extends kontra.ButtonClass {}
let myButton = new CustomButton();
myButton.enable();