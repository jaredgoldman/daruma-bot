"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Round = void 0;
// This model represents a player enrolled in a battle
class Player {
    constructor(username, discordId, address, asset, userId, rounds, totalScore) {
        this.username = username;
        this.discordId = discordId;
        this.address = address;
        this.asset = asset;
        this.userId = userId;
        this.rounds = rounds;
        this.totalScore = totalScore;
        this.rounds = [];
    }
}
exports.default = Player;
class Round {
    constructor(damage, roundNumber, diceValue, isWin) {
        this.damage = damage;
        this.roundNumber = roundNumber;
        this.diceValue = diceValue;
        this.isWin = isWin;
    }
}
exports.Round = Round;
