"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TankEvent = void 0;
class TankEvent {
    constructor(type, position) {
        this.type = type;
        this.position = position;
        TankEvent.list.push(this);
    }
}
exports.TankEvent = TankEvent;
TankEvent.list = [];
//# sourceMappingURL=event.js.map