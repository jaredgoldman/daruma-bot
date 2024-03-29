import { ObjectId } from 'mongodb'

import { findUserByDiscordId, updateUser } from '../database/operations/user'
import { PlayerRoundsData, RoundData } from '../types/attack'
import { ChannelSettings } from '../types/game'
import { completeGameForPlayer } from '../utils/attackUtils'
import { Logger } from '../utils/logger'
import Asset from './asset'
import User from './user'

/**
 * Player Class
 * Represents a player registered in an active game
 */
export default class Player {
  private roundsData: PlayerRoundsData
  private discordId: string
  private address: string
  private userId: ObjectId
  private isWinner: boolean
  private username: string
  private isNpc: boolean

  constructor(
    username: string,
    discordId: string,
    address: string,
    asset: Asset,
    userId: ObjectId,
    isNpc: boolean = false
  ) {
    this.roundsData = completeGameForPlayer()
    this.username = username
    this.discordId = discordId
    this.address = address
    this.asset = asset
    this.userId = userId
    this.isWinner = false
    this.isNpc = isNpc
  }

  /*
   * Rolls1
   */

  getRoundsData(): PlayerRoundsData {
    return this.roundsData
  }

  getRoundsLength(): number {
    return this.roundsData.rounds.length
  }

  setRoundsData(roundsData: PlayerRoundsData): void {
    this.roundsData = roundsData
  }

  getRounds(): Array<RoundData> {
    return this.roundsData.rounds
  }

  /*
   * Asset
   */
  asset: Asset
  getAsset(): Asset {
    return this.asset
  }

  /*
   * WIn
   */

  getIsWinner(): boolean {
    return this.isWinner
  }

  winGame(): void {
    this.isWinner = true
  }

  /*
   * Username
   */
  getUsername(): string {
    return this.username
  }

  /*
   * Discord ID
   */
  getDiscordId(): string {
    return this.discordId
  }

  setDiscordId(discordId: string): void {
    this.discordId = discordId
  }

  /*
   * NPC
   */

  getIsNpc(): boolean {
    return this.isNpc
  }

  /*
   * Mutations
   */

  /**
   * @param karmaOnWin
   */
  async doEndOfGameMutation(settings: ChannelSettings): Promise<void> {
    if (this.isNpc) return
    const {
      token: { awardOnWin },
      coolDown,
    } = settings
    const user = await findUserByDiscordId(this.getDiscordId())
    if (user) {
      let karma = user.karma
      let wins = this.asset.wins
      let losses = this.asset.losses
      const gamesPlayed = this.asset?.gamesPlayed || 0

      const coolDownDoneDate = Date.now() + coolDown
      if (this.getIsWinner()) {
        karma += awardOnWin
        wins = 1
      } else {
        losses += 1
      }

      const asset: Asset = {
        ...this.asset,
        wins,
        losses,
        gamesPlayed,
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
      await updateUser(updatedUserData, this.getDiscordId())
    } else {
      Logger.error('****** NO USER FOUND FOR MUTATION ******', this)
    }
  }
}
