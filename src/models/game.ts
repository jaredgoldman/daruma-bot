import {
  BaseMessageOptions,
  Client,
  ClientUser,
  Message,
  Snowflake,
} from 'discord.js'
import { ObjectId } from 'mongodb'

import { GameStatus } from '../constants/game'
import doEmbed from '../core/embeds'
import { saveEncounter as saveEncounterToDb } from '../database/operations/game'
import { GameHandler } from '../game'
import { renderBoard } from '../game/board'
import { PlayerRoundsData } from '../types/attack'
import { RenderPhases } from '../types/board'
import { ChannelSettings, GameRoundState, GameTypes } from '../types/game'
import { Logger } from '../utils/logger'
import * as Logs from '../utils/logs.json'
import Asset from './asset'
import Encounter from './encounter'
import Player from './player'
/**
 * Main game class
 */
export default class Game {
  private players: { [key: string]: Player }
  private _status: GameStatus
  public win: boolean
  private winningRoundIndex: number | undefined
  private winningRollIndex: number | undefined
  public embed: Message | undefined
  private gameRoundState: GameRoundState
  private startTime: number
  private endTime: number
  public hasNpc: boolean
  public type: GameTypes
  public winningPlayers: Player[] = []
  public gameHandler: GameHandler
  constructor(public client: Client, private _settings: ChannelSettings) {
    this._status = GameStatus.waitingRoom
    this.win = false
    this.embed = undefined
    this.players = {}
    this.gameRoundState = defaultGameRoundState
    this.startTime = Date.now()
    this.endTime = Date.now()
    this.hasNpc = false
    this.gameHandler = new GameHandler(this)
    this.type = _settings.gameType
  }
  public get settings(): ChannelSettings {
    return this._settings
  }
  public set settings(value: ChannelSettings) {
    this.type = value.gameType
    this._settings = value
  }
  public get status(): GameStatus {
    return this._status
  }
  public set status(value: GameStatus) {
    if (value === GameStatus.activeGame) {
      this.startTime = Date.now()
      // store winning player
      this.storeWinningPlayers()
    }
    if (value === GameStatus.win) {
      this.endTime = Date.now()
    }
    this._status = value
  }
  public updateEmbed(): void {
    this.editEmbed(doEmbed(GameStatus.waitingRoom, this))
    if (
      this.playerCount < this.settings.maxCapacity &&
      this.status === GameStatus.waitingRoom
    ) {
      Logger.debug('Waiting for players')
    } else {
      this.gameHandler.startChannelGame()
    }
  }
  public get playerArray(): Player[] {
    return Object.values(this.players)
  }
  public get playerCount(): number {
    return Object.keys(this.players).length
  }
  private get playersRoundsData(): { [key: string]: PlayerRoundsData } {
    const playerRoundsData: { [key: string]: PlayerRoundsData } = {}
    this.playerArray.forEach(player => {
      playerRoundsData[player.discordId] = player.roundsData
    })
    return playerRoundsData
  }

  getPlayer<C extends Snowflake>(discordId: C): Player | undefined {
    return this.players[discordId] || undefined
  }

  addPlayer(player: Player): void {
    if (this.playerCount < 1) {
      this.setCurrentPlayer(player, 0)
    }
    this.players[player.discordId] = player
    // update games winning index
    const { gameWinRollIndex, gameWinRoundIndex } = player.roundsData

    // console.log(util.inspect(rounds, false, null, true))
    this.compareAndSetWinningIndexes(gameWinRollIndex, gameWinRoundIndex)
  }

  removePlayers(): void {
    this.players = {}
  }

  removePlayer<C extends Snowflake>(discordId: C): void {
    if (this.players[discordId]) {
      delete this.players[discordId]
    }
  }

  /*
   * Active
   */
  removeWinningPlayers(): void {
    this.winningPlayers = []
  }

  /**
   * Compare joining users win indexes and assign then to game if lowest
   * Also assign winning discord Id to game
   * @param rollIndex
   * @param roundIndex
   * @param player
   */
  compareAndSetWinningIndexes(rollIndex: number, roundIndex: number): void {
    // if no winning indexes set yet
    if (
      this.winningRollIndex === undefined ||
      this.winningRoundIndex === undefined
    ) {
      this.winningRollIndex = rollIndex
      this.winningRoundIndex = roundIndex
      // if the incoming round index is lower than the current round index, change it
    } else if (this.winningRoundIndex && roundIndex < this.winningRoundIndex) {
      this.winningRollIndex = rollIndex
      this.winningRoundIndex = roundIndex
      // if the round index is the same, but the roll index is lower, change it
    } else if (
      this.winningRollIndex &&
      roundIndex === this.winningRoundIndex &&
      rollIndex < this.winningRollIndex
    ) {
      this.winningRollIndex = rollIndex
      this.winningRoundIndex = roundIndex
    }
  }

  /*
   * Update
   */

  async editEmbed(options: BaseMessageOptions): Promise<void> {
    if (!this.embed) {
      throw new Error('No embed stored in game')
    }
    await this.embed.edit(options)
  }

  /*
   * NPC
   */

  // TODO: add real asset npc, generate random name
  addNpc(clientUser: ClientUser, npcName: string, npcUrl: string): void {
    this.addPlayer(
      new Player(
        npcName,
        clientUser.id,
        '1234567',
        new Asset(npcUrl, 12345, npcName, npcName),
        new ObjectId('123456789012'),
        clientUser.bot
      )
    )
    this.hasNpc = true
  }

  getSettings(): ChannelSettings {
    return this.settings
  }

  /*
   * Settings
   */
  getGameRoundState(): GameRoundState {
    return this.gameRoundState
  }

  setGameRoundState(gameRoundState: GameRoundState): void {
    this.gameRoundState = gameRoundState
  }

  setDefaultGameRoundState(): void {
    this.gameRoundState = { ...defaultGameRoundState }
  }

  getRoundIndex(): number {
    return this.gameRoundState.roundIndex
  }

  incrementRoundIndex(): void {
    this.gameRoundState.roundIndex++
  }

  getRollIndex(): number {
    return this.gameRoundState.rollIndex
  }

  setRollIndex(rollIndex: number): void {
    this.gameRoundState.rollIndex = rollIndex
  }

  getRoundNumber(): number {
    return this.gameRoundState.roundIndex + 1
  }

  setCurrentPlayer(player: Player, playerIndex: number): void {
    this.gameRoundState.currentPlayer = player
    this.gameRoundState.playerIndex = playerIndex
  }

  getCurrentPlayer(): Player | undefined {
    return this.gameRoundState.currentPlayer
  }

  incrementRollIndex(): void {
    this.logState()
    if (!this.win) {
      // If the roll index is divisible by 3, increment the round index
      if ((this.getRollIndex() + 1) % 3 === 0) {
        this.incrementRoundIndex()
        this.gameRoundState.rollIndex = 0
      } else {
        this.gameRoundState.rollIndex++
      }

      // handle win if win
      if (
        this.gameRoundState.currentPlayer &&
        this.gameRoundState.roundIndex === this.winningRoundIndex &&
        this.gameRoundState.rollIndex === this.winningRollIndex
      ) {
        this.winGame()
      }
    }
  }

  getPlayerIndex(): number {
    return this.gameRoundState.playerIndex
  }

  /*
   * OPERATIONS
   */
  saveEncounter(): void {
    if (!this.winningPlayers.length) {
      Logger.warn(Logs.warn.noWinningPlayers)
    }

    saveEncounterToDb(
      new Encounter(
        this.winningPlayers,
        this.type,
        this.startTime,
        this.endTime,
        this.getRoundNumber(),
        this.playersRoundsData,
        this.getGameRoundState(),
        this.getSettings().channelId
      )
    )
  }

  logState(): void {
    // console.log(`****** ROUND ${this.gameRoundState.roundIndex + 1} ******`)
    // console.log('winning round index', this.winningRoundIndex)
    // console.log('winning roll index', this.winningRollIndex)
    // console.log('player index', this.gameRoundState.playerIndex)
    // console.log('round index: ', this.gameRoundState.roundIndex)
    // console.log('roll index: ', this.gameRoundState.rollIndex)
  }

  /**
   * Compares the stored round and roll index to each players winning round and roll index
   * Stores winning players in an array
   */
  storeWinningPlayers(): void {
    if (
      this.winningRollIndex === undefined ||
      this.winningRoundIndex === undefined
    ) {
      return
    }

    this.playerArray.forEach((player: Player) => {
      const winningRollIndex = player.roundsData.gameWinRollIndex
      const winningRoundIndex = player.roundsData.gameWinRoundIndex

      if (
        winningRollIndex === this.winningRollIndex &&
        winningRoundIndex === this.winningRoundIndex
      ) {
        player.isWinner = true
        this.winningPlayers.push(player)
      }
    })
  }

  renderBoard(renderPhase: RenderPhases): string {
    const board = renderBoard(
      this.getRollIndex(),
      this.getRoundIndex(),
      this.getGameRoundState().playerIndex,
      this.playerArray,
      renderPhase
      // isLastRender
    )
    return board
  }

  /**
   * Win logic
   */
  winGame(): void {
    this.win = true
    this.endTime = Date.now()
    this.status = GameStatus.win
    this.saveEncounter()
    this.doFinalPlayerMutation()
  }

  doFinalPlayerMutation(): void {
    this.playerArray.forEach(player =>
      player.doEndOfGameMutation(this.settings)
    )
  }

  resetGame(): void {
    this.status = GameStatus.waitingRoom
    this.win = false
    this.embed = undefined
    this.removePlayers()
    this.setDefaultGameRoundState()
    this.winningRoundIndex = undefined
    this.winningRollIndex = undefined
    this.removeWinningPlayers()
  }
}

const defaultGameRoundState = {
  roundIndex: 0,
  rollIndex: 0,
  playerIndex: 0,
  currentPlayer: undefined,
}
