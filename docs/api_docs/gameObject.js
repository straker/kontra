/**
 * A GameObject is just a base class and typically isn't used directly. Instead, it's main purpose is to be extended by other classes, such as [Sprite](/api/sprite).
 *
 * To extend the GameObject class, use the `.class` property of the constructor (since the GameObject is a factory function).
 *
 * You should also override the `draw()` function instead of the `render()` function in your class. The `draw()` function determines how to draw the GameObject. It is called by the `render` function after transforms and rotations have been applied.
 *
 * Do note that the canvas has been rotated and translated to the objects position (taking into account anchor), so {0,0} will be the top-left corner of the game object when drawing.
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
 *   draw() {
 *     this.context.fillStyle = this.color;
 *     this.context.beginPath();
 *     this.context.moveTo(0, 0);
 *     this.context.lineTo(this.width, 0);
 *     this.context.lineTo(this.width / 2, this.height);
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