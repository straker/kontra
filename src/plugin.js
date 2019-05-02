/**
 * A plugin system based on the [interceptor pattern](https://en.wikipedia.org/wiki/Interceptor_pattern), designed to share reusable code such as more advance collision detection or a 2D physics engine.
 *
 * ```js
 * import { registerPlugin, Sprite } from 'kontra';
 * import loggingPlugin from 'path/to/plugin/code.js'
 *
 * // register a plugin that adds logging to all Sprites
 * registerPlugin(Sprite, loggingPlugin);
 * ```
 * @sectionName Plugin
 */

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

/**
 * Get the kontra object method name from the plugin.
 *
 * @param {String} methodName - Before/After function name
 *
 * @returns {String}
 */
function getMethod(methodName) {
  let methodTitle = methodName.substr( methodName.search(/[A-Z]/) );
  return methodTitle[0].toLowerCase() + methodTitle.substr(1);
}

/**
 * Remove an interceptor.
 *
 * @param {function[]} interceptors - Before/After interceptor list
 * @param {function} fn - Interceptor function
 */
function removeInterceptor(interceptors, fn) {
  let index = interceptors.indexOf(fn);
  if (index !== -1) {
    interceptors.splice(index, 1);
  }
}

/**
 * Register a plugin to run a set of functions before or after the Kontra object functions.
 * @function registerPlugin
 *
 * @param {Object} kontraObj - Kontra object to attach the plugin to.
 * @param {Object} pluginObj - Plugin object with before and after intercept functions.
 */
export function registerPlugin(kontraObj, pluginObj) {
  let objectProto = kontraObj.prototype;

  if (!objectProto) return;

  // create interceptor list and functions
  if (!objectProto._inc) {
    objectProto._inc = {};
    objectProto._bInc = function beforePlugins(context, method, ...args) {
      return this._inc[method].before.reduce((acc, fn) => {
        let newArgs = fn(context, ...acc);
        return newArgs ? newArgs : acc;
      }, args);
    };
    objectProto._aInc = function afterPlugins(context, method, result, ...args) {
      return this._inc[method].after.reduce((acc, fn) => {
        let newResult = fn(context, acc, ...args);
        return newResult ? newResult : acc;
      }, result);
    };
  }

  // add plugin to interceptors
  Object.getOwnPropertyNames(pluginObj).forEach(methodName => {
    let method = getMethod(methodName);

    if (!objectProto[method]) return;

    // override original method
    if (!objectProto['_o' + method]) {
      objectProto['_o' + method] = objectProto[method];

      objectProto[method] = function interceptedFn(...args) {

        // call before interceptors
        let alteredArgs = this._bInc(this, method, ...args);

        let result = objectProto['_o' + method].call(this, ...alteredArgs);

        // call after interceptors
        return this._aInc(this, method, result, ...args);
      };
    }

    // create interceptors for the method
    if (!objectProto._inc[method]) {
      objectProto._inc[method] = {
        before: [],
        after: []
      };
    }

    if (methodName.startsWith('before')) {
      objectProto._inc[method].before.push(pluginObj[methodName]);
    }
    else if (methodName.startsWith('after')) {
      objectProto._inc[method].after.push(pluginObj[methodName]);
    }
  });
}

/**
 * Unregister a plugin from a Kontra object.
 * @function unregisterPlugin
 *
 * @param {Object} kontraObj - Kontra object to detach plugin from.
 * @param {Object} pluginObj - The plugin object that was passed during registration.
 */
export function unregisterPlugin(kontraObj, pluginObj) {
  let objectProto = kontraObj.prototype;

  if (!objectProto || !objectProto._inc) return;

  // remove plugin from interceptors
  Object.getOwnPropertyNames(pluginObj).forEach(methodName => {
    let method = getMethod(methodName);

    if (methodName.startsWith('before')) {
      removeInterceptor(objectProto._inc[method].before, pluginObj[methodName]);
    }
    else if (methodName.startsWith('after')) {
      removeInterceptor(objectProto._inc[method].after, pluginObj[methodName]);
    }
  });
}

/**
 * Safely extend the functionality of a Kontra object. Any properties that already exist on the Kontra object will not be added.
 *
 * ```js
 * import { extendObject, Vector } from 'kontra';
 *
 * // add a subtract function to all Vectors
 * extendObject(Vector, {
 *   subtract(vec) {
 *     return Vector(this.x - vec.x, this.y - vec.y);
 *   }
 * });
 * ```
 * @function extendObject
 *
 * @param {Object} kontraObj - Kontra object to extend
 * @param {Object} properties - Properties to add.
 */
export function extendObject(kontraObj, properties) {
  let objectProto = kontraObj.prototype;

  if (!objectProto) return;

  Object.getOwnPropertyNames(properties).forEach(prop => {
    if (!objectProto[prop]) {
      objectProto[prop] = properties[prop];
    }
  });
}