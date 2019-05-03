/**

Download the latest version of Kontra.

## Source Code

- [Production version](https://raw.githubusercontent.com/straker/kontra/master/kontra.min.js)
- [Development version](https://raw.githubusercontent.com/straker/kontra/master/kontra.js)
- [TGZ file](https://registry.npmjs.org/kontra/-/kontra-{{ packageVersion }}.tgz)
- [Github repo](https://github.com/straker/kontra)

## Package mangers

- `$ npm install kontra`
- `$ yarn add kontra`

## CDN

```js
<script src="https://cdn.jsdelivr.net/npm/kontra@{{ packageVersion }}/kontra.min.js"></script>
```
```js
<script src="https://cdn.jsdelivr.net/npm/kontra@{{ packageVersion }}/kontra.js"></script>
```

## Custom Builds

As of kontra 6.0.0, custom builds can be achieved by using a module bundler such as [Rollup](https://rollupjs.org/) or [webpack](https://webpack.js.org/). Kontra supports ES modules, allowing you to use [tree-shaking](https://rollupjs.org/guide/en#tree-shaking) to only bundle the code you need.

* ```js
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

@section Download
@page download
@packageVersion

*/