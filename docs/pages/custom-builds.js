/**

As of kontra 6.0.0, custom builds can be achieved by using a module bundler such as [Rollup](https://rollupjs.org/) or [webpack](https://webpack.js.org/). Kontra supports ES modules, allowing you to use [tree-shaking](https://rollupjs.org/guide/en#tree-shaking) to only bundle the code you need.

* ```js
* // exclude-tablist
* // game.js
* import { Sprite, GameLoop } from 'kontra';
*
* let sprite = Sprite({
*   x: 100,
*   y: 100,
*   dx: 2,
*   width: 20,
*   height: 40,
*   color: 'red'
* });
*
* let loop = GameLoop({
*   update() {
*     sprite.update();
*   },
*   render() {
*     sprite.render();
*   }
* });
*
* loop.start();
* ```

```bash
$ rollup game.js --format iife --file game.bundle.js
```

## Rollup-plugin-kontra

Kontra supports even more granular control over the output. If you're looking to remove unused parts of the Sprite class, such as `rotation` or `anchor`, you can use [rollup-plugin-kontra](https://github.com/straker/rollup-plugin-kontra) to remove entire parts of the Sprite codebase. Just pass the functionality you want enabled and rollup-plugin-kontra will remove the rest.

__Note:__ All options default to `false` when using rollup-plugin-kontra, so only pass the options you wish to enable. Passing no options will result in a Sprite with just `position`, `width,` and `height`.

* ```js
* // exclude-tablist
* // rollup.config.js
* import kontra from 'rollup-plugin-kontra'
*
* export default {
*   entry: 'entry.js',
*   dest: 'bundle.js',
*   plugins: [
*     kontra({
*       sprite: {
*         // enable only velocity and rotation functionality
*         velocity: true,
*         rotation: true
*       }
*     })
*   ]
* }
* ```

### Available options

Sprite options:

| Name          | Functionality Enabled |
| ------------- | ------------- |
| velocity      | `velocity`, `dx`, `dy` |
| acceleration  | `acceleration`, `ddx`, `ddy` |
| rotation      | `rotation` |
| ttl           | `ttl`, `isAlive` |
| anchor        | `anchor` |
| camera        | `sx`, `sy`, `viewX`, `viewY` |
| image         | `image`, flip image using negative width |
| animation     | `animations`, `playAnimation`, flip image using negative width |

@section Custom Builds
@page custom-builds
*/