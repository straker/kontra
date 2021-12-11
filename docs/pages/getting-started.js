/**

Kontra is written for modern ES6 capable browsers. If you need to run it in an ES5 browser, you will have to [transpile](https://babeljs.io/) and polyfill needed ES6 features (Assets requires `WeakMap` and `Promise`, Quadtree requires `Set`).

## Download

- Global object [production](https://unpkg.com/kontra@latest/kontra.min.js) and [development](https://unpkg.com/kontra@latest/kontra.js) versions
- ES module [production](https://unpkg.com/kontra@latest/kontra.min.mjs) and [development](https://unpkg.com/kontra@latest/kontra.mjs) versions
- `npm install kontra`
- `yarn add kontra`

## Load

There are a few different ways to load the library depending on how you are going to use it.

### Global Object

Load the library by adding it as a script tag. This will add a global `kontra` object to the page with all Kontra functions and properties.

```html
<script src="path/to/kontra.js"></script>
```

### ES Module Import

Kontra also supports ES modules and exports all API functions, allowing you to import it into your code as well. Import the file `kontra.mjs` and either use the entire `kontra` object or just import the functions you need.

```js
// exclude-tablist
import kontra from 'path/to/kontra.mjs';
```

### Module Bundler

If you're using a module bundler that supports npm dependency resolution (such as Webpack or Parcel), you can import the library directly from the module name. This is the recommended way to create [custom builds](download) of the library.

```js
// exclude-tablist
import kontra from 'kontra';
```

### Web Maker

Want to get started without all the hassle? [Web Maker](https://webmakerapp.com/) has you covered! When you start a new project, select the Kontra Game Engine from the list of predefined templates and you're good to go. Learn more by reading the [Web Maker and JS13k tutorial](https://medium.com/web-maker/js13kgames-jam-with-web-maker-a3389cf2cbb).

## Initialize

Initialize the game by calling [init()](api/core.html#init) to create the drawing context. By default, it will use the first canvas element on the page, but you can also pass it the ID of the canvas or a Canvas element.

The `init()` function returns the canvas and context used for the game.

```js
import { init } from 'kontra';

let { canvas, context } = init();
```

## Create

After the game is initialize, you can create a simple [Sprite](api/sprite.html) and [Game Loop](api/gameLoop.html) in just a few lines of code

@example
* // exclude-code:start
* let { init, Sprite, GameLoop } = kontra;
* // exclude-code:end
* // exclude-script:start
* import { init, Sprite, GameLoop } from 'kontra';
*
* let { canvas } = init();
* // exclude-script:end
*
* let sprite = Sprite({
*   x: 100,        // starting x,y position of the sprite
*   y: 80,
*   color: 'red',  // fill color of the sprite rectangle
*   width: 20,     // width and height of the sprite rectangle
*   height: 40,
*   dx: 2          // move the sprite 2px to the right every frame
* });
*
* let loop = GameLoop({  // create the main game loop
*   update: function() { // update the game state
*     sprite.update();
*
*     // wrap the sprites position when it reaches
*     // the edge of the screen
*     if (sprite.x > canvas.width) {
*       sprite.x = -sprite.width;
*     }
*   },
*   render: function() { // render the game state
*     sprite.render();
*   }
* });
*
* loop.start();    // start the game

@section Getting Started
@page getting-started
*/
