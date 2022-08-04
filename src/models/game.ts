import Player from './player'
import NPC from './npc'
import { ObjectId } from 'mongodb'
export default class Game {
  constructor(
    public players: { [key: discordId]: Player },
    public active: boolean,
    public win: false,
    public capacity: number,
    public channelId: string,
    public megatron?: any,
    public npc?: NPC,
    public embed?: any,
    public waitingRoom?: any,
    public stopped?: boolean,
    public update?: boolean,
    public winnerId?: ObjectId
  ) {}
}

type discordId = string
