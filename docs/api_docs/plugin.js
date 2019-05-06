/**
 * A plugin is an object that defines a set of intercept functions that should be run before or after a Kontra objects functions. These functions allow you to modify the code or change the behavior of the intercepted functions.
 *
 * An intercept function is named the same name as the function it will intercept. The function name is also prefixed with `before` to have the function run before the intercepted function, or `after` to run after the intercepted function.
 *
 * For example, if you wish to add a function to run after a Sprites `collidesWidth()` function, the name of the intercept function would be `afterCollidesWidth` (note the capitalization of the `collidesWidth` function name). `beforeCollidesWidth` would run before the Sprites `collidesWidth()` function.
 *
 * A plugin can define any number of before and after intercept functions. When the plugin is registered for a Kontra object, only intercept functions that match a function name in the Kontra object will be intercepted.
 *
 * As the plugin author, you should not [register](#registerPlugin) the plugin yourself. You should only export the plugin object and let the consumer register it.
 *
 * ```js
 * // pluginCode.js
 * const loggingPlugin = {
 *   afterCollidesWith(sprite, result, object) {
 *     console.log('collision between sprites!');
 *   }
 * };
 * export default loggingPlugin;
 * ```
 *
 * ```js
 * // consumerCode.js
 * import { registerPlugin, Sprite } from 'kontra';
 * import loggingPlugin from pluginCode.js;
 *
 * // have the plugin run for all Sprites
 * registerPlugin(Sprite, loggingPlugin);
 *
 * let sprite1 = Sprite({
 *   x: 10,
 *   y: 20,
 *   width: 10,
 *   height: 10
 * });
 *
 * let sprite2 = Sprite({
 *   x: 15,
 *   y: 20,
 *   width: 10,
 *   height: 10
 * });
 *
 * sprite1.collidesWith(sprite2);  //=> 'collision between sprites!'; true
 * ```
 * @sectionName How to Create a Plugin
 */

/**
 * A before intercept function can be used to modify or change the arguments that will be passed to the intercepted function.
 *
 * The function will be passed the `this` context of the intercepted object as well as all arguments of the original call. The function should either return an Array of the arguments if modifying them or return `null` or nothing if not modifying the arguments.
 *
 * ```js
 * class MyObj {
 *   add(a, b) {
 *     return a + b;
 *   }
 * }
 *
 * // create a plugin that doubles the arguments before passing
 * // them to the original add function
 * registerPlugin(MyObj, {
 *   beforeAdd(context, a, b) {
 *     return [a * 2, b * 2];
 *   }
 * });
 *
 * const obj = new MyObj();
 * obj.add(1, 2);  //=> 6
 * ```
 *
 * Multiple before intercept functions can be registered for the same function. All functions will be run in the order they were registered. The functions return value will be passed to the next function. If the function doesn't modify the arguments (returned `null` or nothing) then the functions parameters will be passed to the next function instead.
 *
 * ```js
 * class MyObj {
 *   add(a, b) {
 *     return a + b;
 *   }
 * }
 *
 * // log the arguments of the call and pass them unchanged to
 * // the next plugin
 * registerPlugin(MyObj, {
 *   beforeAdd(context, a, b) {
 *     console.log(`add passed: ${a}, ${b}`);
 *   }
 * });
 *
 * registerPlugin(MyObj, {
 *   beforeAdd(context, a, b) {  // receives a=1 and b=2
 *     return [a * 2, b * 2];
 *   }
 * });
 *
 * const obj = new MyObj();
 * obj.add(1, 2);  //=> 'add passed: 1, 2'; 6
 * ```
 * @sectionName Before Intercept Functions
 */

/**
 * An after intercept function can be used to modify or change the results of the intercepted function.
 *
 * The function will be passed the `this` context of the intercepted object, the result of the intercepted function, and the final arguments passed to the intercepted function. The function should either return a value if modifying the result or return `null` or nothing if not modifying the result.
 *
 * ```js
 * class MyObj {
 *   add(a, b) {
 *     return a + b;
 *   }
 * }
 *
 * // create a plugin that doubles the result
 * registerPlugin(MyObj, {
 *   afterAdd(context, result, a, b) {
 *     return result * 2;
 *   }
 * });
 *
 * const obj = new MyObj();
 * obj.add(1, 2);  //=> 6
 * ```
 *
 * Multiple after intercept functions can be registered for the same function. All functions will be run in the order they were registered. Each functions return value will be passed to the next function. If the function doesn't modify the result (returned `null` or nothing) then the functions parameters will be passed to the next function instead.
 *
 * ```js
 * class MyObj {
 *   add(a, b) {
 *     return a + b;
 *   }
 * }
 *
 * // log the arguments of the call and pass them unchanged to
 * // the next plugin
 * registerPlugin(MyObj, {
 *   afterAdd(context, result, a, b) {
 *     console.log(`add passed: ${a}, ${b} and returned ${result}`);
 *   }
 * });
 *
 * registerPlugin(MyObj, {
 *   afterAdd(context, result, a, b) {  // receives result=3
 *     return result * 2;
 *   }
 * });
 *
 * const obj = new MyObj();
 * obj.add(1, 2);  //=> 'add passed: 1, 2 and returned 3'; 6
 * ```
 * @sectionName After Intercept Functions
 */