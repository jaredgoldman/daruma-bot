"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rollDice = void 0;
const shared_1 = require("../utils/shared");
const player_1 = require("../models/player");
const settings_1 = __importDefault(require("../settings"));
async function runGame(game, test) {
    const { rollInterval } = settings_1.default[game.channelId];
    try {
        game.rounds = 0;
        const playerArr = Object.values(game.players);
        let roundNumber = 1;
        while (!game.win) {
            // loop through each player
            await (0, shared_1.asyncForEach)(playerArr, async (player) => {
                // roll six-sided die
                const { damage, numberRolled } = (0, exports.rollDice)();
                // increment score
                player.totalScore += damage;
                // determine if isWin
                if (player.totalScore === 21) {
                    game.winnerDiscordId = player.discordId;
                    game.win = true;
                }
                // if over 21
                if (player.totalScore > 21) {
                    player.totalScore = 15;
                }
                // add new playerRound to
                const playerRound = new player_1.Round(damage, roundNumber, numberRolled, false);
                player.rounds.push(playerRound);
                // perform non-test behaviour
                if (!test) {
                    await (0, shared_1.wait)(rollInterval);
                    await mutateEmbed();
                }
            });
            roundNumber++;
        }
        game.rounds = roundNumber;
        game.active = false;
    }
    catch (error) {
        console.log(error);
    }
}
exports.default = runGame;
const diceValues = {
    1: 1,
    2: 1,
    3: 2,
    4: 2,
    5: 3,
    6: 3,
};
const rollDice = () => {
    const ref = Math.floor(Math.random() * 6) + 1;
    return {
        damage: diceValues[ref],
        numberRolled: ref,
    };
};
exports.rollDice = rollDice;
const mutateEmbed = async () => {
    // update embed
};
