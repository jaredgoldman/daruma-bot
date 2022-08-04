"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class User {
    constructor(username, discordId, address, assets, karma, losses, 
    //key: EnhancerType
    enhancers, totalBattles, wins, _id, coolDowns // timestamp
    ) {
        this.username = username;
        this.discordId = discordId;
        this.address = address;
        this.assets = assets;
        this.karma = karma;
        this.losses = losses;
        this.enhancers = enhancers;
        this.totalBattles = totalBattles;
        this.wins = wins;
        this._id = _id;
        this.coolDowns = coolDowns;
    }
}
exports.default = User;
var EnhancerType;
(function (EnhancerType) {
    EnhancerType[EnhancerType["arms"] = 0] = "arms";
    EnhancerType[EnhancerType["legs"] = 1] = "legs";
    EnhancerType[EnhancerType["meditation"] = 2] = "meditation";
})(EnhancerType || (EnhancerType = {}));
