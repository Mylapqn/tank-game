"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ItemSpawner = exports.Item = void 0;
const jump_engine_1 = require("jump-engine");
const jump_out_shared_1 = require("jump-out-shared");
const event_1 = require("./event");
const mapData_1 = require("./mapData");
const player_1 = require("./player");
const projectile_1 = require("./projectile");
class Item {
    constructor(position, type) {
        this.time = 60000;
        this.type = type;
        this.position = position;
        this.id = Item.index++;
        Item.list.set(this.id, this);
    }
    update(dt) {
        this.time -= dt;
        if (this.time <= 0) {
            Item.remove.push({ itemId: this.id });
            Item.list.delete(this.id);
        }
        for (const [id, player] of player_1.Player.list) {
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
    static activate(type, player) {
        switch (type) {
            case jump_out_shared_1.ItemType.armor:
                player.bounce = 1000;
                break;
            case jump_out_shared_1.ItemType.boost:
                player.boost = 3000;
                break;
            case jump_out_shared_1.ItemType.shotgun:
                const shotgunSpread = 0.1;
                player.rotation += shotgunSpread;
                new projectile_1.Projectile(player);
                player.rotation -= shotgunSpread;
                new projectile_1.Projectile(player);
                player.rotation -= shotgunSpread;
                new projectile_1.Projectile(player);
                player.rotation += shotgunSpread;
                new event_1.TankEvent(jump_out_shared_1.EventType.shoot, player.position);
                break;
            default:
                break;
        }
    }
}
exports.Item = Item;
Item.index = 0;
Item.list = new Map();
Item.remove = [];
const delayTime = 5000;
let delay = 5000;
function ItemSpawner(dt) {
    delay -= dt;
    if (delay <= 0) {
        while (true) {
            let x = Math.floor((Math.random() * (mapData_1.mapData.width - 20)) / 10);
            let y = Math.floor((Math.random() * (mapData_1.mapData.height - 20)) / 10);
            if (mapData_1.mapData.hitbox[x][y] != 255 &&
                mapData_1.mapData.hitbox[x + 1][y + 1] != 255 &&
                mapData_1.mapData.hitbox[x + 1][y - 1] != 255 &&
                mapData_1.mapData.hitbox[x - 1][y + 1] != 255 &&
                mapData_1.mapData.hitbox[x - 1][y - 1] != 255 &&
                mapData_1.mapData.hitbox[x][y] != undefined) {
                new Item(new jump_engine_1.Vector(x * 10, y * 10), 1 + Math.round((Math.random() * 100) % 3));
                break;
            }
        }
        delay = delayTime;
    }
}
exports.ItemSpawner = ItemSpawner;
//# sourceMappingURL=item.js.map