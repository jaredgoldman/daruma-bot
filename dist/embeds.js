"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Discord
const discord_js_1 = require("discord.js");
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
function doEmbed(type, options) {
    let data = {};
    let components = [];
    // Waiting Room
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
