import { ObjectId } from 'mongodb'

/**
 * Player Class
 * Represents a player registered in an active game
 */
export default class Player {
  constructor(
    public username: string,
    public discordId: string,
    public address: string,
    public assetId: number,
    public userId: ObjectId
  ) {}
}
