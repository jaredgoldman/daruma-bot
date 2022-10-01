import { ObjectId } from 'mongodb'
import Asset from './asset'
import { completeGameForPlayer } from '../utils/attackUtils'
import { PlayerRoundsData, RoundData } from '../types/attack'

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
  private username

  constructor(
    username: string,
    discordId: string,
    address: string,
    asset: Asset,
    userId: ObjectId
  ) {
    this.roundsData = completeGameForPlayer()
    this.username = username
    this.discordId = discordId
    this.address = address
    this.asset = asset
    this.userId = userId
    this.isWinner = false
  }

  /*
   * Rolls
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
  getAsset() {
    return this.asset
  }

  /*
   * WIn
   */

  getIsWinner() {
    return this.isWinner
  }

  setIsWinner(): void {
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
}
