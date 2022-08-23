"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rollDice = void 0;
const shared_1 = require("../utils/shared");
const settings_1 = __importDefault(require("../settings"));
const game_1 = require("../mocks/game");
async function runGame(game, test) {
    const { rollInterval } = test ? game_1.settings : settings_1.default[game.channelId];
    try {
        const playerArr = Object.values(game.players);
        game.rolls = 1;
        while (!game.win) {
            // loop through each player
            await (0, shared_1.asyncForEach)(playerArr, async (player) => {
                const currentRoundNumber = game.roundNumber;
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
                // add new playerRoll to
                const roll = {
                    damage,
                    roundNumber: game.roundNumber || 1,
                    numberRolled,
                    isWin: game.win,
                };
                const currentRound = player.rounds[currentRoundNumber];
                // Create round array with first roll or push new roll into existing array
                // Also update totalDamage
                if (!currentRound) {
                    player.rounds[currentRoundNumber] = {
                        rolls: [roll],
                        totalDamage: damage,
                    };
                }
                else {
                    currentRound.rolls.push(roll);
                    currentRound.totalDamage += damage;
                }
                // perform non-test behaviour
                if (!test) {
                    await (0, shared_1.wait)(rollInterval);
                }
            });
            mutateEmbed(game_1.players, game.roundNumber);
            // if we're on the third roll, update rounds
            if (game.rolls % 3 === 0)
                game.roundNumber++;
            game.rolls++;
        }
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
const mutateEmbed = (players, roundNumber) => {
    const playerArr = Object.values(players);
    let board = '-'.repeat(10) + '\n';
    // FOR EACH PLAYER
    playerArr.forEach((player) => {
        board += createPlayerRow(player, roundNumber) + '\n';
    });
    board = board += '-'.repeat(10) + '\n';
    return board;
};
const createPlayerRow = (player, roundNumber) => {
    const { rounds } = player;
    const isFirstRound = roundNumber === 1;
    const prevRoundNumber = roundNumber - 1;
    const currentRound = rounds[roundNumber];
    const prevRound = rounds[prevRoundNumber];
    // FIRST ROW
    const firstRow = isFirstRound
        ? `round 1`
        : `round: ${prevRoundNumber}    round: ${roundNumber}`;
    // SECOND ROW
    let secondRow = '';
    if (!isFirstRound) {
        secondRow += mapRoundsForSecondRow(prevRound);
    }
    secondRow += mapRoundsForSecondRow(currentRound);
    // THIRD ROW
    const thirdRow = isFirstRound
        ? `      ${currentRound.totalDamage}`
        : `      ${prevRound.totalDamage}           ${currentRound.totalDamage}`;
    return firstRow + '\n' + '| ' + secondRow + '\n' + thirdRow;
};
const mapRoundsForSecondRow = (round) => {
    var _a, _b, _c;
    const { rolls } = round;
    return `${((_a = rolls[0]) === null || _a === void 0 ? void 0 : _a.damage) || ' '} - ${((_b = rolls[1]) === null || _b === void 0 ? void 0 : _b.damage) || ' '} - ${((_c = rolls[2]) === null || _c === void 0 ? void 0 : _c.damage) || ' '} | `;
};
