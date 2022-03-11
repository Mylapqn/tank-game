"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Projectile = void 0;
const jump_engine_1 = require("jump-engine");
const jump_out_shared_1 = require("jump-out-shared");
const ws_1 = require("ws");
const event_1 = require("./event");
const mapData_1 = require("./mapData");
const player_1 = require("./player");
const server_1 = require("./server");
const projectileSpeed = 3;
class Projectile {
    constructor(player) {
        this.destroy = 0;
        if (player != undefined) {
            this.position = player.position;
            this.rotation = player.rotation;
            this.player = player;
            this.evaluateVelocity();
        }
        Projectile.list.set(Projectile.index, this);
        this.id = Projectile.index;
        Projectile.index++;
    }
    evaluateVelocity() {
        this.velocity = new jump_engine_1.Vector(Math.cos(this.rotation), Math.sin(this.rotation)).mult(projectileSpeed);
    }
    update(dt) {
        if (this.destroy == 1) {
            Projectile.list.delete(this.id);
            return;
        }
        let nextpos = this.position.result().add(this.velocity.result().mult(dt));
        for (const player of player_1.Player.list.values()) {
            if (player == this.player)
                continue;
            if (nextpos.distance(player.position) < 80) {
                if (player.bounce <= 0) {
                    new event_1.TankEvent(jump_out_shared_1.EventType.hit, player.position);
                    player_1.Player.deaths.push({ tankId: player.id });
                    let kills = player.kills;
                    player_1.Player.list.delete(player.id);
                    this.player.kills++;
                    if (server_1.connections[player.id - 1].readyState != ws_1.CLOSED) {
                        new jump_engine_1.Timer(() => {
                            let p = new player_1.Player(player.id);
                            p.kills = kills;
                        }, 300);
                    }
                    this.destroy = 1;
                }
                else {
                    this.rotation += Math.PI + Math.random() * 0.2 - 0.1;
                    this.evaluateVelocity();
                    this.player = player;
                    new event_1.TankEvent(jump_out_shared_1.EventType.bounce, player.position);
                }
                return;
            }
        }
        if (mapData_1.mapData.hitbox[Math.floor(nextpos.x / 10)][Math.floor(nextpos.y / 10)] == 255) {
            this.destroy = 1;
            return;
        }
        this.position = nextpos;
    }
}
exports.Projectile = Projectile;
Projectile.index = 0;
Projectile.list = new Map();
//# sourceMappingURL=projectile.js.map