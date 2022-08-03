import Player from './player'
export default class Game {
  constructor(
    public players: { [key: discordId]: Player },
    public active: boolean,
    public win: false,
    public megatron?: any,
    public npc?: NPC,
    public embed?: any,
    public waitingRoom?: any,
    public stopped?: boolean,
    public update?: boolean
  ) {}
}

interface NPC {
  hp: number
  dead: boolean
}

type discordId = string
