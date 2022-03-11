import { createServer } from "http";
import { WebSocketServer, WebSocket, RawData } from "ws";
import { AutoView, loop, Timer, Vector } from "jump-engine";
import { Controls, ControlsDatagram, ItemType, PlayerDatagram, UpdateDatagram } from "jump-out-shared";
import { Player } from "./player";
import { LoadMap, mapData } from "./mapData";
import { Projectile } from "./projectile";
import { TankEvent } from "./event";
import { Item, ItemSpawner } from "./item";

LoadMap("../maps/map1.png");
let server = createServer(function (request, response) {});

let port = process.env.PORT || 20003;
server.listen(port, function () {
    console.log(new Date() + " WS Server is listening on port " + port);
});

let wsServer = new WebSocketServer({ server });
wsServer.on("connection", onConnection);

export let connections: WebSocket[] = [];

let buffer = new ArrayBuffer(10000);
let av = new AutoView(buffer);

function onConnection(connection: WebSocket) {
    console.log("new connection");
    connection.send(av);
    connections.push(connection);
    let player = new Player(connections.length);
    connection.on("message", (message) => onMessage(message as Buffer, player.id));
}

function onMessage(message: Buffer, playerId: number) {
    if (Player.list.has(playerId)) {
        let inView = new AutoView(message.buffer.slice(message.byteOffset, message.byteOffset + message.byteLength));
        ControlsDatagram.deserealise(inView, Player.list.get(playerId));
    }
}
/*
new Timer(()=>{
    let p = new Projectile();
    p.position = new Vector(2000, 1800);
    p.rotation = Math.PI;
    p.evaluateVelocity();
}, 2000, 0);
*/
function main(dt: number) {
    dt = 1000 / 30;
    av.index = 0;
    let players = [];

    let projectiles = [];
    ItemSpawner(dt);

    for (const projectile of Projectile.list.values()) {
        projectile.update(dt);
        projectiles.push(projectile);
    }

    let items = [];
    for (const item of Item.list.values()) {
        item.update(dt);
        if (Item.list.has(item.id)) {
            items.push(item);
        }
    }

    for (const player of Player.list.values()) {
        player.update(dt);
        players.push(player);
    }

    let updateObject = {
        players: players,
        projectiles: projectiles,
        events: TankEvent.list,
        deaths: Player.deaths,
        items: items,
        itemsRemove: Item.remove,
    };

    UpdateDatagram.serialise(av, updateObject);
    TankEvent.list = [];
    Player.deaths = [];
    Item.remove = [];
    let buffer = av.buffer.slice(0, av.index + 16);

    for (const connection of connections) {
        let pav = new AutoView(buffer);
        pav.index = buffer.byteLength - 16;
        pav.writeInt32(connections.indexOf(connection) + 1);
        let ply = Player.list.get(connections.indexOf(connection)+1);
        if (ply != undefined) {
            for (let i = 0; i < 3; i++) {
                if (ply.inventory.has(i)) {
                    pav.writeInt32(ply.inventory.get(i));
                    
                } else {
                    pav.writeInt32(0);
                }
            }
        }else{
            for (let i = 0; i < 3; i++) {
                pav.writeInt32(0);
            }
        }

        connection.send(buffer);
    }
}

loop.updateOrder.push(Timer.updateTimers);
loop.updateOrder.push(main);
loop.start();