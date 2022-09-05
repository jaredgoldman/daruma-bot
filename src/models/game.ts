import Player from './player'
import NPC from './npc'
import { collections } from '../database/database.service'
import Encounter from './encounter'
import { GameTypes } from '../types/game'
import { ChannelSettings } from '../settings'

export default class Game {
  /*
   * PLAYER OPERSATIONS
   */
  getPlayerArray() {
    return Object.values(this.players)
  }

  getPlayer(discordId: discordId) {
    return this.players[discordId]
  }

  /*
   * Capacity
   */
  getCapacity() {
    return this.capacity
  }

  /*
   * ChannelID
   */
  getChannelId() {
    return this.channelId
  }

  /*
   * Active
   */
  private active: boolean
  setActive(active: boolean) {
    this.active = active
  }

  getActive() {
    return this.active
  }

  /*
   * Win
   */
  private win: boolean
  setWin(win: boolean) {
    this.win = win
  }

  getWin() {
    return this.win
  }

  private winnerDiscordId: number | undefined
  setWinnerDiscordId(winnerDiscordId: number) {
    this.winnerDiscordId = winnerDiscordId
  }

  getWinnerDiscordId() {
    return this.winnerDiscordId
  }

  /*
   * Rounds
   */
  private rounds: number
  incrementRounds() {
    this.rounds++
  }

  getRounds() {
    return this.rounds
  }

  /*
   * Stopped
   */
  private stopped: boolean
  isStopped() {
    return this.stopped
  }

  setStopped() {
    this.stopped = true
  }

  /*
   * Waiting Room
   */
  private isWaitingRoom: boolean
  setWaitingRoom(isWaitingRoom: boolean) {
    this.isWaitingRoom = isWaitingRoom
  }

  getWaitingRoom() {
    return this.isWaitingRoom
  }

  /*
   * Update
   */
  private doUpdate: boolean
  setdoUpdate(doUpdate: boolean) {
    this.doUpdate = doUpdate
  }

  getDoUpdate() {
    return this.doUpdate
  }

  updateGame = () => {
    this.doUpdate = true
    setTimeout(() => {
      this.doUpdate = false
    }, 3000)
  }

  /*
   * Embed
   */

  private embed: any
  setEmbed(embed: any) {
    this.embed = embed
  }

  getEmbed() {
    return this.embed
  }

  constructor(
    private players: { [key: discordId]: Player },
    private capacity: number,
    private channelId: string,
    private type: GameTypes,
    private npc: NPC,
    private settings: ChannelSettings
  ) {
    this.active = true
    this.win = false
    this.rounds = 0
    this.stopped = false
    this.embed = undefined
    this.isWaitingRoom = true
    this.doUpdate = false
  }

  /*
   * OPERATIONS
   */
  saveEncounter() {
    if (!this.winnerDiscordId) {
      throw new Error('the game must have a winner to save an encounter')
    }
    collections.encounters.insertOne(
      new Encounter(this.winnerDiscordId, this.type, Date.now())
    )
  }

  winGame() {
    if (!this.winnerDiscordId) {
      throw new Error('the game must have a winner before you trigger win')
    }
    this.saveEncounter()
  }
}

type discordId = string
