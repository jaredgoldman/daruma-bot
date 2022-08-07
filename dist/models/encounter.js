"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Encounter {
    constructor(winnerId, rounds, startTime, endTime, gameType) {
        this.winnerId = winnerId;
        this.rounds = rounds;
        this.startTime = startTime;
        this.endTime = endTime;
        this.gameType = gameType;
    }
}
exports.default = Encounter;
