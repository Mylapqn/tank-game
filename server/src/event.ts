import { Vector } from "jump-engine";
import { EventType, TankEventData } from "jump-out-shared";

export class TankEvent implements TankEventData {
    position: Vector;
    type: number;
    constructor(type:EventType, position: Vector) {
        this.type = type;
        this.position = position;
        TankEvent.list.push(this);
    }
    static list:Array<TankEvent> = [];
}