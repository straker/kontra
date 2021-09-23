/**

By default, the `kontra` export is the entire library. This means that by default Kontra is a bit large. However, Kontra has been written using ES Modules which means you can use a module bundler such as [Rollup](https://rollupjs.org/) or [webpack](https://webpack.js.org/) to take advantage of [tree-shaking](https://rollupjs.org/guide/en#tree-shaking). This will reduce the file size by only bundling the code you need.

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

Kontra supports even more granular control over the file size if tree shaking is not enough. If you're looking to remove unused parts of the Sprite class, such as `rotation` or `anchor`, you can use [rollup-plugin-kontra](https://github.com/straker/rollup-plugin-kontra) to remove entire parts of the Sprite codebase. Just pass the functionality you want enabled and rollup-plugin-kontra will remove the rest.

__Note:__ All options default to `false` when using rollup-plugin-kontra, so only pass the options you wish to enable. Passing no options will result in a Sprite with just `position`, `width,` `height`, and `color`.

__Also Note:__ Some of the more advance classes – such as Button, Scene, and Grid – require some of the gameObject functionality to work properly. If you are using those, you will need to enable the `group` feature or they will not work.

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
*       gameObject: {
*         // enable only velocity and rotation functionality
*         velocity: true,
*         rotation: true
*       },
*       vector: {
*         // enable vector length functionality
*         length: true
*       },
*       // turn on debugging
*       debug: true
*     })
*   ]
* }
* ```

### Available Options

Options are passed by nesting the option with the parent source. For example, to enable the `image` functionality of a sprite, you would pass `sprite: { image: true }`.

#### `gameObject` Options:

| Name            | Functionality Enabled |
| --------------- | ------------- |
| `acceleration`  | `acceleration`, `ddx`, `ddy` |
| `anchor`        | `anchor` |
| `camera`        | `sx`, `sy` |
| `group`         | `children`, `parent`, `addChild`, `removeChild` |
| `opacity`       | `opacity` |
| `rotation`      | `rotation` |
| `scale`         | `scale`, `setScale()` |
| `ttl`           | `ttl`, `isAlive` |
| `velocity`      | `velocity`, `dx`, `dy` |

#### `sprite` Options:

| Name          | Functionality Enabled |
| ------------- | ------------- |
| `animation`   | `animations`, `playAnimation` |
| `image`       | `image` |

#### `text` Options:

| Name          | Functionality Enabled |
| ------------- | ------------- |
| `autoNewline` | Setting a fixed with that automatically adds new lines to the text |
| `newline`     | Support for new line characters (`\n`) in the text |
| `rtl`         | Support for RTL languages |
| `textAlign`   | `textAlign` |

#### `vector` Options:

| Name          | Functionality Enabled |
| ------------- | ------------- |
| `angle`       | `angle()` (also enables `length` and `dot`) |
| `clamp`       | `clamp()` |
| `distance`    | `distance()` |
| `dot`         | `dot()` |
| `length`      | `length()` |
| `normalize`   | `normalize()` (also enables `length`) |
| `scale`       | `scale()` |
| `subtract`    | `subract()` |

#### General Options:

General options do not have a parent source and are passed as siblings to the other source options. For example, to enable debugging you would just pass `debug: true`.

| Name          | Functionality Enabled |
| ------------- | ------------- |
| `debug`       | Turn on debugging information |

@section Reducing File Size
@page reducing-file-size
*/
