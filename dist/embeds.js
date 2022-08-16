"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Discord
const discord_js_1 = require("discord.js");
const embeds_1 = require("./constants/embeds");
// Helpers
const helpers_1 = require("./utils/helpers");
const defaultEmbedValues = {
    title: 'DarumaBot',
    description: 'placeholder',
    color: 'DarkAqua',
    footer: {
        text: 'placeholder',
        iconUrl: '#',
    },
    rawEmbed: false,
};
function doEmbed(type, game, options) {
    let data = {};
    let components = [];
    const playerArr = Object.values(game.players);
    const playerCount = playerArr.length;
    if (type === embeds_1.Embeds.waitingRoom) {
        const playerWord = playerCount === 1 ? 'player' : 'players';
        const hasWord = playerCount === 1 ? 'has' : 'have';
        data = {
            title: 'Waiting Room',
            description: `${playerCount} ${playerWord} ${hasWord} joined the game.`,
            files: [],
            fields: playerArr.map((player) => {
                return {
                    name: player.username,
                    value: player.asset.alias || player.asset.assetName,
                };
            }),
        };
        components.push(new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder()
            .setCustomId('select-attacker')
            .setLabel('Choose your Daruma')
            .setStyle(discord_js_1.ButtonStyle.Primary), new discord_js_1.ButtonBuilder()
            .setCustomId('begin-game')
            .setLabel('Start game')
            .setStyle(discord_js_1.ButtonStyle.Secondary), new discord_js_1.ButtonBuilder()
            .setCustomId('withdraw-player')
            .setLabel('Withdraw Daruma')
            .setStyle(discord_js_1.ButtonStyle.Danger)));
    }
    let { title, description, color, image, thumbNail, fields, footer, files, rawEmbed, } = Object.assign(Object.assign({}, defaultEmbedValues), data);
    const embed = new discord_js_1.EmbedBuilder();
    let thumbNailUrl;
    if (thumbNail) {
        thumbNailUrl = (0, helpers_1.normalizeIpfsUrl)(thumbNail);
    }
    title && embed.setTitle(title);
    description && embed.setDescription(description);
    color && embed.setColor(color);
    image && embed.setImage(image);
    thumbNailUrl && embed.setThumbnail(thumbNailUrl);
    (fields === null || fields === void 0 ? void 0 : fields.length) && embed.addFields(fields);
    footer && embed.setFooter(footer);
    if (rawEmbed) {
        return embed;
    }
    return {
        embeds: [embed],
        fetchReply: true,
        //@ts-ignore
        components,
        files: (files === null || files === void 0 ? void 0 : files.length) ? files : undefined,
    };
}
exports.default = doEmbed;
