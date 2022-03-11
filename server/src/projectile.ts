import { Timer, Vector } from "jump-engine";
import { EventType, ProjectileData } from "jump-out-shared";
import { CLOSED } from "ws";
import { TankEvent } from "./event";
import { mapData } from "./mapData";
import { Player } from "./player";
import { connections } from "./server";

const projectileSpeed = 3;

export class Projectile implements ProjectileData {
    position: Vector;
    rotation: number;
    velocity: Vector;
    id: number;
    destroy: number = 0;
    player: Player;
    constructor(player?: Player) {
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
        this.velocity = new Vector(Math.cos(this.rotation), Math.sin(this.rotation)).mult(projectileSpeed);
    }

    update(dt: number) {
        if (this.destroy == 1) {
            Projectile.list.delete(this.id);
            return;
        }
        let nextpos = this.position.result().add(this.velocity.result().mult(dt));
        for (const player of Player.list.values()) {
            if (player == this.player) continue;
            if (nextpos.distance(player.position) < 80) {
                if (player.bounce <= 0) {
                    new TankEvent(EventType.hit, player.position);
                    Player.deaths.push({ tankId: player.id });
                    let kills = player.kills;

                    Player.list.delete(player.id);
                    this.player.kills++;
                    if (connections[player.id - 1].readyState != CLOSED) {
                        new Timer(()=>{
                            let p = new Player(player.id);
                            p.kills = kills;
                        }, 300);
                    }
                    this.destroy = 1;
                } else {
                    this.rotation += Math.PI + Math.random() * 0.2 - 0.1;
                    this.evaluateVelocity();
                    this.player = player;
                    new TankEvent(EventType.bounce, player.position);
                }
                return;
            }
        }
        if (mapData.hitbox[Math.floor(nextpos.x / 10)][Math.floor(nextpos.y / 10)] == 255) {
            this.destroy = 1;
            return;
        }
        this.position = nextpos;
    }
    static index: number = 0;
    static list: Map<number, Projectile> = new Map();
}
