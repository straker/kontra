# Contributing

By participating in this project you agree to abide by the terms in the [Contributor Code of Conduct](CODE_OF_CONDUCT.md). 

## Goal

The goal of Kontra is not to implement everything you could possibly need to make a game. There are already libraries out there that do that (like [Phaser](http://phaser.io/)).

Instead, Kontra aims to implement basic game requirements like asset loading, input, the game loop, and spites to keep the library very small and focused. This allows it to be used when your game size is limited (like the [js13k games competition](https://js13kgames.com/)).

### Features Kontra Won't Support

Below is a list of features the library will not support or add:

- Physics engine
- Math helpers
- Linear transformations

## Code Style

To help keep the code small the library follows some unconventional code patterns. Take a look at these [byte-saving techniques](https://github.com/jed/140bytes/wiki/Byte-saving-techniques) and follow these recommendations:

- Prefer `==` over `===` (save a byte)
- Prefer `!=` over `==` (save a byte)
- Prefer `| 0` over `Math.floor()`
- Prefer `let` over `const`  (save a byte)
- Prefer `Array.map()` over `Array.forEach()`

The library uses [eslint](.eslintrc.js) to help enforce these codes styles. To run eslint, run `npm run eslint`.

## Building

To build the development code, run `npm run build`. To build the distribution version of the code, run `npm run dist`.

## Testing

Please add unit and/or integration tests for all new changes, as well as TypeScript tests found in [test/typings](test/typings). To run the tests, run `npm test`. To run the TypeScript tests, run `npm run test:ts`.

The TypeScript tests just ensure that the TypeScript declaration file is correct and doesn't miss any obvious use cases with the various APIs.

Some unit test files contain a `testContext` object which allows the suite to run tests conditionally when features are turned on or removed. When changing code in these types of suites, please pay attention to if the test should only run when a feature is enabled or removed.

## Exports

Please update the export files for all new changes (if need be). [kontra.defaults.js](src/kontra.defaults.js) imports all functionality and then adds it to the `kontra` object. [kontra.js](src/kontra.js) exports all functionality directly. You will also need to add tests to their respected spec files to ensure the functionality is exported.

## Documentation and TypeScript Declaration File

The [documentation](/docs) and the [TypeScript declaration file](kontra.d.ts) are built from the JSDoc-like comments in the source files using [LivingCSS](https://github.com/straker/livingcss) (I know, not what it was intended for but it makes it really easy to build multiple pages of docs. And it's highly configurable). Both are built when running `npm run build`.

To update the documentation or the declaration file, just modify the JSDoc-like comments. The comments are not true JSDoc syntax, but a modified version that supports both JSDoc tags and TypeSript declarations. For example, a comment for an object will be declared using TypeSript for the JSDoc type.

```js
/**
 * @param {{x: number, y: number}} [properties.anchor={x:0,y:0}] - The x and y origin of the game object. {x:0, y:0} is the top left corner of the game object, {x:1, y:1} is the bottom right corner.
 */
```

The documentation will automatically read the TypeScript type and say it's an Object, while the declaration file will take the type directly.

```html
<!-- docs -->
<dt>
    <code>properties.anchor</code>
    <span class="optional">Optional</span>
</dt>
<dd>
    <p>Object. The x and y origin of the game object. {x:0, y:0} is the top left corner of the game object, {x:1, y:1} is the bottomright corner. Defaults to <code>{x:0,y:0}</code>.
    </p>
</dd>
```

```ts
// kontra.d.ts
interface GameObject{
    anchor: {x: number, y: number};
}
```

All documentation related gulp tasks and `@tag` information can be found in [tasks/doc.js](tasks/docs.js). All TypeScript related gulp tasks and `@tag` information can be found in [tasks/typescript.js](tasks/typescript.js).

### TypeScript Code Style

Use uppercase for the first letter of each basic type: `Number`, `Boolean`, `String`, `Object`, `Function`.

If the type is a `Function` and takes no arguments and doesn't return anything, use `Function`. Otherwise declare the arguments and return using the syntax `(params: Type) => ReturnType`. 

```js
/** 
 * @param {(dt?: Number) => void} update - Function called every frame to update the game. Is passed the fixed `dt` as a parameter.
 * @param {Function} render - Function called every frame to render the game. 
 */
```

If the type is an Object and can take any number of properties, use `Object`. Otherwise declare the properties of the object using the syntax `{key: Type}`.

```js
/**
 * @param {Object} [properties] - Properties of the quadtree.
 * @param {{x: Number, y: Number, width: Number, height: Number}} [properties.bounds] - The 2D space (x, y, width, height) the quadtree occupies. Defaults to the entire canvas width and height.
 */
```

