/**
 * In its most basic form, a sprite is a rectangle with a fill color. To create a rectangle sprite, pass the arguments `width`, `height`, and `color`. A rectangle sprite is great for initial prototyping and particles.
 *
 * @sectionName Rectangle Sprite
 * @example
 * // exclude-code:start
 * let { Sprite } = kontra;
 * // exclude-code:end
 * // exclude-script:start
 * import { Sprite } from 'kontra';
 * // exclude-script:end
 *
 * let sprite = Sprite({
 *   x: 300,
 *   y: 100,
 *   anchor: {x: 0.5, y: 0.5},
 *
 *   // required for a rectangle sprite
 *   width: 20,
 *   height: 40,
 *   color: 'red'
 * });
 * // exclude-code:start
 * sprite.context = context;
 * // exclude-code:end
 *
 * sprite.render();
 */

/**
 * A sprite can use an image instead of drawing a rectangle. To create an image sprite, pass the `image` argument. The size of the sprite will automatically be set as the width and height of the image.
 *
 * @sectionName Image Sprite
 * @example
 * // exclude-code:start
 * let { Sprite } = kontra;
 * // exclude-code:end
 * // exclude-script:start
 * import { Sprite } from 'kontra';
 * // exclude-script:end
 *
 * let image = new Image();
 * image.src = 'assets/imgs/character.png';
 * image.onload = function() {
 *   let sprite = Sprite({
 *     x: 300,
 *     y: 100,
 *     anchor: {x: 0.5, y: 0.5},
 *
 *     // required for an image sprite
 *     image: image
 *   });
 *   // exclude-code:start
 *   sprite.context = context;
 *   // exclude-code:end
 *
 *   sprite.render();
 * };
 */

/**
 * A sprite can use a spritesheet animation as well. To create an animation sprite, pass the `animations` argument. The size of the sprite will automatically be set as the width and height of a frame of the spritesheet.
 *
 * A sprite can have multiple named animations. The easiest way to create animations is to use kontra.SpriteSheet. All animations will automatically be [cloned](animation#clone) so no two sprites update the same animation.
 *
 * @sectionName Animation Sprite
 * @example
 * // exclude-code:start
 * let { Sprite, SpriteSheet, GameLoop } = kontra;
 * // exclude-code:end
 * // exclude-script:start
 * import { Sprite, SpriteSheet, GameLoop } from 'kontra';
 * // exclude-script:end
 *
 * let image = new Image();
 * image.src = 'assets/imgs/character_walk_sheet.png';
 * image.onload = function() {
 *
 *   // use spriteSheet to create animations from an image
 *   let spriteSheet = SpriteSheet({
 *     image: image,
 *     frameWidth: 72,
 *     frameHeight: 97,
 *     animations: {
 *       // create a named animation: walk
 *       walk: {
 *         frames: '0..9',  // frames 0 through 9
 *         frameRate: 30
 *       }
 *     }
 *   });
 *
 *   let sprite = Sprite({
 *     x: 300,
 *     y: 100,
 *     anchor: {x: 0.5, y: 0.5},
 *
 *     // required for an animation sprite
 *     animations: spriteSheet.animations
 *   });
 *   // exclude-code:start
 *   sprite.context = context;
 *   // exclude-code:end
 *
 *   // use kontra.gameLoop to play the animation
 *   let loop = GameLoop({
 *   // exclude-code:start
 *   clearCanvas: false,
 *   // exclude-code:end
 *     update: function(dt) {
 *       sprite.update();
 *     },
 *     render: function() {
 *       // exclude-code:start
 *       context.clearRect(0,0,context.canvas.width,context.canvas.height);
 *       // exclude-code:end
 *       sprite.render();
 *     }
 *   });
 *
 *   loop.start();
 * };
 */

/**
 * If you need to draw a different shape, such as a circle, you can pass in custom properties and a render function to handle drawing the sprite.
 *
 * @sectionName Custom Properties
 * @example
 * // exclude-code:start
 * let { Sprite } = kontra;
 * // exclude-code:end
 * // exclude-script:start
 * import { Sprite } from 'kontra';
 * // exclude-script:end
 *
 * let sprite = Sprite({
 *   x: 300,
 *   y: 100,
 *
 *   color: 'red',
 *
 *   // custom properties
 *   radius: 20,
 *
 *   render: function() {
 *     this.context.fillStyle = this.color;
 *
 *     this.context.beginPath();
 *     this.context.arc(this.x, this.y, this.radius, 0, 2  * Math.PI);
 *     this.context.fill();
 *   }
 * });
 * // exclude-code:start
 * sprite.context = context;
 * // exclude-code:end
 *
 * sprite.render();
 */

/**
 * If you want to extend a Sprite, you can do so by extending the Sprite class. The one caveat is that `Sprite` is not the Sprite class, but actually is a factory function.
 *
 * To extend the Sprite class, use the `.class` property of the constructor.
 *
 * ```js
 * import { Sprite } from 'kontra';
 *
 * class CustomSprite extends Sprite.class {
 *   // ...
 * }
 * ```
 * @sectionName Extending a Sprite
 */