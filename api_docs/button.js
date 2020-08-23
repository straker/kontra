/**
 * A button is essentially a [Sprite](/api/sprite) with a [Text](/api/text) child and added functionality to support keyboard interaction. To create a button, pass properties as you would with a Sprite and use the `text` property to pass any Text properties. You can also pass any [pointer](/api/pointer) event functions.
 *
 * The size of the button will automatically be set as the width and height of the text or image, whichever is greater.
 *
 * _Button image courtesy of [Kenney](https://kenney.nl/assets)._
 *
 * @sectionName Basic Use
 * @example
 * // exclude-code:start
 * let { initPointer, setImagePath, load, imageAssets, Button } = kontra;
 * initPointer(context.canvas);
 * // exclude-code:end
 * // exclude-script:start
 * import { initPointer, setImagePath, load, imageAssets, Button } from 'kontra';
 * // exclude-script:end
 *
 * // exclude-script:start
 *
 * // must call this to have pointer events work
 * initPointer();
 * // exclude-script:end
 *
 * setImagePath('assets/imgs/');
 * load('blue_button02.png', 'blue_button03.png').then(() => {
 *   let button = Button({
 *     // sprite properties
 *     x: 300,
 *     y: 100,
 *     anchor: {x: 0.5, y: 0.5},
 *     image: imageAssets['blue_button02'],
 *     // exclude-code:start
 *     context: context,
 *     // exclude-code:end
 *
 *     // text properties
 *     text: {
 *       text: 'Click me',
 *       color: 'white',
 *       font: '20px Arial, sans-serif',
 *       anchor: {x: 0.5, y: 0.5}
 *     },
 *
 *     // pointer events
 *     onDown() {
 *       this.image = imageAssets['blue_button03'];
 *       this.y += 5;
 *     },
 *     onUp() {
 *       this.image = imageAssets['blue_button02']
 *       this.y -= 5;
 *     }
 *   });
 *
 *   // create a game loop to show updates to the button
 *   let loop = kontra.GameLoop({
 *     // exclude-code:start
 *     context: context,
 *     // exclude-code:end
 *     render() {
 *       button.render();
 *     }
 *   });
 *
 *   // start the loop
 *   loop.start();
 * });
 */

/**
 * A button has four possible states. You should use these states in the [render()](/api/gameObject#render) to have the button draw differently based on user input.
 *
 * - `focused` - The button is focused by the keyboard or by calling the [focus](/api/button#focus) function.
 * - `hovered` - The button is hovered by the mouse or by calling the [onOver](/api/button#onOver) function.
 * - `pressed` - The button is pressed with a mouse, touch, or keyboard event (such as <kbd>Enter</kbd> or <kbd>Spacebar</kbd> keys) or by calling the [onDown](/api/button#onDown) function.
 * - `disabled` - The button no longer accepts mouse or keyboard events.
 *
 * @sectionName Button States
 * @example
 * // exclude-code:start
 * let { initPointer, load, Button } = kontra;
 * initPointer(context.canvas);
 * // exclude-code:end
 * // exclude-script:start
 * import { initPointer, load, Button } from 'kontra';
 * // exclude-script:end
 *
 * // exclude-script:start
 *
 * // must call this to have pointer events work
 * initPointer();
 * // exclude-script:end
 *
 * let button = Button({
 *   // sprite properties
 *   x: 300,
 *   y: 100,
 *   anchor: {x: 0.5, y: 0.5},
 *   // exclude-code:start
 *   context: context,
 *   // exclude-code:end
 *
 *   // text properties
 *   text: {
 *     text: 'Interact with me',
 *     color: 'white',
 *     font: '20px Arial, sans-serif',
 *     anchor: {x: 0.5, y: 0.5}
 *   },
 *
 *   // button properties
 *   padX: 20,
 *   padY: 10,
 *
 *  render() {
 *     // focused by keyboard
 *     if (this.focused) {
 *       this.context.setLineDash([8,10]);
 *       this.context.lineWidth = 3;
 *       this.context.strokeStyle = 'red';
 *       this.context.strokeRect(0, 0, this.width, this.height);
 *     }
 *
 *     // pressed by mouse, touch, or enter/space on keyboard
 *     if (this.pressed) {
 *       this.textNode.color = 'yellow';
 *     }
 *     // hovered by mouse
 *     else if (this.hovered) {
 *       this.textNode.color = 'red';
 *       canvas.style.cursor = 'pointer';
 *     }
 *     else  {
 *       this.textNode.color = 'white';
 *       canvas.style.cursor = 'initial';
 *     }
 *   }
 * });
 *
 * // create a game loop to show updates to the button
 * let loop = kontra.GameLoop({
 *   // exclude-code:start
 *   context: context,
 *   // exclude-code:end
 *   render() {
 *     button.render();
 *   }
 * });
 *
 * // start the loop
 * loop.start();
 */

/**
 * To be accessible to screen readers and keyboard users, the Button creates an HTMLButtonElement and appends it to the DOM. The button is given styles to be [visually hidden](https://www.scottohara.me/blog/2017/04/14/inclusively-hidden.html) and syncs keyboard events between the button element and Button functions. For example, calling `focus()` on the Button will also focus the button element, and vis versa.
 *
 * The button element is not ordered in the DOM, so if you need to create multiple buttons and want them to be in tab order, you'll need to create the buttons in the order they should be in (so their DOM nodes are appended in that order).
 *
 * @sectionName Accessibility
 */