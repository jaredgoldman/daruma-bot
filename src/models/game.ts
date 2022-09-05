import Player from './player'
import NPC from './npc'
import { collections } from '../database/database.service'
import Encounter from './encounter'
import { GameTypes } from '../types/game'
import { ChannelSettings } from '../types/game'
import { MessageOptions } from 'discord.js'

export default class Game {
  /*
   * PLAYER OPERATIONS
   */
  private players: { [key: string]: Player }
  getPlayerArray() {
    return Object.values(this.players)
  }

  getPlayer(discordId: discordId) {
    return this.players[discordId]
  }

  addPlayer(player: Player) {
    this.players[player.discordId] = player
  }

  getPlayerCount() {
    return this.getPlayerArray.length
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
  setIsWaitingRoom(isWaitingRoom: boolean) {
    this.isWaitingRoom = isWaitingRoom
  }

  getIsWaitingRoom() {
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

  async editEmbed(options: MessageOptions) {
    await this.embed.edit(options)
  }

  /*
   * NPC
   */
  private npc: NPC | undefined
  addNpc() {
    this.npc = new NPC()
  }

  /*
   * Settings
   */
  addSettings(settings: ChannelSettings) {
    this.settings = settings
  }

  getSettings() {
    return this.settings
  }

  constructor(
    private capacity: number,
    private channelId: string,
    private type: GameTypes,
    private settings: ChannelSettings
  ) {
    this.active = true
    this.win = false
    this.rounds = 0
    this.stopped = false
    this.embed = undefined
    this.isWaitingRoom = true
    this.doUpdate = false
    this.players = {}
    this.npc = undefined
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

  resetGame() {
    this.active = true
    this.win = false
    this.rounds = 0
    this.stopped = false
    this.embed = undefined
    this.isWaitingRoom = true
    this.doUpdate = false
    this.players = {}
    this.npc = undefined
    this.settings = defaultSettings
  }
}

const defaultSettings = {
  maxAssets: 20,
  minCapacity: 2,
  maxCapacity: 2,
  npcHp: 100,
  playerHp: 100,
  rollInterval: 1000,
  channelId: '1005510693707067402',
  gameType: GameTypes.FourVsNpc,
}

type discordId = string
