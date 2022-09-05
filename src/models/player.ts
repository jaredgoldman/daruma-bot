import { ObjectId } from 'mongodb'
import Asset from './asset'

/**
 * Player Class
 * Represents a player registered in an active game
 */
export default class Player {
  constructor(
    public username: string,
    public discordId: string,
    public address: string,
    public asset: Asset,
    public userId: ObjectId
  ) {}
}
