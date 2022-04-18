import { Vector } from "jump-engine";
import { ProjectileData } from "jump-out-shared";
import * as PIXI from "pixi.js";
import { container, graphics } from ".";

export class Projectile implements ProjectileData {
    id: number;
    position: Vector;
    rotation: number = 0;
    velocity: Vector;
    destroy: number;
    kills: number;
    sprite: PIXI.Sprite;
    constructor(id: number) {
        this.id = id;
        this.sprite = new PIXI.Sprite(PIXI.Loader.shared.resources["bullet"].texture);
        this.sprite.anchor.set(0.5);
        //container.addChild(this.sprite);
        Projectile.list.set(id, this);
    }

    update(dt: number) {
        graphics.lineStyle({width:8,color:0xFFFFFF,alpha:1,cap:PIXI.LINE_CAP.ROUND});
        graphics.moveTo(this.position.x, this.position.y);
        this.position.x += (this.velocity.x * dt * 1000) / 60;
        this.position.y += (this.velocity.y * dt * 1000) / 60;
        graphics.lineTo(this.position.x, this.position.y);
        this.sprite.position.x = this.position.x;
        this.sprite.position.y = this.position.y;
        this.sprite.rotation = this.rotation;
        if (this.destroy == 1) Projectile.remove(this.id);
    }
    static remove(id: number) {
        let toRemove = this.list.get(id);
        toRemove.sprite.destroy();
        this.list.delete(id);
    }

    static list: Map<number, Projectile> = new Map();
}