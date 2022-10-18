// Discord
import { SlashCommandBuilder } from '@discordjs/builders'
import { Interaction } from 'discord.js'

import {
  findUserByDiscordId,
  findUserById,
  saveUser,
  updateUser,
} from '../database/operations/user'
import Asset from '../models/asset'
import User from '../models/user'
import { RegistrationResult } from '../types/user'
// Data
// Helpers
import {
  determineOwnership,
  optInAssetId,
  unitName,
} from '../utils/algorandUtils'
import { addRole } from '../utils/discordUtils'
// Schemas

// Globals

const registeredRoleId = process.env.REGISTERED_ID

module.exports = {
  data: new SlashCommandBuilder()
    .setName('register')
    .setDescription('Register for When Darumas Attack')
    .addStringOption(option =>
      option
        .setName('address')
        .setDescription('enter the your wallet address')
        .setRequired(true)
    ),
  enabled: true,
  /**
   * Registers a player and adds a discord role if successful
   * @param interaction
   * @returns
   */
  async execute(interaction: Interaction) {
    if (!interaction.isChatInputCommand()) return
    const { user, options, channelId } = interaction
    const { username, id } = user

    const address = options.getString('address')

    if (address && !/^[a-zA-Z0-9]{58}$/.test(address)) {
      return await interaction.reply({
        content: 'Please enter a valid Algorand wallet address',
        ephemeral: true,
      })
    }

    await interaction.deferReply({ ephemeral: true })

    await interaction.followUp({
      content: 'This might take a while! Please be patient.',
      ephemeral: true,
    })

    if (address) {
      const { status, registeredUser } = await processRegistration(
        username,
        id,
        address,
        channelId
      )

      // add permissions if successful
      if (registeredUser && registeredRoleId) {
        addRole(interaction, registeredRoleId, registeredUser)
      }

      await interaction.followUp({
        ephemeral: true,
        content: status,
      })
    }
  },
}

/**
 * Checks if a user owns wallet, grabs their and saves/updates user
 * @param username
 * @param discordId
 * @param address
 * @param channelId
 * @returns {Promise<RegistrationResult>}
 */
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
    // Retrieve assetIds from specific collections
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
      const updatedUser = new User(username, discordId, address, keyedNfts)
      await updateUser(updatedUser, discordId)
    }

    return {
      status: `Registration complete! Enjoy the game. -- You can always register again if you are missing some NFT's`,
      registeredUser: user,
    }
  } catch (error) {
    console.log('*** REGISTRATION ERROR ***', error)
    return {
      status: 'Something went wrong during registration, please try again',
    }
  }
}
