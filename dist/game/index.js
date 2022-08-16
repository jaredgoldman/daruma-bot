"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const settings_1 = __importDefault(require("../settings"));
const helpers_1 = require("../utils/helpers");
const embeds_1 = __importDefault(require("../embeds"));
const embeds_2 = require("../constants/embeds");
const __1 = require("..");
const helpers_2 = require("../utils/helpers");
const runGame_1 = __importDefault(require("./runGame"));
async function startWaitingRoom(channel) {
    const { maxCapacity } = settings_1.default[channel.id];
    const game = __1.games[channel.id];
    (0, helpers_1.resetGame)(false, channel.id);
    game.megatron = await channel.send((0, embeds_1.default)(embeds_2.Embeds.waitingRoom, game));
    game.waitingRoom = true;
    let playerCount = 0;
    const getPlayerCount = () => Object.values(game.players).length;
    while (playerCount < maxCapacity && game.waitingRoom) {
        if (game.update) {
            await game.megatron.edit((0, embeds_1.default)(embeds_2.Embeds.waitingRoom, game));
            playerCount = getPlayerCount();
        }
        await (0, helpers_2.wait)(1000);
    }
    if (game.waitingRoom)
        game.waitingRoom = false;
    await (0, helpers_2.wait)(2000);
    game.active = true;
    (0, runGame_1.default)(game);
}
exports.default = startWaitingRoom;
