// Discord
import { RegistrationResult } from '../types/user'
import { SlashCommandBuilder } from '@discordjs/builders'
// Data
// Helpers
import { determineOwnership } from '../utils/algorand'
import { addRole } from '../utils/helpers'
// Schemas
import User from '../models/user'
import Asset from '../models/asset'
import { Interaction } from 'discord.js'
import {
  findUserByDiscordId,
  findUserById,
  saveUser,
  updateUser,
} from '../database/operations/user'
// Globals

const optInAssetId: number = Number(process.env.OPT_IN_ASSET_ID)
const unitName = process.env.UNIT_NAME as string
const registeredRoleId = process.env.REGISTERED_ID as string

module.exports = {
  data: new SlashCommandBuilder()
    .setName('register')
    .setDescription('register for When Darumas Attack')
    .addStringOption((option) =>
      option
        .setName('address')
        .setDescription('enter the your wallet address')
        .setRequired(true)
    ),
  enabled: true,
  async execute(interaction: Interaction) {
    if (!interaction.isChatInputCommand()) return
    const { user, options, channelId } = interaction
    const { username, id } = user

    const address = options.getString('address')

    if (address && !/^[a-zA-Z0-9]{58}$/.test(address)) {
      return interaction.reply({
        content: 'Please enter a valid Algorand wallet address',
        ephemeral: true,
      })
    }

    await interaction.deferReply({ ephemeral: true })

    await interaction.followUp({
      content:
        'Thanks for registering! This might take a while! Please check back in a few minutes',
      ephemeral: true,
    })
    if (address) {
      const { status, registeredUser, asset } = await processRegistration(
        username,
        id,
        address,
        channelId
      )
      // add permissions if succesful
      if (registeredUser && asset) {
        addRole(interaction, registeredRoleId, registeredUser)
      }

      await interaction.followUp({
        ephemeral: true,
        content: status,
      })
    }
  },
}

export const processRegistration = async (
  username: string,
  discordId: string,
  address: string,
  channelId: string
): Promise<RegistrationResult> => {
  try {
    // Attempt to find user in db
    let user: User | null = await findUserByDiscordId(discordId)

    // Check to see if wallet has opt-in asset
    // Retreive assetIds from specific collections
    const { walletOwned, nftsOwned } = await determineOwnership(
      address,
      channelId
    )

    const keyedNfts: { [key: string]: Asset } = {}
    nftsOwned.forEach((nft: Asset) => {
      keyedNfts[nft.id] = nft
    })

    if (!nftsOwned?.length) {
      return {
        status: `You have no ${unitName}s in this wallet. Please try again with a different address`,
      }
    }

    if (!walletOwned) {
      return {
        status: `Looks like you haven't opted in to to asset ${optInAssetId}. Please opt in on Rand Gallery by using this link: https://www.randgallery.com/algo-collection/?address=${optInAssetId}`,
      }
    }

    // If user doesn't exist, add to db and grab instance
    if (!user) {
      const newUser = new User(username, discordId, address, keyedNfts)
      const { acknowledged, insertedId } = await saveUser(newUser)
      if (acknowledged) {
        user = await findUserById(insertedId)
      } else {
        return {
          status: 'Something went wrong during registration, please try again',
        }
      }
    } else {
      await updateUser(user, user._id, discordId)
    }

    return {
      status: `Registration complete! Enjoy the game.`,
      registeredUser: user,
    }
  } catch (error) {
    console.log('*** REGISTRATION ERROR ***', error)
    return {
      status: 'Something went wrong during registration, please try again',
    }
  }
}
