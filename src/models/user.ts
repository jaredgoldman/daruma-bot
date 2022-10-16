import { ObjectId } from 'mongodb'
import { UserEnhancer } from '../types/enhancers'
import Asset from './asset'

export default class User {
  public enhancers: { [key: string]: UserEnhancer }
  public totalBattles: number
  public karma: number
  public coolDowns: { [key: string]: number } // timestamp
  _id?: ObjectId
  created: number

  constructor(
    public username: string,
    public discordId: string,
    public address: string,
    public assets: { [key: string]: Asset }
  ) {
    this.karma = 0
    this.enhancers = {}
    this.coolDowns = {}
    this.totalBattles = 0
    this.karma = 0
    this.created = Date.now()
  }
}
