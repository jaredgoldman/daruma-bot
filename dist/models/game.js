"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Game {
    constructor(players, active, win, capacity, channelId, roundNumber, rolls, megatron, npc, embed, waitingRoom, stopped, update, winnerDiscordId) {
        this.players = players;
        this.active = active;
        this.win = win;
        this.capacity = capacity;
        this.channelId = channelId;
        this.roundNumber = roundNumber;
        this.rolls = rolls;
        this.megatron = megatron;
        this.npc = npc;
        this.embed = embed;
        this.waitingRoom = waitingRoom;
        this.stopped = stopped;
        this.update = update;
        this.winnerDiscordId = winnerDiscordId;
    }
}
exports.default = Game;
