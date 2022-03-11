import { Vector } from "jump-engine";
import * as PIXI from "pixi.js";

const lifetime = 60;

export class PopText {
    position: Vector;
    text: string;
    sprite: PIXI.Text;
    time: number = 0;
    white: boolean = false;
    color: number;
    constructor(text: string, position: Vector, container: PIXI.Container, color: number = 0xffffff) {
        this.sprite = new PIXI.Text(text, { fontFamily: "consolas", fontWeight: "900", fill: 0xFFFFFF, fontSize: 10, dropShadow: true, dropShadowDistance:1 });
        this.sprite.tint = color;
        this.color = color;
        this.sprite.anchor.set(0.5);
        this.sprite.scale.set(6);
        this.position = position;
        container.addChild(this.sprite);
        PopText.list.add(this);
    }

    update(dt: number) {
        this.time += dt;
        this.position.y -= dt;
        this.sprite.position.set(this.position.x, this.position.y);
        if (Math.floor((this.time-dt)/10) != Math.floor(this.time/10)) {
            this.white = !this.white;
            
            if (this.white) {
                this.sprite.tint = 0xFFFFFF;
            } else {
                this.sprite.tint = this.color;
            }
        }
        if (this.time > lifetime) {
            PopText.list.delete(this);
            this.sprite.destroy();
        }
    }
    static list = new Set<PopText>();
}
