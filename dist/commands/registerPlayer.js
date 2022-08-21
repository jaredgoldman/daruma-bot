"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const builders_1 = require("@discordjs/builders");
// Data
const database_service_1 = require("../database/database.service");
// Schemas
const asset_1 = __importDefault(require("../models/asset"));
const player_1 = __importDefault(require("../models/player"));
// Helpers
const helpers_1 = require("../utils/helpers");
// Globals
const __1 = require("..");
const settings_1 = __importDefault(require("../settings"));
module.exports = {
    data: new builders_1.SlashCommandBuilder()
        .setName('register-player')
        .setDescription('Register an active player'),
    async execute(interaction) {
        try {
            if (!interaction.isSelectMenu())
                return;
            const channelId = interaction.channelId;
            const game = __1.games[channelId];
            const channelSettings = settings_1.default[channelId];
            if (!game.waitingRoom)
                return;
            const { values, user } = interaction;
            const assetId = values[0];
            const { username, id } = user;
            const { imageDir, playerHp, maxCapacity } = channelSettings;
            // Check if user is another game
            if ((0, helpers_1.checkIfRegisteredPlayer)(__1.games, assetId, id)) {
                return interaction.reply({
                    ephemeral: true,
                    content: `You can't register with the same asset in two games at a time`,
                });
            }
            // Check for game capacity, allow already registered user to re-register
            // even if capacity is full
            if (Object.values(game.players).length < maxCapacity ||
                game.players[id]) {
                await interaction.deferReply({ ephemeral: true });
                const { assets, address, _id, coolDowns } = (await database_service_1.collections.users.findOne({
                    discordId: user.id,
                }));
                const asset = assets[assetId];
                if (!asset) {
                    return;
                }
                const coolDown = coolDowns ? coolDowns[assetId] : null;
                if (coolDown && coolDown > Date.now()) {
                    const minutesLeft = Math.floor((coolDown - Date.now()) / 60000);
                    const minuteWord = minutesLeft === 1 ? 'minute' : 'minutes';
                    return interaction.editReply({
                        content: `Please wait ${minutesLeft} ${minuteWord} before playing ${asset.assetName} again`,
                    });
                }
                let localPath;
                try {
                    localPath = await (0, helpers_1.downloadFile)(asset, imageDir, username);
                }
                catch (error) {
                    console.log('download error', error);
                }
                if (!localPath) {
                    return;
                }
                const gameAsset = new asset_1.default(asset.assetId, asset.assetName, asset.url, asset.unitName, localPath, asset.alias);
                // check again for capacity once added
                if (Object.values(game.players).length >= maxCapacity &&
                    !game.players[id]) {
                    return interaction.editReply('Sorry, the game is at capacity, please wait until the next round');
                }
                game.players[id] = new player_1.default(username, id, address, gameAsset, _id, [], 0);
                await interaction.editReply(`${asset.alias || asset.assetName} has entered the game`);
                (0, helpers_1.updateGame)(game);
            }
            else {
                interaction.reply({
                    content: 'Sorry, the game is at capacity, please wait until the next round',
                    ephemeral: true,
                });
            }
        }
        catch (error) {
            console.log(error);
        }
    },
};
