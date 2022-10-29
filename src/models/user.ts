import { ObjectId } from 'mongodb'

import Asset from './asset'

export default class User {
  _id?: ObjectId
  created: number

  constructor(
    public username: string,
    public discordId: string,
    public walletAddress: string,
    public assets: { [key: string]: Asset },
    public karma: number = 0,
    public coolDowns: { [key: string]: number } = {} // timestamp
  ) {
    this.created = Date.now()
  }
}
