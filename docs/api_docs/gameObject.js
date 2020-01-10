/**
 * A GameObject is just a base class and typically isn't used directly. Instead, it's main purpose is to be extended by other classes, such as [Sprite](/api/sprite).
 *
 * To extend the GameObject class, use the `.class` property of the constructor (since the GameObject is a factory function). You should also override the `_dc()` function in your class.
 *
 * The `_dc()` function determines how to draw the GameObject. It is called by the `render` function and is passed the final x and y position of the object after transforms and rotations have been applied.
 *
 * @sectionName Extending A GameObject
 * @example
 * // exclude-code:start
 * let { GameObject } = kontra;
 * // exclude-code:end
 * // exclude-script:start
 * import { GameObject } from 'kontra';
 * // exclude-script:end
 *
 * class Triangle extends GameObject.class {
 *   constructor(properties) {
 *     super(properties);
 *   }
 *
 *   _dc(x, y) {
 *     this.context.fillStyle = this.color;
 *     this.context.beginPath();
 *     this.context.moveTo(x, y);
 *     this.context.lineTo(x + this.width, y);
 *     this.context.lineTo(x + this.width / 2, y + this.height);
 *     this.context.fill();
 *   }
 * }
 *
 * let triangle = new Triangle({
 *   x: 300,
 *   y: 100,
 *   width: 30,
 *   height: 40,
 *   anchor: {x: 0.5, y: 0.5},
 *   color: 'red'
 * });
 * // exclude-code:start
 * triangle.context = context;
 * // exclude-code:end
 * triangle.render();
 */