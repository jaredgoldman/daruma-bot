"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// This model represents a player enrolled in a battle
class Player {
    constructor(username, discordId, address, asset, userId, hp, rounds) {
        this.username = username;
        this.discordId = discordId;
        this.address = address;
        this.asset = asset;
        this.userId = userId;
        this.hp = hp;
        this.rounds = rounds;
    }
}
exports.default = Player;
