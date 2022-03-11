"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoadMap = exports.mapData = void 0;
const Jimp = require("jimp");
exports.mapData = { width: 0, height: 0, hitbox: Array() };
function LoadMap(map) {
    Jimp.read(map, function (err, image) {
        exports.mapData.width = image.getWidth();
        exports.mapData.height = image.getHeight();
        for (let x = 0; exports.mapData.width < x; x += 10) {
            exports.mapData.hitbox[x] = [];
            for (let y = 0; exports.mapData.height < y; y += 10) {
                exports.mapData.hitbox[x][y] = image.getPixelColor(x, y);
            }
        }
    });
}
exports.LoadMap = LoadMap;
//# sourceMappingURL=map.js.map