import { ObjectId } from 'mongodb'

import { findUserByDiscordId, updateUser } from '../database/operations/user'
import { PlayerRoundsData } from '../types/attack'
import { ChannelSettings } from '../types/game'
import { PlayerDice } from '../utils/attackUtils'
import { Logger } from '../utils/logger'
import Asset from './asset'
import User from './user'

/**
 * Player Class
 * Represents a player registered in an active game
 */
export default class Player {
  public roundsData: PlayerRoundsData
  public discordId: string
  private walletAddress: string
  private userId: ObjectId
  public isWinner: boolean
  public username: string
  public isNpc: boolean
  public asset: Asset
  constructor(
    username: string,
    discordId: string,
    walletAddress: string,
    asset: Asset,
    userId: ObjectId,
    isNpc: boolean = false
  ) {
    this.roundsData = PlayerDice.completeGameForPlayer()
    this.username = username
    this.discordId = discordId
    this.walletAddress = walletAddress
    this.asset = asset
    this.userId = userId
    this.isWinner = false
    this.isNpc = isNpc
  }

  /**
   * @param karmaOnWin
   */
  async doEndOfGameMutation(settings: ChannelSettings): Promise<void> {
    if (this.isNpc) return
    const {
      token: { awardOnWin },
      coolDown,
    } = settings
    const user = await findUserByDiscordId(this.discordId)
    if (user) {
      let karma = user.karma
      let wins = this.asset.wins
      let losses = this.asset.losses

      const coolDownDoneDate = Date.now() + coolDown

      if (this.isWinner) {
        karma += awardOnWin
        wins += 1
      } else {
        losses += 1
      }
      const asset: Asset = {
        ...this.asset,
        wins,
        losses,
      }
      const updatedUserData: User = {
        ...user,
        karma,
        assets: {
          ...user.assets,
          [this.asset.id]: asset,
        },
        coolDowns: { ...user.coolDowns, [this.asset.id]: coolDownDoneDate },
      }
      await updateUser(updatedUserData, this.discordId)
    } else {
      Logger.error('****** NO USER FOUND FOR MUTATION ******', this)
    }
  }
}
