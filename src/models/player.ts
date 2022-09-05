import { ObjectId } from 'mongodb'
import Asset from './asset'

// This model represents a player enrolled in a battle
export default class Player {
  constructor(
    private username: string,
    private discordId: string,
    private address: string,
    private assetId: number,
    private userId: ObjectId
  ) {}
}
