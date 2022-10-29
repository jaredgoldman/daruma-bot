import { SlashCommandBuilder } from '@discordjs/builders'
import { Interaction } from 'discord.js'

// Data
import {
  findUserByDiscordId,
  findUserById,
  saveUser,
  replaceUser,
} from '../database/operations/user'
// Schemas
import Asset from '../models/asset'
import User from '../models/user'
import { RegistrationResult } from '../types/user'
// Helpers
import { determineOwnership } from '../utils/algorandUtils'
import { addRole } from '../utils/discordUtils'
import { env } from '../utils/environment'
import { Logger } from '../utils/logger'

module.exports = {
  data: new SlashCommandBuilder()
    .setName('register')
    .setDescription(`Register your wallet to battle your ${env.ALGO_UNIT_NAME}`)
    .addStringOption(option =>
      option
        .setName('address')
        .setDescription('Enter The Your Wallet Address')
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
    const { user, options } = interaction
    const { username, id } = user

    const walletAddress = options.getString('address')

    if (walletAddress && !/^[a-zA-Z0-9]{58}$/.test(walletAddress)) {
      return await interaction.reply({
        content: 'Please Enter A Valid Algorand Wallet Address',
        ephemeral: true,
      })
    }

    await interaction.deferReply({ ephemeral: true })

    await interaction.followUp({
      content: `Validating how many ${env.ALGO_UNIT_NAME} you have!`,
      ephemeral: true,
    })

    if (walletAddress) {
      const { status, registeredUser } = await processRegistration(
        username,
        id,
        walletAddress
      )

      // add permissions if successful
      if (registeredUser && env.DISCORD_REGISTERED_ROLE_ID) {
        addRole(interaction, env.DISCORD_REGISTERED_ROLE_ID, registeredUser)
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
 * @param walletAddress
 * @param channelId
 * @returns {Promise<RegistrationResult>}
 */
const processRegistration = async (
  username: string,
  discordId: string,
  walletAddress: string
): Promise<RegistrationResult> => {
  try {
    // Attempt to find user in db
    let user: User | null = await findUserByDiscordId(discordId)

    // Check to see if wallet has opt-in asset
    // Retrieve assetIds from specific collections
    const { walletOwned, nftsOwned } = await determineOwnership(walletAddress)

    const keyedNfts: { [key: string]: Asset } = {}
    nftsOwned.forEach((nft: Asset) => {
      keyedNfts[nft.id] = nft
    })

    if (!nftsOwned?.length) {
      return {
        status: `You have no ${env.ALGO_UNIT_NAME} in this wallet. Please try again with a different address`,
      }
    }

    if (!walletOwned) {
      return {
        status: `Looks like you haven't opted in to to asset ${env.ALGO_OPT_IN_ASSET_ID}. Please opt in on Rand Gallery by using this link: https://www.randgallery.com/algo-collection/?address=${env.ALGO_OPT_IN_ASSET_ID}`,
      }
    }

    // If user doesn't exist, add to db and grab instance
    if (!user) {
      const newUser = new User(username, discordId, walletAddress, keyedNfts)
      const { acknowledged, insertedId } = await saveUser(newUser)

      if (acknowledged) {
        user = await findUserById(insertedId)
      } else {
        return {
          status: 'Something went wrong during registration, please try again',
        }
      }
    } else {
      const { coolDowns, karma } = user
      const updatedUser = new User(
        username,
        discordId,
        walletAddress,
        keyedNfts,
        karma,
        coolDowns
      )
      await replaceUser(updatedUser, discordId)
    }

    return {
      status: `Registration complete added ${nftsOwned.length} ${env.ALGO_UNIT_NAME}! Enjoy the game. -- You can always register again if you are missing some ${env.ALGO_UNIT_NAME}`,
      registeredUser: user,
    }
  } catch (error) {
    Logger.error('*** REGISTRATION ERROR ***', error)
    return {
      status: 'Something went wrong during registration, please try again',
    }
  }
}
