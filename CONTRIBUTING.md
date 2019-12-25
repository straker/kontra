# Contributing

By participating in this project you agree to abide by the terms in the [Contributor Code of Conduct](CODE_OF_CONDUCT.md). 

## Goal

The goal of Kontra is not to implement everything you could possibly need to make a game. There are already libraries out there that do that (like [Phaser](http://phaser.io/)).

Instead, Kontra aims to implement basic game requirements like asset loading, input, the game loop, and spites to keep the library very small and focused. This allows it to be used when your game size is limited (like the [js13k games competition](https://js13kgames.com/)).

### Features Kontra Won't Support

Below is a list of features the library will not support or add:

- Physics engine
- Math helpers

## Code Style

To help keep the code small the library follows some unconventional code patterns. Take a look at these [byte-saving techniques](https://github.com/jed/140bytes/wiki/Byte-saving-techniques) and follow these recommendations:

- Use `==` over `===` (save a byte)
- Use `| 0` over `Math.floor()`

## Building

To build the development code, run `npm run build`. To build the distribution version of the code, run `npm run dist`. Both should be built before submitting a pull request.

## Testing

Please add unit and/or integration tests for all new changes. To run the tests, run `npm test`.

## Documentation and TypeScript Declaration File

The [documentation](/docs) and the [TypeScript declaration file](kontra.d.ts) is built from the JSDoc-like comments in the source files using [LivingCSS](https://github.com/straker/livingcss) (I know, not what it was intended for but it makes it really easy to build multiple pages of docs. And it's highly configurable). To update the documentation or the declaration file, just modify the JSDoc-like comments.

The comments are not true JSDoc syntax, but a modified version that supports both JSDoc tags and TypeSript declarations. For example, a comment for an object will be declared using TypeSript for the JSDoc type.

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

The docs and declaration file are built along with the development version of the code, so running `npm run build` will build the docs as well. This ensures they stay in sync with any changes to the code.

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

