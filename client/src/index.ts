import { AutoView, BaseObject, Vector, transfer } from "jump-engine";
import {
    Controls,
    ControlsDatagram,
    EventType,
    PlayerData,
    ProjectileData,
    TankEventData,
    UpdateDatagram,
} from "jump-out-shared";
import * as PIXI from "pixi.js";
import { audioBuffers, LoadAudio, LoadImages } from "./loader";
import { control, fire, useKeys, target } from "./controls";
import { PopText } from "./text";
import { Player } from "./player";
import { Projectile } from "./projectile";

export let audioCtx = new AudioContext();


let canvas = document.getElementById("canvas") as HTMLCanvasElement;
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let real = new PIXI.Container();
export let container = new PIXI.Container();
export let shadowContainer = new PIXI.Container();
export let graphics = new PIXI.Graphics();


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
    real.addChild(graphics);

    real.scale.set(canvas.height / height);
    //real.scale.set(1);
    app.stage.addChild(real);
    app.stage.addChild(score);


    explosionTextures.push(PIXI.Loader.shared.resources["explosion1"].texture);
    explosionTextures.push(PIXI.Loader.shared.resources["explosion2"].texture);
    explosionTextures.push(PIXI.Loader.shared.resources["explosion3"].texture);
    explosionTextures.push(PIXI.Loader.shared.resources["explosion2"].texture);
    explosionTextures.push(PIXI.Loader.shared.resources["explosion1"].texture);

    if (window.location.host.includes("coal")) {
        connection = new WebSocket("wss://tank-game.ws.coal.games/");
    } else {
        connection = new WebSocket("ws://10.200.140.6:20003/");
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

LoadAudio();

let aimAngle = 0;
let driveSound = new Audio("./music/drive.wav");
let driveAudio = audioCtx.createMediaElementSource(driveSound);
driveAudio.connect(audioCtx.destination);
driveSound.volume = 0.1;
driveSound.loop = true;

let shootSound = new Audio("./music/cannon.wav");

function update(dt: number) {
    //real.filters = [new PIXI.filters.NoiseFilter(.5)];

    if (localPlayer) {
        aimAngle = moduloPi(target.toAngle() - localPlayer.rotation);
        //console.log(aimAngle, localPlayer.turretAngle);
        if (control.y != 0) {
            driveSound.play();
        }
        else if (!driveSound.paused) {
            driveSound.pause()
        }

    }
    graphics.clear();
    graphics.beginFill(0xFFAAFF);

    Projectile.list.forEach(proj => {
        proj.update(dt)
    })

    graphics.endFill();

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
        ControlsDatagram.serialise(outgoing, { movement: control, fire: fire, useKeys: useKeys, aimAngle: aimAngle });
        connection.send(outgoing);
    }
}, 1000 / 30);

let projectiles: Array<PIXI.Sprite> = [];

let playerData: Array<PlayerData> = [];
let projectileData: Array<ProjectileData> = [];

let myPosition: Vector;

export let localPlayer: Player;

export function getGlobalPos(sprite: PIXI.Container) {
    return getParentPos(sprite, new Vector()).mult(1);
}

function getParentPos(sprite: PIXI.Container, pos: Vector): Vector {
    let parent = sprite.parent;
    if (sprite == app.stage) return pos;
    let newVector = Vector.fromAngle(new Vector(sprite.position.x, sprite.position.y).toAngle() + parent.rotation).mult(new Vector(sprite.position.x, sprite.position.y).length());
    pos.add(newVector);
    pos.x *= parent.scale.x;
    pos.y *= parent.scale.y;
    return getParentPos(parent, pos);
}

function onConnectionMessage(e: MessageEvent) {
    let inView = new AutoView(e.data);
    let data = UpdateDatagram.deserealise(inView);
    let myId = inView.readInt32();
    playerData = data.players;
    projectileData = data.projectiles;
    let deaths = data.deaths;

    let eventData = data.events;

    for (const death of deaths) {
        Player.remove(death.tankId);
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
            localPlayer = player;
        }
    }
    for (let i = 0; i < projectileData.length; i++) {
        if (!Projectile.list.has(projectileData[i].id)) {
            new Projectile(projectileData[i].id);
        }
        let projectile = Projectile.list.get(projectileData[i].id);
        transfer(projectile, projectileData[i]);
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
                //shootSound.playbackRate = Math.random() * 0.2 + 0.9;
                playAudio("cannon", Math.min(1, 800 / myPosition.distance(event.position)) * 0.05);


                //shootSound.volume = Math.min(1, 800 / myPosition.distance(event.position)) * 0.2;
                //shootSound.play();
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
function moduloPi(rot: number): number {
    while (rot > Math.PI) rot -= Math.PI * 2;
    while (rot < -Math.PI) rot += Math.PI * 2;
    return rot;
}

function playAudio(bufferName: string, volume: number) {
    if (audioBuffers[bufferName]) {
        let audioSource = audioCtx.createBufferSource();
        audioSource.buffer = audioBuffers[bufferName];
        let gainNode = audioCtx.createGain();
        gainNode.gain.value = 0.05;
        audioSource.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        audioSource.start();
    }
    else {
        console.error("Sound '" + bufferName + "' is not a loaded buffer!")
    }
    //console.log(shootAudio);
}