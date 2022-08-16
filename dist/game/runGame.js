"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const helpers_1 = require("../utils/helpers");
async function runGame(game) {
    const playerArr = Object.values(game.players);
    // loop through each player in the game taking turns rolling
    await (0, helpers_1.asyncForEach)(playerArr, async (player) => {
        // three times to damage the NPC
        for (let i = 1; i <= 3; i++) { }
    });
    // handle 21 rules logic in seperate tested function
}
exports.default = runGame;
