"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connections = void 0;
const http_1 = require("http");
const ws_1 = require("ws");
const jump_engine_1 = require("jump-engine");
const jump_out_shared_1 = require("jump-out-shared");
const player_1 = require("./player");
const mapData_1 = require("./mapData");
const projectile_1 = require("./projectile");
const event_1 = require("./event");
const item_1 = require("./item");
(0, mapData_1.LoadMap)("server/maps/map1.png");
let server = (0, http_1.createServer)(function (request, response) { });
let port = process.env.PORT || 20003;
server.listen(port, function () {
    console.log(new Date() + " WS Server is listening on port " + port);
});
let wsServer = new ws_1.WebSocketServer({ server });
wsServer.on("connection", onConnection);
exports.connections = [];
let buffer = new ArrayBuffer(10000);
let av = new jump_engine_1.AutoView(buffer);
function onConnection(connection) {
    console.log("new connection");
    connection.send(av);
    exports.connections.push(connection);
    let player = new player_1.Player(exports.connections.length);
    connection.on("message", (message) => onMessage(message, player.id));
}
function onMessage(message, playerId) {
    if (player_1.Player.list.has(playerId)) {
        let inView = new jump_engine_1.AutoView(message.buffer.slice(message.byteOffset, message.byteOffset + message.byteLength));
        jump_out_shared_1.ControlsDatagram.deserealise(inView, player_1.Player.list.get(playerId));
    }
}
function main(dt) {
    dt = 1000 / 30;
    av.index = 0;
    let players = [];
    let projectiles = [];
    (0, item_1.ItemSpawner)(dt);
    for (const projectile of projectile_1.Projectile.list.values()) {
        projectile.update(dt);
        projectiles.push(projectile);
    }
    let items = [];
    for (const item of item_1.Item.list.values()) {
        item.update(dt);
        if (item_1.Item.list.has(item.id)) {
            items.push(item);
        }
    }
    for (const player of player_1.Player.list.values()) {
        player.update(dt);
        players.push(player);
    }
    let updateObject = {
        players: players,
        projectiles: projectiles,
        events: event_1.TankEvent.list,
        deaths: player_1.Player.deaths,
        items: items,
        itemsRemove: item_1.Item.remove,
    };
    jump_out_shared_1.UpdateDatagram.serialise(av, updateObject);
    event_1.TankEvent.list = [];
    player_1.Player.deaths = [];
    item_1.Item.remove = [];
    let buffer = av.buffer.slice(0, av.index + 16);
    for (const connection of exports.connections) {
        let pav = new jump_engine_1.AutoView(buffer);
        pav.index = buffer.byteLength - 16;
        pav.writeInt32(exports.connections.indexOf(connection) + 1);
        let ply = player_1.Player.list.get(exports.connections.indexOf(connection) + 1);
        if (ply != undefined) {
            for (let i = 0; i < 3; i++) {
                if (ply.inventory.has(i)) {
                    pav.writeInt32(ply.inventory.get(i));
                }
                else {
                    pav.writeInt32(0);
                }
            }
        }
        else {
            for (let i = 0; i < 3; i++) {
                pav.writeInt32(0);
            }
        }
        connection.send(buffer);
    }
}
jump_engine_1.loop.updateOrder.push(jump_engine_1.Timer.updateTimers);
jump_engine_1.loop.updateOrder.push(main);
jump_engine_1.loop.start();
//# sourceMappingURL=server.js.map