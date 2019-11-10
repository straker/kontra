/**
 * @namespace kontra
 * @export kontra
 */
declare namespace kontra {
    /**
     * Save an item to localStorage.
     * @function setStoreItem
     * @memberof kontra
     *
     * @param {String} key - The name of the key.
     * @param {*} value - The value to store.
     */
    function setStoreItem(key: string, value: any): void;
    /**
     * Retrieve an item from localStorage and convert it back to its original type.
     * @function getStoreItem
     * @memberof kontra
     *
     * @param {String} key - Name of the key of the item to retrieve.
     *
     * @returns {*} The retrieved item.
     */
    function getStoreItem(key: string): any;
    /**
     * A simple 2d vector object.
     *
     * ```js
     * import { Vector } from 'kontra';
     *
     * let vector = Vector(100, 200);
     * ```
     * @class Vector
     * @memberof kontra
     *
     * @param {Number} [x=0] - X coordinate of the vector.
     * @param {Number} [y=0] - Y coordinate of the vector.
     */
    class Vector {
        constructor(x?: number, y?: number);
        /**
         * Return a new Vector whose value is the addition of the current Vector and the passed in Vector. If `dt` is provided, the result is multiplied by the value.
         * @memberof kontra.Vector
         *
         * @param {Vector} vector - Vector to add to the current Vector.
         * @param {Number} [dt=1] - Time since last update.
         *
         * @returns {Vector} A new Vector instance.
         */
        static Vector#add(vector: Vector, dt?: number): Vector;
    }
}

