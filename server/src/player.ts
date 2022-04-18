import { Vector } from "jump-engine";
import { EventType, PlayerData } from "jump-out-shared";
import { TankEvent } from "./event";
import { mapData } from "./mapData";
import { Projectile } from "./projectile";

const rotationSpeed = 0.002;
const tankSpeed = 0.6;
const reloadTime = 100;
const turretRotationSpeed = 0.003;

const checks = [new Vector(1, 1), new Vector(-1, 1), new Vector(1, -1), new Vector(-1, -1)];

export class Player implements PlayerData {
    position: Vector;
    rotation: number = 0;
    velocity: Vector = new Vector(0, 0);
    id: number;
    fire: number;
    reload: number;
    boost: number = 0;
    bounce: number = 0;
    kills: number = 0;

    inventory: Map<number, any> = new Map();

    movement: Vector = new Vector(0, 0);
    useKeys: number = 0;
    turretAngle: number = 0;
    aimAngle: number = 0;

    constructor(id: number) {
        this.id = id;
        while (true) {
            let x = Math.floor((Math.random() * (mapData.width - 20)) / 10);
            let y = Math.floor((Math.random() * (mapData.height - 20)) / 10);

            if (mapData.hitbox[x][y] != 255 &&
                mapData.hitbox[x + 3][y + 3] != 255 &&
                mapData.hitbox[x + 3][y - 3] != 255 &&
                mapData.hitbox[x - 3][y + 3] != 255 &&
                mapData.hitbox[x - 3][y - 3] != 255 &&
                mapData.hitbox[x][y] != undefined
            ) {
                this.position = new Vector(x * 10, y * 10), 1 + Math.round((Math.random() * 100) % 3);
                break;
            }
        }

        Player.list.set(id, this);
        this.reload = 0;
    }


    update(dt: number) {
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
                new Projectile(this);
                this.reload = reloadTime;
                new TankEvent(EventType.shoot, this.position);
            }
        } else {
            this.reload -= dt;
        }

        if (this.movement.x != 0) {
            if (this.movement.x > 0) {
                this.rotation += rotationSpeed * dt;
            } else {
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
            } else {
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
                if (mapData.hitbox[Math.floor(checkpos.x / 10)][Math.floor(checkpos.y / 10)] == 255) {
                    return;
                }
            }

            this.position = nextpos;
        }
    }

    static list: Map<number, Player> = new Map();
    static deaths: { tankId: number }[] = [];
}

function moduloPi(rot: number): number {
    while (rot > Math.PI) rot -= Math.PI * 2;
    while (rot < -Math.PI) rot += Math.PI * 2;
    return rot;
}
