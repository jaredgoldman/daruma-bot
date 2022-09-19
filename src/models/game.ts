import Player from './player'
import NPC from './npc'
import { collections } from '../database/database.service'
import Encounter from './encounter'
import { GameTypes } from '../types/game'
import { ChannelSettings } from '../types/game'
import { MessageOptions } from 'discord.js'

export default class Game {
  constructor(
    private capacity: number,
    private channelId: string,
    private type: GameTypes,
    private settings: ChannelSettings // private m
  ) {
    this.status = GameStatus.waitingRoom
    this.win = false
    this.rounds = 0
    this.stopped = false
    this.embed = undefined
    this.doUpdate = false
    this.players = {}
    this.npc = undefined
  }
  /*
   * PLAYER OPERATIONS
   */
  private players: { [key: string]: Player }
  getPlayerArray() {
    return Object.values(this.players)
  }

  getPlayer(discordId: discordId) {
    return this.players[discordId] || undefined
  }

  getPlayers() {
    return this.players
  }

  addPlayer(player: Player) {
    this.players[player.discordId] = player
  }

  getPlayerCount() {
    return this.getPlayerArray().length
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
  private status: GameStatus
  setStatus(statusType: GameStatus) {
    this.status = statusType
  }

  getStatus() {
    return this.status
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
   * Update
   */
  private doUpdate: boolean
  setdoUpdate(doUpdate: boolean) {
    this.doUpdate = doUpdate
  }

  isUpdating() {
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
    if (!this.embed) {
      throw new Error('No embed stored in game')
    }
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
  /**
   * Finds an array of winningPlayers and the round index that the game was won
   * @returns { winningPlayers: Player[]; winIndex: number }
   */
  findWinIndexAndWinners = (): {
    winningPlayers: Player[]
    winIndex: number
  } => {
    const winningPlayers: Player[] = []
    const playerArr = this.getPlayerArray()

    // find who has the shortest array length
    const winningPlayer = playerArr.reduce(
      (prevPlayer: Player, currentPlayer: Player): Player => {
        return prevPlayer.getRollsLength() < currentPlayer.getRollsLength()
          ? prevPlayer
          : currentPlayer
      }
    )
    // Assing winner
    winningPlayer.setIsWinner()

    // Prase remaining players for win
    this.getPlayerArray().forEach((player: Player) => {
      if (player.getRollsLength() && !player.getIsWinner()) {
        winningPlayers.push(player)
      }
    })

    const winIndex = winningPlayers[0].getRollsLength()
    return { winningPlayers, winIndex }
  }

  /**
   * Saves an encounter
   */
  winGame() {
    if (!this.winnerDiscordId) {
      throw new Error('the game must have a winner before you trigger win')
    }
    this.saveEncounter()
  }

  resetGame() {
    this.status = GameStatus.waitingRoom
    this.win = false
    this.rounds = 0
    this.stopped = false
    this.embed = undefined
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

export enum GameStatus {
  waitingRoom = 'waitingRoom',
  activeGame = 'activeGame',
}

type PlayersRollData = { [key: discordId]: number[] }

type discordId = string
