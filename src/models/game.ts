import { BaseMessageOptions } from 'discord.js'
import { ObjectId } from 'mongodb'

import { GameStatus } from '../constants/game'
import { saveEncounter as saveEncounterToDb } from '../database/operations/game'
import { renderBoard } from '../game/board'
import { PlayerRoundsData } from '../types/attack'
import { RenderPhases } from '../types/board'
import { ChannelSettings, GameRoundState, GameTypes } from '../types/game'
import Asset from './asset'
import Encounter from './encounter'
import Player from './player'

/**
 * Main game class
 */
export default class Game {
  constructor(
    private settings: ChannelSettings // private m
  ) {
    this.status = GameStatus.waitingRoom
    this.win = false
    this.rounds = 0
    this.embed = undefined
    this.doUpdate = false
    this.players = {}
    this.gameRoundState = defaultGameRoundState
    this.startTime = Date.now()
    this.board = ''
    this.hasNpc = false
  }

  private players: { [key: string]: Player }
  private status: GameStatus
  private win: boolean
  private winningRoundIndex: number | undefined
  private winningRollIndex: number | undefined
  private rounds: number
  private doUpdate: boolean
  private embed: any
  private gameRoundState: GameRoundState
  private startTime: number
  private endTime: number | undefined
  private board: string
  private hasNpc: boolean
  private type: GameTypes = GameTypes.OneVsNpc
  private winningPlayers: Player[] = []

  /*
   * GAME TYPE
   */

  getType(): GameTypes {
    return this.type
  }

  setGameType(type: GameTypes): void {
    this.type = type
  }

  /*
   * PLAYER OPERATIONS
   */
  getPlayerArray(): Player[] {
    return Object.values(this.players)
  }

  getPlayer(discordId: discordId): Player | undefined {
    return this.players[discordId] || undefined
  }

  getPlayers(): { [key: string]: Player } {
    return this.players
  }

  addPlayer(player: Player): void {
    if (this.getPlayerCount() < 1) {
      this.setCurrentPlayer(player, 0)
    }
    this.players[player.getDiscordId()] = player
    // update games winning index
    const { gameWinRollIndex, gameWinRoundIndex } = player.getRoundsData()

    // console.log(util.inspect(rounds, false, null, true))
    this.compareAndSetWinningIndexes(gameWinRollIndex, gameWinRoundIndex)
  }

  getPlayerCount(): number {
    return this.getPlayerArray().length
  }

  removePlayers(): void {
    this.players = {}
  }

  removePlayer(discordId: string): void {
    if (this.players[discordId]) {
      delete this.players[discordId]
    }
  }

  /*
   * Active
   */
  setStatus(statusType: GameStatus): void {
    if (statusType === GameStatus.activeGame) {
      this.startTime = Date.now()
      // store winning platy
      this.storeWinningPlayers()
    }
    if (statusType === GameStatus.win) {
      this.endTime = Date.now()
    }
    this.status = statusType
  }

  getStatus(): GameStatus {
    return this.status
  }

  /*
   * Win
   */
  setWin(win: boolean): void {
    this.win = win
  }

  getWin(): boolean {
    return this.win
  }

  getWinningRoundIndex(): number | undefined {
    return this.winningRoundIndex
  }

  setWinningRoundIndex(roundIndex: number | undefined): void {
    this.winningRoundIndex = roundIndex
  }

  getWinningRollIndex(): number | undefined {
    return this.winningRollIndex
  }

  setWinningRollIndex(rollIndex: number | undefined): void {
    this.winningRollIndex = rollIndex
  }

  addWinningPlayer(player: Player): void {
    this.winningPlayers.push(player)
  }

  getWinningPlayers(): Player[] {
    return this.winningPlayers
  }

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
      this.setWinningRollIndex(rollIndex)
      this.setWinningRoundIndex(roundIndex)
      // if the incoming round index is lower than the current ruund index, change it
    } else if (this.winningRoundIndex && roundIndex < this.winningRoundIndex) {
      this.setWinningRollIndex(rollIndex)
      this.setWinningRoundIndex(roundIndex)
      // if the round index is the same, but the roll index is lower, change it
    } else if (
      this.winningRollIndex &&
      roundIndex === this.winningRoundIndex &&
      rollIndex < this.winningRollIndex
    ) {
      this.setWinningRollIndex(rollIndex)
      this.setWinningRoundIndex(roundIndex)
    }
  }

  /*
   * Rounds
   */

  incrementRounds(): void {
    this.rounds++
  }

  getNumberOfRounds(): number {
    return this.rounds
  }

  /*
   * Update
   */

  setdoUpdate(doUpdate: boolean): void {
    this.doUpdate = doUpdate
  }

  isUpdating(): boolean {
    return this.doUpdate
  }

  updateGame = (): void => {
    this.doUpdate = true
    setTimeout(() => {
      this.doUpdate = false
    }, 3000)
  }

  /*
   * Embed
   */

  setEmbed(embed: any): void {
    this.embed = embed
  }

  getEmbed(): any {
    return this.embed
  }

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
  addNpc(): void {
    this.addPlayer(
      new Player(
        'Karasu',
        'npcDiscordId',
        '1234567',
        new Asset('', 12345, 'Karasu', 'Karasu'),
        new ObjectId('123456789012'),
        true
      )
    )
    this.setHasNpc(true)
  }

  getHasNpc(): boolean {
    return this.hasNpc
  }

  setHasNpc(hasNpc: boolean): void {
    this.hasNpc = hasNpc
  }

  /*
   * Settings
   */
  addSettings(settings: ChannelSettings): void {
    this.settings = settings
    this.setGameType(settings.gameType)
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
    if (!this.getWin()) {
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
   * Time
   */

  getStartTime(): number {
    return this.startTime
  }

  setEndTime(): void {
    this.endTime = Date.now()
  }

  getEndTime(): number | undefined {
    return this.endTime
  }

  /*
   * OPERATIONS
   */
  saveEncounter(): void {
    if (!this.winningPlayers.length) {
      throw new Error('the game must have a winner to save an encounter')
    }

    saveEncounterToDb(
      new Encounter(
        this.winningPlayers,
        this.type,
        this.getStartTime(),
        this.getEndTime() as number,
        this.getRoundNumber(),
        this.getPlayersRoundsData(),
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
   * Compares the stored round and roll index to each players winnning round and roll index
   * Stores winning players in an array
   */
  storeWinningPlayers(): void {
    if (
      this.getWinningRollIndex() === undefined ||
      this.getWinningRoundIndex() === undefined
    ) {
      return
    }

    this.getPlayerArray().forEach((player: Player) => {
      const winningRollIndex = player.getRoundsData().gameWinRollIndex
      const winningRoundIndex = player.getRoundsData().gameWinRoundIndex

      if (
        winningRollIndex === this.getWinningRollIndex() &&
        winningRoundIndex === this.getWinningRoundIndex()
      ) {
        player.winGame()
        this.winningPlayers.push(player)
      }
    })
  }

  getPlayersRoundsData(): { [key: string]: PlayerRoundsData } {
    const playerRoundsData: { [key: string]: PlayerRoundsData } = {}
    this.getPlayerArray().forEach(player => {
      playerRoundsData[player.getDiscordId()] = player.getRoundsData()
    })
    return playerRoundsData
  }

  setBoard(board: string): void {
    this.board = board
  }

  getBoard(): string {
    return this.board
  }

  renderBoard(renderPhase: RenderPhases): string {
    const board = renderBoard(
      this.getRollIndex(),
      this.getRoundIndex(),
      this.getGameRoundState().playerIndex,
      this.getPlayerArray(),
      renderPhase
      // isLastRender
    )
    this.setBoard(board)
    return board
  }

  /**
   * Win logic
   */
  winGame(): void {
    this.setWin(true)
    this.setEndTime()
    this.setStatus(GameStatus.win)
    this.saveEncounter()
    this.doFinalPlayerMutation()
  }

  doFinalPlayerMutation(): void {
    this.getPlayerArray().forEach(player =>
      player.doEndOfGameMutation(this.settings)
    )
  }

  resetGame(): void {
    this.setStatus(GameStatus.waitingRoom)
    this.setWin(false)
    this.rounds = 0
    this.embed = undefined
    this.doUpdate = false
    this.removePlayers()
    this.setDefaultGameRoundState()
    this.setWinningRoundIndex(undefined)
    this.setWinningRollIndex(undefined)
    this.removeWinningPlayers()
  }
}

const defaultGameRoundState = {
  roundIndex: 0,
  rollIndex: 0,
  playerIndex: 0,
  currentPlayer: undefined,
}

export const defaultSettings: ChannelSettings = {
  maxAssets: 20,
  minCapacity: 2,
  maxCapacity: 2,
  channelId: '1005510693707067402',
  gameType: GameTypes.FourVsNpc,
  turnRate: 2,
  coolDown: 0,
  token: {
    awardOnWin: 10,
  },
}

type discordId = string
