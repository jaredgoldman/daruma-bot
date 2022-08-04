import { ObjectId } from 'mongodb'
import Asset from './asset'

// This model represents a player enrolled in a battle
export default class Player {
  constructor(
    public username: string,
    public discordId: string,
    public address: string,
    public asset: Asset,
    public userId: ObjectId,
    public hp: number,
    public dead: boolean
  ) {}
}
