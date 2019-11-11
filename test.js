"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
var kontra = require("./kontra.js");
// initialize the game and setup the canvas
var _a = kontra.init(), canvas = _a.canvas, context = _a.context;
// create a custom sprite
var CustomSprite = /** @class */ (function (_super) {
    __extends(CustomSprite, _super);
    function CustomSprite(properties) {
        var _this = _super.call(this, properties) || this;
        // add custom properties
        _this.color = 'green';
        _this.altColor = 'red';
        _this.width = 20;
        _this.height = 40;
        return _this;
    }
    // create custom functions
    CustomSprite.prototype.stripe = function () {
        var pos = 0;
        this.context.fillStyle = this.altColor;
        while (pos < this.height) {
            this.context.fillRect(this.x, this.y + pos, this.width, 10);
            pos += 20;
        }
    };
    CustomSprite.prototype.render = function () {
        this.draw(); // draw the sprite normally
        this.stripe();
    };
    return CustomSprite;
}(kontra.Sprite["class"]));
var sprite = new CustomSprite({
    x: 290,
    y: 180
});
sprite.render();
