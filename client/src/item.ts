import * as PIXI from "pixi.js";
import { Vector } from "jump-engine";
import { ItemData, ItemType } from "jump-out-shared";
import { container } from ".";

export const powerupNames = new Map<ItemType, string>([
    [ItemType.boost, "boost"],
    [ItemType.shotgun, "shotgun"],
    [ItemType.armor, "armor"],
]);

export class Item implements ItemData {
    position: Vector;
    type: number;
    id: number;
    sprite: PIXI.Sprite;

    constructor(id: number){
        this.id = id;
        Item.list.set(this.id, this);
    }

    init() {
        this.sprite = new PIXI.Sprite(PIXI.Loader.shared.resources[powerupNames.get(this.type)].texture);
        this.sprite.position.set(...this.position.xy());
        this.sprite.anchor.set(0.5);
        container.addChild(this.sprite);
    }

    static remove(id: number) {
        let toRemove = this.list.get(id);
        toRemove.sprite.destroy();
        this.list.delete(id);
    }

    static list = new Map<number, Item>();
}
