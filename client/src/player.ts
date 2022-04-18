import { Vector } from "jump-engine";
import { PlayerData } from "jump-out-shared";
import * as PIXI from "pixi.js";
import { container, shadowContainer } from ".";

let colors = [0xffaa00, 0x00ff00, 0x00ffaa, 0xaa00ff, 0x00aaff, 0xaaff00, 0xffaaaa, 0xaaffaa, 0xaaaaff, 0xffffff];
let names = ["Protector", "President", "King", "CEO", "Queen", "Choosen", "Lord", "Saviour", "Cief", "Guard", "General"];
let colornames = ["Orange", "Green", "Cyan", "Purple", "Blue", "Yellow", "Pink", "Mint", "Violet", "White"];
let country = ["Republic", "Alliance", "Legion", "Kingdom", "Empire", "Union", "Army"];
let shadowOffset = new Vector(10, 15);

export class Player implements PlayerData {
    position: Vector;
    rotation: number;
    velocity: Vector;
    id: number;
    kills: number;
    turret: PIXI.Sprite;
    shadow: PIXI.Sprite;
    name: string;
    sprite: PIXI.Sprite;
    turretAngle: number = 0;
    container: PIXI.Container;
    constructor(id: number) {
        this.container = new PIXI.Container();
        this.id = id;
        Player.list.set(id, this);

        this.sprite = new PIXI.Sprite(PIXI.Loader.shared.resources["tank"].texture);
        this.turret = new PIXI.Sprite(PIXI.Loader.shared.resources["turret"].texture);
        this.turret.anchor.set(0.4, 0.5);
        this.sprite.anchor.set(0.5, 0.5);
        this.turret.position.set(-18, 0);
        this.sprite.tint = colors[id % colornames.length];
        this.shadow = new PIXI.Sprite(PIXI.Loader.shared.resources["tank_shadow"].texture);
        this.shadow.anchor.set(0.3, 0.5);
        this.shadow.alpha = 0.5;
        this.name =
            names[id % names.length] +
            " of The " +
            colornames[id % colors.length] +
            " " +
            country[id % country.length];
        container.addChild(this.container);
        this.container.addChild(this.sprite);
        this.container.addChild(this.turret);
        //shadowContainer.addChild(this.shadow);
    }

    update(dt: number) {
        this.container.position.x = this.position.x;
        this.container.position.y = this.position.y;
        this.container.rotation = this.rotation;

        this.turret.rotation = this.turretAngle;
        //console.log(this.turretAngle);

        this.shadow.position.x = this.container.position.x + shadowOffset.x;
        this.shadow.position.y = this.container.position.y + shadowOffset.y;
        this.shadow.rotation = this.container.rotation;
    }

    static remove(id: number) {
        let toRemove = this.list.get(id);
        toRemove.turret.destroy();
        toRemove.shadow.destroy();
        toRemove.sprite.destroy();
        this.list.delete(id);
    }
    static list: Map<number, Player> = new Map();
}
