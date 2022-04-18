import * as PIXI from "pixi.js";
import { audioCtx } from ".";


interface audioBuffersArray {
    [key: string]: AudioBuffer
}
export let audioBuffers: audioBuffersArray = {};

export function LoadImages(cb?: PIXI.Loader.OnCompleteSignal) {
    let loader = PIXI.Loader.shared;

    loader
        .add("player", "./images/white_tank.png")
        .add("yellow", "./images/yellow_tank.png")
        .add("tank", "./images/test-tank.png")
        .add("turret", "./images/test-turret.png")
        .add("enemy", "./images/red_tank.png")
        .add("shotgun", "./images/shotgun.png")
        .add("boost", "./images/boost.png")
        .add("armor", "./images/armor.png")
        .add("tank_shadow", "./images/tank_shadow.png")
        .add("bullet", "./images/bullet.png")
        .add("map1", "./images/map1.png")
        .add("map1_wall", "./images/map1_wall.png")
        .add("explosion1", "./images/explosion/1.png")
        .add("explosion2", "./images/explosion/2.png")
        .add("explosion3", "./images/explosion/3.png")
    loader.load(cb);
}

export function LoadAudio() {
    loadSound("./music/cannon.wav").then(buf => {
        audioBuffers["cannon"] = buf;
    });
}

function loadSound(url: string) {
    console.log("loading sound");

    return new Promise<AudioBuffer>((resolve, reject) => {
        var request = new XMLHttpRequest();
        request.open('GET', url, true);
        request.responseType = 'arraybuffer';
        // Decode asynchronously
        request.onload = function () {
            audioCtx.decodeAudioData(request.response, function (buffer) {
                if (!buffer) {
                    console.log('Error decoding file data: ' + url);
                    reject();
                    return;
                }
                resolve(buffer);
            });
        }
        request.onerror = function () {
            console.log('BufferLoader: XHR error');
            reject();
            return;
        };
        request.send();
});
}