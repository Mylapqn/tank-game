import { Datagram, Vector } from "jump-engine";
export declare const ControlsDatagram: Datagram;
export interface Controls {
    movement: Vector;
    fire: number;
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
    kills: number;
    id: number;
}
export interface ProjectileData {
    position: Vector;
    rotation: number;
    velocity: Vector;
    destroy: number;
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
export interface ItemData {
    position: Vector;
    type: number;
    id: number;
}
export declare enum ItemType {
    boost = 1,
    shotgun = 2,
    armor = 3
}
