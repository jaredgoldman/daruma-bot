import Player from './player'
import NPC from './npc'
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
    public update?: boolean
  ) {}
}

type discordId = string
