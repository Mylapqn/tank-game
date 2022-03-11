import { BaseObject, Vector } from "jump-engine";
import { EventType, ItemData, ItemType } from "jump-out-shared";
import { TankEvent } from "./event";
import { mapData } from "./mapData";
import { Player } from "./player";
import { Projectile } from "./projectile";

export class Item implements ItemData {
    position: Vector;
    type: number;
    id: number;
    time: number = 60000;

    constructor(position: Vector, type: ItemType) {
        this.type = type;
        this.position = position;
        this.id = Item.index++;
        Item.list.set(this.id, this);
    }

    update(dt: number) {
        this.time -= dt;
        if (this.time <= 0) {
            Item.remove.push({ itemId: this.id });
            Item.list.delete(this.id);
        }

        for (const [id, player] of Player.list) {
            if (this.position.result().sub(player.position).lengthSquared() < 25000) {
                for (let i = 0; i < 3; i++) {
                    if (!player.inventory.has(i)) {
                        player.inventory.set(i, this.type);
                        Item.remove.push({ itemId: this.id });
                        Item.list.delete(this.id);
                        return;
                    }
                }
            }
        }
    }

    static index: number = 0;
    static list = new Map<number, Item>();
    static remove: { itemId: number }[] = [];

    static activate(type: ItemType, player: Player) {
        switch (type) {
            case ItemType.armor:
                player.bounce = 1000;
                break;
            case ItemType.boost:
                player.boost = 3000;
                break;

            case ItemType.shotgun:
                const shotgunSpread = 0.1;
                player.rotation += shotgunSpread;
                new Projectile(player);
                player.rotation -= shotgunSpread;
                new Projectile(player);
                player.rotation -= shotgunSpread;
                new Projectile(player);
                player.rotation += shotgunSpread;
                new TankEvent(EventType.shoot, player.position);
                break;

            default:
                break;
        }
    }
}

const delayTime = 5000;
let delay = 5000;
export function ItemSpawner(dt: number) {
    delay -= dt;
    if (delay <= 0) {
        while (true) {
            let x = Math.floor((Math.random() * (mapData.width-20)) / 10);
            let y = Math.floor((Math.random() * (mapData.height-20)) / 10);

            if (mapData.hitbox[x][y] != 255 &&
                mapData.hitbox[x+1][y+1] != 255 &&
                mapData.hitbox[x+1][y-1] != 255 &&
                mapData.hitbox[x-1][y+1] != 255 &&
                mapData.hitbox[x-1][y-1] != 255 &&
                mapData.hitbox[x][y] != undefined 
                 ) {
                new Item(new Vector(x*10, y*10), 1+Math.round((Math.random()*100)%3));
                break;
            }
        }

        delay = delayTime;
    }
}
