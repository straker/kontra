"use strict";
exports.__esModule = true;
var kontra = require("./kontra.js");
kontra.setStoreItem('foo', 1);
kontra.untrack([{ one: 1 }, { two: 2 }]);
