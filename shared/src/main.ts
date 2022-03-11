import { datatype, Datagram, Vector } from "jump-engine";

export const ControlsDatagram = new Datagram().addField("movement", datatype.vector32).addField("fire", datatype.int8).addField("useKeys", datatype.uint8);
export interface Controls {
    movement: Vector;
    fire: number;
};

export const PlayerDatagram = new Datagram()
    .addField("position", datatype.vector32)
    .addField("velocity", datatype.vector32)
    .addField("rotation", datatype.float32)
    .addField("id", datatype.int32)
    .addField("kills", datatype.int32);
export const PlayerDestroyedDatagram = new Datagram().addField("tankId", datatype.int32);
const ProjectileDatagram = new Datagram()
    .addField("position", datatype.vector32)
    .addField("velocity", datatype.vector32)
    .addField("rotation", datatype.float32)
    .addField("destroy", datatype.int8);
export const EventDatagram = new Datagram().addField("type", datatype.int8).addField("position", datatype.vector32);
export const ItemDatagram = new Datagram().addField("type", datatype.int8).addField("position", datatype.vector32).addField("id", datatype.int32);
export const ItemRemove = new Datagram().addField("itemId", datatype.int32);
export const UpdateDatagram = new Datagram()
    .addArray("players", PlayerDatagram)
    .addArray("projectiles", ProjectileDatagram)
    .addArray("events", EventDatagram)
    .addArray("deaths", PlayerDestroyedDatagram)
    .addArray("items", ItemDatagram)
    .addArray("itemsRemove", ItemRemove);
export interface PlayerData {
    position: Vector;
    rotation: number;
    velocity: Vector;
    id: number;
}

export interface ProjectileData {
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

export enum EventType{
    shoot = 1,
    hit = 2,
    bounce = 3
}

export interface ItemData {
    position: Vector;
    type: number;
    id: number;
}

export enum ItemType{
    boost = 1,
    shotgun = 2,
    armor = 3,
}
