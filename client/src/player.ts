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
    sprite: PIXI.Sprite;
    shadow: PIXI.Sprite;
    name: string;
    constructor(id: number) {
        this.id = id;
        Player.list.set(id, this);

        this.sprite = new PIXI.Sprite(PIXI.Loader.shared.resources["player"].texture);
        this.sprite.anchor.set(0.3, 0.5);
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
        container.addChild(this.sprite);
        shadowContainer.addChild(this.shadow);
    }

    update(dt: number) {
        this.sprite.position.x = this.position.x;
        this.sprite.position.y = this.position.y;
        this.sprite.rotation = this.rotation;

        this.shadow.position.x = this.sprite.position.x + shadowOffset.x;
        this.shadow.position.y = this.sprite.position.y + shadowOffset.y;
        this.shadow.rotation = this.sprite.rotation;
    }

    static remove(id: number) {
        let toRemove = this.list.get(id);
        toRemove.sprite.destroy();
        toRemove.shadow.destroy();
        this.list.delete(id);
    }
    static list: Map<number, Player> = new Map();
}
