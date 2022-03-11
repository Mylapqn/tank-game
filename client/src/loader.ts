import * as PIXI from "pixi.js";

export function LoadImages(cb?: PIXI.Loader.OnCompleteSignal) {
    let loader = PIXI.Loader.shared;

    loader
        .add("player", "./images/white_tank.png")
        .add("yellow", "./images/yellow_tank.png")
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

