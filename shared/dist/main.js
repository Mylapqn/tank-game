"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ItemType = exports.EventType = exports.UpdateDatagram = exports.ItemRemove = exports.ItemDatagram = exports.EventDatagram = exports.PlayerDestroyedDatagram = exports.PlayerDatagram = exports.ControlsDatagram = void 0;
const jump_engine_1 = require("jump-engine");
exports.ControlsDatagram = new jump_engine_1.Datagram().addField("movement", jump_engine_1.datatype.vector32).addField("fire", jump_engine_1.datatype.int8).addField("useKeys", jump_engine_1.datatype.uint8);
;
exports.PlayerDatagram = new jump_engine_1.Datagram()
    .addField("position", jump_engine_1.datatype.vector32)
    .addField("velocity", jump_engine_1.datatype.vector32)
    .addField("rotation", jump_engine_1.datatype.float32)
    .addField("id", jump_engine_1.datatype.int32)
    .addField("kills", jump_engine_1.datatype.int32);
exports.PlayerDestroyedDatagram = new jump_engine_1.Datagram().addField("tankId", jump_engine_1.datatype.int32);
const ProjectileDatagram = new jump_engine_1.Datagram()
    .addField("position", jump_engine_1.datatype.vector32)
    .addField("velocity", jump_engine_1.datatype.vector32)
    .addField("rotation", jump_engine_1.datatype.float32)
    .addField("destroy", jump_engine_1.datatype.int8);
exports.EventDatagram = new jump_engine_1.Datagram().addField("type", jump_engine_1.datatype.int8).addField("position", jump_engine_1.datatype.vector32);
exports.ItemDatagram = new jump_engine_1.Datagram().addField("type", jump_engine_1.datatype.int8).addField("position", jump_engine_1.datatype.vector32).addField("id", jump_engine_1.datatype.int32);
exports.ItemRemove = new jump_engine_1.Datagram().addField("itemId", jump_engine_1.datatype.int32);
exports.UpdateDatagram = new jump_engine_1.Datagram()
    .addArray("players", exports.PlayerDatagram)
    .addArray("projectiles", ProjectileDatagram)
    .addArray("events", exports.EventDatagram)
    .addArray("deaths", exports.PlayerDestroyedDatagram)
    .addArray("items", exports.ItemDatagram)
    .addArray("itemsRemove", exports.ItemRemove);
var EventType;
(function (EventType) {
    EventType[EventType["shoot"] = 1] = "shoot";
    EventType[EventType["hit"] = 2] = "hit";
    EventType[EventType["bounce"] = 3] = "bounce";
})(EventType = exports.EventType || (exports.EventType = {}));
var ItemType;
(function (ItemType) {
    ItemType[ItemType["boost"] = 1] = "boost";
    ItemType[ItemType["shotgun"] = 2] = "shotgun";
    ItemType[ItemType["armor"] = 3] = "armor";
})(ItemType = exports.ItemType || (exports.ItemType = {}));
//# sourceMappingURL=main.js.map