import { ObjectId } from 'mongodb'

import Asset from './asset'

export default class User {
  public karma: number
  public coolDowns: { [key: string]: number } // timestamp
  _id?: ObjectId
  created: number

  constructor(
    public username: string,
    public discordId: string,
    public walletAddress: string,
    public assets: { [key: string]: Asset }
  ) {
    this.coolDowns = {}
    this.karma = 0
    this.created = Date.now()
  }
}
