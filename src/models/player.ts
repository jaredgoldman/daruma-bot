import { ObjectId } from 'mongodb'
import Asset from './asset'
import { completeGameForPlayer } from '../utils/attack'
import { RollData } from '../types/attack'

/**
 * Player Class
 * Represents a player registered in an active game
 */
export default class Player {
  discordId: string
  address: string
  userId: ObjectId

  constructor(
    username: string,
    discordId: string,
    address: string,
    asset: Asset,
    userId: ObjectId
  ) {
    this.rolls = completeGameForPlayer()
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
  private rolls: RollData[]
  getRolls() {
    return this.rolls
  }

  getRollsLength() {
    return this.rolls.length
  }

  getRollsUntilIndex(index: number): RollData[] {
    return this.getRolls().slice(0, index + 1)
  }

  setRolls(rolls: RollData[]) {
    this.rolls = rolls
  }
  /*
   * Asset
   */
  asset: Asset
  getAsset() {
    return this.asset
  }

  /*
   * isWinner
   */
  isWinner: boolean
  getIsWinner() {
    return this.isWinner
  }

  setIsWinner() {
    this.isWinner = true
  }

  /*
   * Username
   */
  private username
  getUsername() {
    return this.username
  }
}
