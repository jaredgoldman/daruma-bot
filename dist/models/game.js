"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Game {
    constructor(players, active, win, megatron, npc, embed, waitingRoom, stopped, update) {
        this.players = players;
        this.active = active;
        this.win = win;
        this.megatron = megatron;
        this.npc = npc;
        this.embed = embed;
        this.waitingRoom = waitingRoom;
        this.stopped = stopped;
        this.update = update;
    }
}
exports.default = Game;
