/**

Kontra.js is a lightweight JavaScript gaming micro-library created specifically for the [Js13kGames](http://js13kgames.com/) game jam.

<canvas width="600" height="225" id="snake-game" tabindex="0"></canvas>
<script src="js/snake.js"></script>

The goal of Kontra.js is not to implement everything you could possibly need to make a game. There are already libraries out there that do that (like [Phaser](http://phaser.io/) or [Jaws](http://jawsjs.com/)).

Instead, Kontra.js aims to implement basic game requirements like asset loading, input, the game loop, and spites to keep the library very small and focused. This allows it to be used when your game size is limited (a la Js13k).

Kontra.js does provide some more advance data structures like object pools and quadtrees that have been fine tuned to be small, fast, and memory efficient.

Kontra.js prides itself in being:

- **Lightweight**: 14.4 kB minified (5.21 kB gzipped) for the entire library. The basic bundle is 3 kB minified (1.3 kB gzipped).
- **Modular**: pick and choose what you want when you import. No inter-dependencies.
- **Extensible**: everything is customizable and can be extended.
- **Fast**: all logic has been removed from the update and render cycles.
- **Memory conscious**: takes up as little memory as needed and tries not to be wasteful about the memory it does take up.

## Use it When

- You want to get something up and running fairly quickly.
- You want a basic structure that is easy to scale and extend.s
- In conjunction with other libraries (like [Playground.js](http://playgroundjs.com/)).
- Prototyping.
- Game jams.

## Ready to Get Going?

- Read the [getting started guide](getting-started) and some [tutorials](tutorials).
- Look at [games made with Kontra.js](made-with-kontra).
- Gain in-depth knowledge from the API docs.

@section What is Kontra.js
@page index

 */