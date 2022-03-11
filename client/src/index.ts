import { AutoView, BaseObject, Vector, transfer } from "jump-engine";
import {
    Controls,
    ControlsDatagram,
    EventType,
    ItemType,
    PlayerData,
    ProjectileData,
    TankEventData,
    UpdateDatagram,
} from "jump-out-shared";
import * as PIXI from "pixi.js";
import { LoadImages } from "./loader";
import { control, fire, useKeys } from "./controls";
import { PopText } from "./text";
import { Player } from "./player";
import { Item, powerupNames } from "./item";

let canvas = document.getElementById("canvas") as HTMLCanvasElement;
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let real = new PIXI.Container();
export let container = new PIXI.Container();
export let shadowContainer = new PIXI.Container();
export let itemContainer = new PIXI.Container();
let graphics = new PIXI.Graphics();
graphics.beginFill(0x000000);
graphics.drawRect(0, 0, canvas.width, 100);
graphics.endFill();

graphics.beginFill(0x000000);
graphics.drawRect(0, 100, 500, 350);
graphics.endFill();
graphics.alpha = 0.3;
itemContainer.addChild(graphics);

let app = new PIXI.Application({
    antialias: true,
    view: canvas,
    width: canvas.width,
    height: canvas.height,
    backgroundColor: 0x1099bb,
});
app.stop();
PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

let networkReady = false;
let connection: WebSocket;

let score = new PIXI.Text("", { fill: 0xffffff });
score.position.set(10, 110);

let explosionTextures: Array<PIXI.Texture> = [];
LoadImages(() => {
    let height = PIXI.Loader.shared.resources["map1"].texture.height;
    real.addChild(new PIXI.Sprite(PIXI.Loader.shared.resources["map1"].texture));
    real.addChild(shadowContainer);
    real.addChild(container);
    real.addChild(new PIXI.Sprite(PIXI.Loader.shared.resources["map1_wall"].texture));

    real.scale.set(canvas.height / height);
    app.stage.addChild(real);
    app.stage.addChild(itemContainer);
    app.stage.addChild(score);

    for (let i = 0; i < 3; i++) {
        inventorySprites.push(new PIXI.Sprite());
        inventorySprites[i].anchor.set(0.5);
        inventorySprites[i].position.x = canvas.width / 2 - 100 + i * 100;
        inventorySprites[i].position.y = 45;
        inventorySprites[i].scale.set(0.5);
        itemContainer.addChild(inventorySprites[i]);
        let text = new PIXI.Text("[" + (i + 1) + "]", { fill: 0xffffff, fontSize: 15 });
        text.anchor.set(0.5);
        text.position.x = canvas.width / 2 - 100 + i * 100;
        text.position.y = 85;
        itemContainer.addChild(inventorySprites[i]);
        itemContainer.addChild(text);
    }

    explosionTextures.push(PIXI.Loader.shared.resources["explosion1"].texture);
    explosionTextures.push(PIXI.Loader.shared.resources["explosion2"].texture);
    explosionTextures.push(PIXI.Loader.shared.resources["explosion3"].texture);
    explosionTextures.push(PIXI.Loader.shared.resources["explosion2"].texture);
    explosionTextures.push(PIXI.Loader.shared.resources["explosion1"].texture);
    
    if (window.location.host.includes("coal")) {
        connection = new WebSocket("wss://tank-game.ws.coal.games/");
    }else{
        connection = new WebSocket("ws://127.0.0.1:20003/");
    }

    connection.binaryType = "arraybuffer";
    connection.onopen = onConnectionOpen;
    connection.onmessage = onConnectionMessage;
    connection.onclose = onConnectionClose;
    function onConnectionOpen() {
        console.log("open");
        networkReady = true;
    }

    for (let i = 0; i < 30; i++) {
        projectiles[i] = new PIXI.Sprite(PIXI.Loader.shared.resources["bullet"].texture);
        projectiles[i].anchor.set(0.5);
        projectiles[i].visible = false;
        container.addChild(projectiles[i]);
    }
    app.ticker.add(update);
    app.start();
});

function update(dt: number) {
    for (let i = 0; i < projectileData.length; i++) {
        projectiles[i].position.x += (projectileData[i].velocity.x * dt * 1000) / 60;
        projectiles[i].position.y += (projectileData[i].velocity.y * dt * 1000) / 60;
    }
    real.filters = [new PIXI.filters.NoiseFilter(0.05)];

    for (const poptext of PopText.list) {
        poptext.update(dt);
    }

    score.text = "";
    let plys = Array.from(Player.list.values());
    plys.sort((a, b) => {
        return b.kills - a.kills;
    });

    for (let i = 0; i < plys.length; i++) {
        const player = plys[i];
        player.update(dt);
        if (i < 10) {
            score.text += player.name + ": " + player.kills + "\n";
        }
    }
}
let inventorySprites: Array<PIXI.Sprite> = [];

let outgoing = new AutoView(new ArrayBuffer(100));
setInterval(() => {
    if (networkReady) {
        outgoing.index = 0;
        ControlsDatagram.serialise(outgoing, { movement: control, fire: fire, useKeys: useKeys });
        connection.send(outgoing);
    }
}, 1000 / 30);

let projectiles: Array<PIXI.Sprite> = [];

let playerData: Array<PlayerData> = [];
let projectileData: Array<ProjectileData> = [];

let myPosition: Vector;

function onConnectionMessage(e: MessageEvent) {
    let inView = new AutoView(e.data);
    let data = UpdateDatagram.deserealise(inView);
    let myId = inView.readInt32();
    playerData = data.players;
    projectileData = data.projectiles;
    let deaths = data.deaths;
    let items = data.items;
    let itemsRemove = data.itemsRemove;

    let eventData = data.events;
    for (let i = 0; i < 3; i++) {
        let item = inView.readInt32();
        if (item == 0) {
            inventorySprites[i].visible = false;
        } else {
            if (item < 4) {
                inventorySprites[i].visible = true;
                inventorySprites[i].texture = PIXI.Loader.shared.resources[powerupNames.get(item)].texture;
            }
        }
    }

    for (const remove of itemsRemove) {
        Item.remove(remove.itemId);
    }

    for (const death of deaths) {
        Player.remove(death.tankId);
    }

    for (let i = 0; i < items.length; i++) {
        let item: Item;
        if (!Item.list.has(items[i].id)) {
            item = new Item(items[i].id);
            transfer(item, items[i]);
            item.init();
        } else {
            item = Item.list.get(items[i].id);
            transfer(item, items[i]);
        }
    }

    for (let i = 0; i < playerData.length; i++) {
        if (!Player.list.has(playerData[i].id)) {
            new Player(playerData[i].id);
        }

        let player = Player.list.get(playerData[i].id);
        transfer(player, playerData[i]);

        if (playerData[i].id == myId) {
            real.position.set(
                -playerData[i].position.x * real.scale.x + canvas.width / 2,
                -playerData[i].position.y * real.scale.y + canvas.height / 2
            );
            myPosition = playerData[i].position;
        }
    }

    for (let i = 0; i < projectiles.length; i++) {
        projectiles[i].visible = false;
    }
    for (let i = 0; i < projectileData.length; i++) {
        projectiles[i].position.x = projectileData[i].position.x - projectileData[i].velocity.x;
        projectiles[i].position.y = projectileData[i].position.y - projectileData[i].velocity.y;
        projectiles[i].rotation = projectileData[i].rotation;

        if (projectileData[i].destroy == 0) {
            projectiles[i].visible = true;
        } else {
            projectiles[i].visible = false;
        }
    }

    for (const event of eventData) {
        switch (event.type) {
            case EventType.hit:
                new PopText("HIT!", event.position, real, 0xffaa00);
                let explosion = new PIXI.AnimatedSprite(explosionTextures, true);
                explosion.animationSpeed = 0.2;
                explosion.anchor.set(0.5);
                explosion.loop = false;
                explosion.rotation = Math.random() * Math.PI * 2;
                explosion.play();
                explosion.position.x = event.position.x;
                explosion.position.y = event.position.y;
                explosion.onComplete = () => {
                    explosion.destroy();
                };
                container.addChild(explosion);
                break;

            case EventType.shoot:
                new PopText("BANG!", event.position, real, 0xffaa00);
                let shootSound = new Audio("./music/shoot.ogg");
                shootSound.playbackRate = Math.random() * 0.2 + 0.9;
                shootSound.volume = Math.min(1, 1000 / myPosition.distance(event.position)) * 0.2;
                shootSound.play();
                break;

            case EventType.bounce:
                new PopText("BOUNCE!", event.position, real, 0xffaa00);
                break;

            default:
                break;
        }
    }
}

function onConnectionClose(e: CloseEvent) {
    console.log("close");
}
