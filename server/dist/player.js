"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Player = void 0;
const jump_engine_1 = require("jump-engine");
const jump_out_shared_1 = require("jump-out-shared");
const event_1 = require("./event");
const mapData_1 = require("./mapData");
const projectile_1 = require("./projectile");
const rotationSpeed = 0.002;
const tankSpeed = 0.6;
const reloadTime = 100;
const turretRotationSpeed = 0.003;
const checks = [new jump_engine_1.Vector(1, 1), new jump_engine_1.Vector(-1, 1), new jump_engine_1.Vector(1, -1), new jump_engine_1.Vector(-1, -1)];
class Player {
    constructor(id) {
        this.rotation = 0;
        this.velocity = new jump_engine_1.Vector(0, 0);
        this.boost = 0;
        this.bounce = 0;
        this.kills = 0;
        this.inventory = new Map();
        this.movement = new jump_engine_1.Vector(0, 0);
        this.useKeys = 0;
        this.turretAngle = 0;
        this.aimAngle = 0;
        this.id = id;
        while (true) {
            let x = Math.floor((Math.random() * (mapData_1.mapData.width - 20)) / 10);
            let y = Math.floor((Math.random() * (mapData_1.mapData.height - 20)) / 10);
            if (mapData_1.mapData.hitbox[x][y] != 255 &&
                mapData_1.mapData.hitbox[x + 3][y + 3] != 255 &&
                mapData_1.mapData.hitbox[x + 3][y - 3] != 255 &&
                mapData_1.mapData.hitbox[x - 3][y + 3] != 255 &&
                mapData_1.mapData.hitbox[x - 3][y - 3] != 255 &&
                mapData_1.mapData.hitbox[x][y] != undefined) {
                this.position = new jump_engine_1.Vector(x * 10, y * 10), 1 + Math.round((Math.random() * 100) % 3);
                break;
            }
        }
        Player.list.set(id, this);
        this.reload = 0;
    }
    update(dt) {
        this.rotation = moduloPi(this.rotation);
        this.turretAngle = moduloPi(this.turretAngle);
        if (this.useKeys != 0) {
            for (let i = 0; i < 5; i++) {
                if ((Math.pow(2, i) & this.useKeys) == Math.pow(2, i)) {
                    if (this.inventory.has(i)) {
                        this.inventory.delete(i);
                    }
                }
            }
        }
        if (this.bounce > 0) {
            this.bounce -= dt;
        }
        if (this.reload <= 0) {
            if (this.fire == 1) {
                new projectile_1.Projectile(this);
                this.reload = reloadTime;
                new event_1.TankEvent(jump_out_shared_1.EventType.shoot, this.position);
            }
        }
        else {
            this.reload -= dt;
        }
        if (this.movement.x != 0) {
            if (this.movement.x > 0) {
                this.rotation += rotationSpeed * dt;
            }
            else {
                this.rotation -= rotationSpeed * dt;
            }
        }
        let rotateBy = turretRotationSpeed * dt;
        let angleDif = Math.abs(this.turretAngle - this.aimAngle);
        rotateBy = Math.min(angleDif, rotateBy);
        if (angleDif > Math.PI) {
            rotateBy *= -1;
        }
        if (this.turretAngle > this.aimAngle)
            this.turretAngle -= rotateBy;
        if (this.turretAngle < this.aimAngle)
            this.turretAngle += rotateBy;
        this.velocity.x = 0;
        this.velocity.y = 0;
        if (this.movement.y != 0) {
            if (this.movement.y > 0) {
                this.velocity.x = Math.cos(this.rotation) * tankSpeed;
                this.velocity.y = Math.sin(this.rotation) * tankSpeed;
            }
            else {
                this.velocity.x = (Math.cos(this.rotation) * -tankSpeed) / 2;
                this.velocity.y = (Math.sin(this.rotation) * -tankSpeed) / 2;
            }
            if (this.boost > 0) {
                this.boost -= dt;
                this.velocity.mult(2);
            }
            let nextpos = this.position.result().add(this.velocity.result().mult(dt));
            for (const c of checks) {
                let checkpos = nextpos.result().add(c.result().mult(70));
                if (mapData_1.mapData.hitbox[Math.floor(checkpos.x / 10)][Math.floor(checkpos.y / 10)] == 255) {
                    return;
                }
            }
            this.position = nextpos;
        }
    }
}
exports.Player = Player;
Player.list = new Map();
Player.deaths = [];
function moduloPi(rot) {
    while (rot > Math.PI)
        rot -= Math.PI * 2;
    while (rot < -Math.PI)
        rot += Math.PI * 2;
    return rot;
}
//# sourceMappingURL=player.js.map