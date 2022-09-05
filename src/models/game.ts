import Player from './player'
import NPC from './npc'

export default class Game {
  constructor(
    public players: { [key: discordId]: Player },
    public capacity: number,
    public channelId: string,
    public npc: NPC
  ) {
    this.active = true
    this.win = false
    this.rounds = 0
    this.stopped = false
    this.embed = undefined
    this.isWaitingRoom = true
    this.doUpdate = false
  }

  private active: boolean
  setActive(active: boolean) {
    this.active = active
  }

  getActive() {
    return this.active
  }

  private win: boolean
  setWin(win: boolean) {
    this.win = win
  }

  getWin() {
    return this.win
  }

  private rounds: number
  incrementRounds() {
    this.rounds++
  }

  getRounds() {
    return this.rounds
  }

  private stopped: boolean
  isStopped() {
    return this.stopped
  }

  setStopped() {
    this.stopped = true
  }

  private isWaitingRoom: boolean
  setWaitingRoom(isWaitingRoom: boolean) {
    this.isWaitingRoom = isWaitingRoom
  }

  getWaitingRoom() {
    return this.isWaitingRoom
  }

  private doUpdate: boolean
  setdoUpdate(doUpdate: boolean) {
    this.doUpdate = doUpdate
  }

  getDoUpdate() {
    return this, this.doUpdate
  }

  private winnerDiscordId: number | undefined
  setWinnerDiscordId(winnerDiscordId: number) {
    this.winnerDiscordId = winnerDiscordId
  }

  getWinnerDiscordId() {
    return this.winnerDiscordId
  }

  private embed: any
  setEmbed(embed: any) {
    this.embed = embed
  }

  getEmbed() {
    return this.embed
  }

  damageNPC(damage: number) {
    this.npc.hp -= damage
  }
}

type discordId = string
