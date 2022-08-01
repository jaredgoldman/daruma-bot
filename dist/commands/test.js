"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Discord
const builders_1 = require("@discordjs/builders");
module.exports = {
    data: new builders_1.SlashCommandBuilder()
        .setName('test-command')
        .setDescription('test command'),
    async execute(interaction) { },
};
