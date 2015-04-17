My custom game library based on years of game development.

## Goals

- **lightweight**: under 50K minified (even before you pick and choose)
- **modular**: pick and choose what you want to use. no inter-dependencies
- **feature library**: don't implement everything. do the basics and some high level features, but leave most the grunt work to other frameworks/libraries
- **extensible**: everything should allow the developer to customize and add
- **fast**: all design decisions should work towards the goal of FPS of 60FPS. remove all logic from render loops and move to setup functions
- **memory conscious**: take up as little memory footprint as needed

## Use it when

- you want to get something up and running fairly quickly
- you want a basic structure that is easy to scale and extend
- in conjunction with other micro-libraries (like Playground.js)
- to prototype

## Features

### Basic
- [ ] game loop
    - [ ] update and render callbacks
- [ ] assets
    - [ ] image
    - [ ] audio
    - [ ] data/json
- [ ] input
    - [ ] keyboard
    - [ ] mouse
    - [ ] gamepad
    - [ ] touch
- [ ] canvas
    - [ ] centering
    - [ ] scaling
- [ ] localstorage wrapper
- [ ] object pool
- [ ] quadtree
- [ ] spritesheet
- [ ] tile engine
