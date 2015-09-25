[![GitHub version](https://badge.fury.io/gh/straker%2Fkontra.svg)](http://badge.fury.io/gh/straker%2Fkontra)
[![Build Status](https://travis-ci.org/straker/kontra.svg?branch=master)](https://travis-ci.org/straker/kontra)
[![Coverage Status](https://coveralls.io/repos/straker/kontra/badge.svg?branch=master&service=github)](https://coveralls.io/github/straker/kontra?branch=master)

# Kontra.js

Kontra.js is a lightweight JavaScript gaming mirco-framework. 

The goal of Kontra.js is not to implement everything you could possibly need to make a game. There are already libraries out there that do that (like [Phaser](http://phaser.io/) or [Jaws](http://jawsjs.com/)).

Instead, Kontra.js aims to implement basic game requirements like asset loading, keyboard input, the game loop, and spites to keep the library very small and focused, leaving the grunt work to either other libraries or the developer.

Kontra.js does provide some more advance data structures like object pools and quadtrees that have been fine tuned to be fast and memory efficient. 

Kontra.js prides itself in being:

- **lightweight**: under 25K minified.
- **modular**: pick and choose what modules you want to use using `gulp build`. very few inter-dependencies.
- **extensible**: everything is customizable and can be extended.
- **fast**: all logic has been removed from the update and render cycles.
- **memory conscious**: takes up as little memory as needed and tries not to be wasteful about the memory it does take up.

## Use it when

- you want to get something up and running fairly quickly
- you want a basic structure that is easy to scale and extend
- in conjunction with other libraries (like [Playground.js](http://playgroundjs.com/))
- prototyping


## Documentation

All the documentation can be found in the [wiki](https://github.com/straker/kontra/wiki).
