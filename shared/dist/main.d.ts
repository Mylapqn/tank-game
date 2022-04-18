import { Datagram, Vector } from "jump-engine";
export declare const ControlsDatagram: Datagram;
export interface Controls {
    movement: Vector;
    fire: number;
    aimAngle: number;
}
export declare const PlayerDatagram: Datagram;
export declare const PlayerDestroyedDatagram: Datagram;
export declare const EventDatagram: Datagram;
export declare const ItemDatagram: Datagram;
export declare const ItemRemove: Datagram;
export declare const UpdateDatagram: Datagram;
export interface PlayerData {
    position: Vector;
    rotation: number;
    velocity: Vector;
    id: number;
    turretAngle: number;
}
export interface ProjectileData {
    id: number;
    position: Vector;
    rotation: number;
    velocity: Vector;
    destroy: number;
    kills: number;
}
export interface TankEventData {
    position: Vector;
    type: number;
}
export declare enum EventType {
    shoot = 1,
    hit = 2,
    bounce = 3
}
