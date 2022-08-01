"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.client = exports.creatorAddressArr = exports.channel = void 0;
// Discord
const discord_js_1 = require("discord.js");
// Node
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
// Helpers
const database_service_1 = require("./database/database.service");
// Helpers
const algorand_1 = require("./utils/algorand");
const token = process.env.DISCORD_TOKEN;
const creatorAddresses = process.env.CREATOR_ADDRESSES;
const channelId = process.env.CHANNEL_ID;
exports.creatorAddressArr = creatorAddresses.split(',');
exports.client = new discord_js_1.Client({
    restRequestTimeout: 60000,
    intents: [
        discord_js_1.Intents.FLAGS.GUILDS,
        discord_js_1.Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS,
        discord_js_1.Intents.FLAGS.GUILD_MEMBERS,
        discord_js_1.Intents.FLAGS.GUILD_MESSAGES,
    ],
});
exports.client.once('ready', async () => {
    try {
        await (0, database_service_1.connectToDatabase)();
        console.log('Ye Among AOWLs - Server ready');
        let update = true;
        if (!node_fs_1.default.existsSync('dist/txnData/txnData.json')) {
            update = false;
            node_fs_1.default.writeFileSync('dist/txnData/txnData.json', '');
        }
        const txnData = await (0, algorand_1.convergeTxnData)(exports.creatorAddressArr, update);
        node_fs_1.default.writeFileSync('dist/txnData/txnData.json', JSON.stringify(txnData));
        exports.channel = exports.client.channels.cache.get(channelId);
        exports.client.commands = new discord_js_1.Collection();
        const commandsPath = node_path_1.default.join(__dirname, 'commands');
        const commandFiles = node_fs_1.default
            .readdirSync(commandsPath)
            .filter((file) => file.endsWith('.js'));
        for (const file of commandFiles) {
            const filePath = node_path_1.default.join(commandsPath, file);
            const command = require(filePath);
            exports.client.commands.set(command.data.name, command);
        }
    }
    catch (error) {
        console.log('CLIENT ERROR', error);
    }
});
/*
 *****************
 * COMMAND SERVER *
 *****************
 */
exports.client.on('interactionCreate', async (interaction) => {
    let command;
    if (interaction.isCommand()) {
        // ensure two games can't start simultaneously
        // if (
        //   (game?.active || game?.waitingRoom) &&
        //   interaction.commandName === 'start'
        // ) {
        //   return await interaction.reply({
        //     content: 'A game is already running',
        //     ephemeral: true,
        //   })
        // }
        command = exports.client.commands.get(interaction.commandName);
    }
    if (interaction.isSelectMenu() || interaction.isButton()) {
        command = exports.client.commands.get(interaction.customId);
    }
    if (!command)
        return;
    try {
        await command.execute(interaction);
    }
    catch (error) {
        console.error(error);
    }
});
exports.client.login(token);
