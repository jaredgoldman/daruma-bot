import { ObjectId } from 'mongodb'
import Asset from './asset'
import completeGameForPlayer from '../game/roll'

/**
 * Player Class
 * Represents a player registered in an active game
 */
export default class Player {
  username: string
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
  rolls: number[]
  getRolls() {
    return this.rolls
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
  getIsWInner() {
    return this.isWinner
  }

  setIsWinner() {
    this.isWinner = true
  }
}
