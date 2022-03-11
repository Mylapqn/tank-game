"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoadMap = exports.mapData = void 0;
const Jimp = require("jimp");
exports.mapData = { width: 0, height: 0, hitbox: Array() };
function LoadMap(map) {
    Jimp.read(map, function (err, image) {
        exports.mapData.width = image.getWidth();
        exports.mapData.height = image.getHeight();
        for (let x = 0; x < exports.mapData.width; x += 10) {
            exports.mapData.hitbox[x / 10] = [];
            for (let y = 0; y < exports.mapData.height; y += 10) {
                exports.mapData.hitbox[x / 10][y / 10] = image.getPixelColor(x, y);
            }
        }
    });
}
exports.LoadMap = LoadMap;
//# sourceMappingURL=mapData.js.map