import { Vector } from "jump-engine";
import { getGlobalPos, localPlayer } from ".";
export let keymap: Map<string, boolean> = new Map();
export let control: Vector = new Vector();
export let fire: number = 0;
export let useKeys: number = 0;
export let target: Vector = new Vector();

window.addEventListener("keydown", (event) => {
    keymap.set(event.key, true);
    control.x = pnz(keymap.get("d"), keymap.get("a"));
    control.y = pnz(keymap.get("w"), keymap.get("s"));
    fire = keymap.get(" ") || keymap.get("Mouse1") ? 1 : 0;

    useKeys = 0;
    useKeys += keymap.get("+") || keymap.get("1") ? 1 : 0;
    useKeys += keymap.get("ě") || keymap.get("2") ? 2 : 0;
    useKeys += keymap.get("š") || keymap.get("3") ? 4 : 0;
    useKeys += keymap.get("č") || keymap.get("4") ? 8 : 0;
    useKeys += keymap.get("ř") || keymap.get("5") ? 16 : 0;

});

window.addEventListener("keyup", (event) => {
    keymap.set(event.key, false);
    control.x = pnz(keymap.get("d"), keymap.get("a"));
    control.y = pnz(keymap.get("w"), keymap.get("s"));
    fire = keymap.get(" ") || keymap.get("Mouse1") ? 1 : 0;
    useKeys = 0;
    useKeys += keymap.get("+") || keymap.get("1") ? 1 : 0;
    useKeys += keymap.get("ě") || keymap.get("2") ? 2 : 0;
    useKeys += keymap.get("š") || keymap.get("3") ? 4 : 0;
    useKeys += keymap.get("č") || keymap.get("4") ? 8 : 0;
    useKeys += keymap.get("ř") || keymap.get("5") ? 16 : 0;
});

window.addEventListener("mousedown", (event) => {
    keymap.set("Mouse1", true);
    fire = keymap.get(" ") || keymap.get("Mouse1") ? 1 : 0;
});

window.addEventListener("mouseup", (event) => {
    keymap.set("Mouse1", false);
    fire = keymap.get(" ") || keymap.get("Mouse1") ? 1 : 0;
});

window.addEventListener("mousemove", (event) => {
    if (localPlayer) {
        let globalPos = getGlobalPos(localPlayer.turret)
        //console.log(globalPos);
        target.x = event.clientX - globalPos.x;
        target.y = event.clientY - globalPos.y;

    }

})

function pnz(positive: boolean, negative: boolean): number {
    return positive && negative ? 0 : positive ? 1 : negative ? -1 : 0;
}
