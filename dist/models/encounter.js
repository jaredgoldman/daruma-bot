"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Encounter {
    constructor(winnerId, rounnds, startTime, endTime, gameType) {
        this.winnerId = winnerId;
        this.rounnds = rounnds;
        this.startTime = startTime;
        this.endTime = endTime;
        this.gameType = gameType;
    }
}
exports.default = Encounter;
