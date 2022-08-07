"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processRegistration = void 0;
const builders_1 = require("@discordjs/builders");
// Data
const database_service_1 = require("../database/database.service");
// Helpers
const algorand_1 = require("../utils/algorand");
const helpers_1 = require("../utils/helpers");
// Schemas
const user_1 = __importDefault(require("../models/user"));
const user_2 = require("../database/operations/user");
// Globals
const optInAssetId = Number(process.env.OPT_IN_ASSET_ID);
const unitName = process.env.UNIT_NAME;
const registeredRoleId = process.env.REGISTERED_ID;
module.exports = {
    data: new builders_1.SlashCommandBuilder()
        .setName('register')
        .setDescription('register for When AOWLS Attack')
        .addStringOption((option) => option
        .setName('address')
        .setDescription('enter the your wallet address')
        .setRequired(true)),
    enabled: true,
    async execute(interaction) {
        if (!interaction.isCommand())
            return;
        const { user, options, channelId } = interaction;
        const { username, id } = user;
        //@ts-ignore
        const address = options.getString('address');
        if (address && !/^[a-zA-Z0-9]{58}$/.test(address)) {
            return interaction.reply({
                content: 'Please enter a valid Algorand wallet address',
                ephemeral: true,
            });
        }
        await interaction.deferReply({ ephemeral: true });
        await interaction.followUp({
            content: 'Thanks for registering! This might take a while! Please check back in a few minutes',
            ephemeral: true,
        });
        if (address) {
            const { status, registeredUser, asset } = await (0, exports.processRegistration)(username, id, address, channelId);
            // add permissions if succesful
            if (registeredUser && asset) {
                (0, helpers_1.addRole)(interaction, registeredRoleId, registeredUser);
            }
            await interaction.followUp({
                ephemeral: true,
                content: status,
            });
        }
    },
};
const processRegistration = async (username, discordId, address, channelId) => {
    var _a;
    try {
        // Attempt to find user in db
        let user = await (0, user_2.findUserByDiscordId)(discordId);
        // Check to see if wallet has opt-in asset
        // Retreive assetIds from specific collections
        const { walletOwned, nftsOwned } = await (0, algorand_1.determineOwnership)(address, channelId);
        const keyedNfts = {};
        nftsOwned.forEach((nft) => {
            keyedNfts[nft.assetId] = nft;
        });
        if (!(nftsOwned === null || nftsOwned === void 0 ? void 0 : nftsOwned.length)) {
            return {
                status: `You have no ${unitName}s in this wallet. Please try again with a different address`,
            };
        }
        if (!walletOwned) {
            return {
                status: `Looks like you haven't opted in to to asset ${optInAssetId}. Please opt in on Rand Gallery by using this link: https://www.randgallery.com/algo-collection/?address=${optInAssetId}`,
            };
        }
        // If user doesn't exist, add to db and grab instance
        if (!user) {
            const userEntry = new user_1.default(username, discordId, address, keyedNfts);
            const { acknowledged, insertedId } = await ((_a = database_service_1.collections.users) === null || _a === void 0 ? void 0 : _a.insertOne(userEntry));
            if (acknowledged) {
                user = await (0, user_2.findUserById)(insertedId);
            }
            else {
                return {
                    status: 'Something went wrong during registration, please try again',
                };
            }
        }
        else {
            await (0, user_2.updateUser)({ assets: keyedNfts, address: address }, user._id);
        }
        return {
            status: `Registration complete! Enjoy the game.`,
            registeredUser: user,
        };
    }
    catch (error) {
        console.log('*** REGISTRATION ERROR ***', error);
        return {
            status: 'Something went wrong during registration, please try again',
        };
    }
};
exports.processRegistration = processRegistration;
