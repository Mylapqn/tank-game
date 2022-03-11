import * as Jimp from "jimp";

export const mapData = { width: 0, height: 0, hitbox: Array<Array<number>>() };

export function LoadMap(map: string) {
    Jimp.read(map, function (err, image) {
        mapData.width = image.getWidth();
        mapData.height = image.getHeight();
        for (let x = 0; x < mapData.width; x += 10) {
            mapData.hitbox[x/10] = [];
            for (let y = 0; y< mapData.height; y += 10) {
                mapData.hitbox[x/10][y/10] = image.getPixelColor(x, y);
            }
        }        
    });
}
