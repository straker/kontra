[![GitHub version](https://badge.fury.io/gh/straker%2Fkontra.svg)](https://badge.fury.io/gh/straker%2Fkontra)
[![Build Status](https://travis-ci.org/straker/kontra.svg?branch=master)](https://travis-ci.org/straker/kontra)
[![Coverage Status](https://coveralls.io/repos/straker/kontra/badge.svg?branch=master&service=github)](https://coveralls.io/github/straker/kontra?branch=master)

# Kontra.js

<p>The goal of Kontra.js is not to implement everything you could possibly need to make a game. There are already libraries out there that do that (like <a href="http://phaser.io/">Phaser</a> or <a href="http://jawsjs.com/">Jaws</a>).</p>

<p>Instead, Kontra.js aims to implement basic game requirements like asset loading, keyboard input, the game loop, and sprites to keep the library very small and focused. This allows it to be used when your game size is limited (a la Js13k).</p>

<p>Kontra.js does provide some more advance data structures like object pools and quadtrees that have been fine tuned to be small, fast, and memory efficient.</p>

<p>Kontra.js prides itself in being:</p>

<ul>
  <li><strong>lightweight</strong>: 12.5 kB minified (4.9 kB gzipped) for the entire library. The basic bundle is 3 kB minified (1.3 kB gzipped).</li>
  <li><strong>modular</strong>: pick and choose what modules you want when you <a href="https://straker.github.io/kontra/download">download</a>. No inter-dependencies.</li>
  <li><strong>extensible</strong>: everything is customizable and can be extended.</li>
  <li><strong>fast</strong>: all logic has been removed from the update and render cycles.</li>
  <li><strong>memory conscious</strong>: takes up as little memory as needed and tries not to be wasteful about the memory it does take up.</li>
</ul>

<h2>Use it When</h2>

<ul>
  <li>you want to get something up and running fairly quickly.</li>
  <li>you want a basic structure that is easy to scale and extend.</li>
  <li>in conjunction with other libraries (like <a href="http://playgroundjs.com/">Playground.js</a>).</li>
  <li>prototyping.</li>
  <li>game jams.</li>
</ul>

## Documentation

All the documentation can be found on the [github page](https://straker.github.io/kontra/).

## Community tutorials

- [js13kGames Video Tutorial Series by Zenva](https://gamedevacademy.org/js13kgames-tutorial-video-series/)

## Games made with Kontra

- [A Day In The Life](http://js13kgames.com/entries/a-day-in-the-life) by [Mattia Fortunati](https://twitter.com/MattiaFortunati)
