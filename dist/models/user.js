"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class User {
    constructor(username, discordId, address, assets, karma, losses, 
    //key: EnhancerType
    enhancers, wins, _id, coolDowns // timestamp
    ) {
        this.username = username;
        this.discordId = discordId;
        this.address = address;
        this.assets = assets;
        this.karma = karma;
        this.losses = losses;
        this.enhancers = enhancers;
        this.wins = wins;
        this._id = _id;
        this.coolDowns = coolDowns;
    }
}
exports.default = User;
