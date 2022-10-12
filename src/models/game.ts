import Player from './player'
import Encounter from './encounter'
import { GameRoundState, GameTypes } from '../types/game'
import { ChannelSettings } from '../types/game'
import { MessageOptions } from 'discord.js'
// import util from 'util'
import { PlayerRoundsData } from '../types/attack'
import { saveEncounter as saveEncounterToDb } from '../database/operations/game'
import { renderBoard } from '../game/board'
import Asset from './asset'
import { ObjectId } from 'mongodb'
import { throws } from 'assert'
// import util from 'util'

/**
 *
 */
export default class Game {
  constructor(
    private capacity: number,
    private channelId: string,
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
  private winnerDiscordIds: Player[] = []

  /*
   * GAME TYPE
   */

  getType() {
    return this.type
  }

  setGameType(type: GameTypes) {
    this.type = type
  }

  /*
   * PLAYER OPERATIONS
   */
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
    if (!this.getPlayerCount()) {
      this.setCurrentPlayer(player, 0)
    }
    this.players[player.getDiscordId()] = player
    // update games winning index
    const { gameWinRollIndex, gameWinRoundIndex, rounds } =
      player.getRoundsData()
    // console.log(util.inspect(rounds, false, null, true))
    this.compareAndSetWinningIndexes(gameWinRollIndex, gameWinRoundIndex)
  }

  getPlayerCount() {
    return this.getPlayerArray().length
  }

  removePlayers() {
    this.players = {}
  }

  removePlayer(discordId: string) {
    if (this.players[discordId]) {
      delete this.players[discordId]
    }
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
  setStatus(statusType: GameStatus) {
    if (statusType === GameStatus.activeGame) {
      this.startTime = Date.now()
      this.storeWinningPlayerDiscordIds()
    }
    if (statusType === GameStatus.win) {
      this.endTime = Date.now()
    }
    this.status = statusType
  }

  getStatus() {
    return this.status
  }

  /*
   * Win
   */
  setWin(win: boolean) {
    this.win = win
  }

  getWin() {
    return this.win
  }

  // setWinnerDiscordId(winnerDiscordId: string) {
  //   this.winnerDiscordId = winnerDiscordId
  // }

  // getWinnerDiscordId() {
  //   return this.winnerDiscordId
  // }

  // getWinningPlayer() {
  //   return this.getPlayer(this.getWinnerDiscordId())
  // }

  getWinningRoundIndex() {
    return this.winningRoundIndex || Infinity
  }

  setWiningRoundIndex(roundIndex: number) {
    this.winningRoundIndex = roundIndex
  }

  getWinningRollIndex() {
    return this.winningRollIndex || Infinity
  }

  setWinningRollIndex(rollIndex: number) {
    this.winningRollIndex = rollIndex
  }

  addWinningPlayer(player: Player) {
    this.winnerDiscordIds.push(player)
  }

  getWinningPlayerDiscordIds() {
    return this.winnerDiscordIds
  }

  /**
   * Compare joining users win indexes and assign then to game if lowest
   * Also assign winning discord Id to game
   * @param rollIndex
   * @param roundIndex
   * @param player
   */
  compareAndSetWinningIndexes(rollIndex: number, roundIndex: number) {
    // if no winning indexes set yet
    if (!this.getWinningRollIndex() || !this.getWinningRoundIndex()) {
      this.setWinningRollIndex(rollIndex)
      this.setWiningRoundIndex(roundIndex)
      // if the incoming round index is lower than the current ruund index, change it
    } else if (roundIndex < this.getWinningRoundIndex()) {
      this.setWinningRollIndex(rollIndex)
      this.setWiningRoundIndex(roundIndex)
      // if the round index is the same, but the roll index is lower, change it
    } else if (
      roundIndex === this.getWinningRoundIndex() &&
      rollIndex < this.getWinningRollIndex()
    ) {
      this.setWinningRollIndex(rollIndex)
      this.setWiningRoundIndex(roundIndex)
    }
  }

  /*
   * Rounds
   */

  incrementRounds() {
    this.rounds++
  }

  getRoundsData() {
    return this.rounds
  }

  /*
   * Update
   */

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

  // TODO: add real asset npc, generate random name
  addNpc() {
    this.addPlayer(
      new Player(
        'npc player',
        'npcDiscordId',
        '1234567',
        new Asset('$', 12345, 'npcasset', 'npcasset'),
        new ObjectId('123456789012'),
        true
      )
    )
    this.setHasNpc(true)
  }

  getHasNpc() {
    return this.hasNpc
  }

  setHasNpc(hasNpc: boolean) {
    this.hasNpc = hasNpc
  }

  /*
   * Settings
   */
  addSettings(settings: ChannelSettings) {
    this.settings = settings
    this.setGameType(settings.gameType)
  }

  getSettings() {
    return this.settings
  }

  /*
   * Settings
   */
  getGameRoundState() {
    return this.gameRoundState
  }

  setGameRoundState(gameRoundState: GameRoundState) {
    this.gameRoundState = gameRoundState
  }

  setDefaultGameRoundState() {
    this.gameRoundState = { ...defaultGameRoundState }
  }

  getRoundIndex() {
    return this.gameRoundState.roundIndex
  }

  incrementRoundIndex() {
    this.gameRoundState.roundIndex++
  }

  getRollIndex() {
    return this.gameRoundState.rollIndex
  }

  setRollIndex(rollIndex: number) {
    this.gameRoundState.rollIndex = rollIndex
  }

  getRoundNumber() {
    return this.gameRoundState.roundIndex + 1
  }

  setCurrentPlayer(player: Player, playerIndex: number) {
    this.gameRoundState.currentPlayer = player
    this.gameRoundState.playerIndex = playerIndex
  }

  // if it's the third round, reset the round index
  incrementRollIndex() {
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

  getPlayerIndex() {
    return this.gameRoundState.playerIndex
  }

  /*
   * Time
   */

  getStartTime() {
    return this.startTime
  }

  setEndTime() {
    this.endTime = Date.now()
  }

  getEndTime() {
    return this.endTime
  }

  /*
   * OPERATIONS
   */
  saveEncounter() {
    console.log(this.winnerDiscordIds)
    if (!this.winnerDiscordIds.length) {
      throw new Error('the game must have a winner to save an encounter')
    }

    saveEncounterToDb(
      new Encounter(
        this.winnerDiscordIds,
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

  logState() {
    // console.log(`****** ROUND ${this.gameRoundState.roundIndex + 1} ******`)
    // console.log('winning round index', this.winningRoundIndex)
    // console.log('winning roll index', this.winningRollIndex)
    // console.log('player index', this.gameRoundState.playerIndex)
    // console.log('round index: ', this.gameRoundState.roundIndex)
    // console.log('roll index: ', this.gameRoundState.rollIndex)
  }

  storeWinningPlayerDiscordIds() {
    if (!this.getWinningRollIndex() || !this.getWinningRoundIndex()) return
    // loop through players
    this.getPlayerArray().forEach((player: Player) => {
      const winningRollIndex = player.getRoundsData().gameWinRollIndex
      const winningRoundIndex = player.getRoundsData().gameWinRoundIndex
      console.log('winning roll index', winningRollIndex)
      console.log('winning round index', winningRoundIndex)
      if (
        winningRollIndex === this.getWinningRollIndex() &&
        winningRoundIndex === this.getWinningRoundIndex()
      ) {
        player.winGame()
        this.winnerDiscordIds.push(player)
      }
    })
    console.log('winning ids', this.winnerDiscordIds)
  }

  // /** Returns the win roll and round index of the first player to reach it in game
  //  * @param players
  //  * @returns
  //  */
  // getWinIndexes() {
  //   const winIndexes = this.getPlayerArray().reduce(
  //     ({ roll, round }, player) => {
  //       const { gameWinRollIndex, gameWinRoundIndex } = player.getRoundsData()

  //       // if round is highter replace
  //       if (gameWinRoundIndex > round) {
  //         return { roll: gameWinRollIndex, round: gameWinRoundIndex }
  //       }

  //       if (gameWinRoundIndex === round && gameWinRollIndex > roll) {
  //         return { roll: gameWinRollIndex, round: gameWinRoundIndex }
  //       }
  //       return { roll, round }
  //     },
  //     { roll: 0, round: 0 }
  //   )
  //   return winIndexes
  // }

  getPlayersRoundsData(): { [key: string]: PlayerRoundsData } {
    const playerRoundsData: { [key: string]: PlayerRoundsData } = {}
    this.getPlayerArray().forEach((player) => {
      playerRoundsData[player.getDiscordId()] = player.getRoundsData()
    })
    return playerRoundsData
  }

  setBoard(board: string) {
    this.board = board
  }

  getBoard() {
    return this.board
  }

  renderBoard() {
    const board = renderBoard(
      this.getRollIndex(),
      this.getRoundIndex(),
      this.getGameRoundState().playerIndex,
      this.getPlayerArray()
    )
    this.setBoard(board)
    return board
  }

  /**
   * Win logic
   */
  winGame() {
    // this.getPlayer(this.getWinnerDiscordId()).winGame()
    this.setWin(true)
    this.setEndTime()
    this.setStatus(GameStatus.win)
    this.saveEncounter()
    this.doFinalPlayerMutation()
  }

  doFinalPlayerMutation() {
    this.getPlayerArray().forEach((player) =>
      player.doEndOfGameMutation(this.settings)
    )
  }

  resetGame() {
    this.setStatus(GameStatus.waitingRoom)
    this.setWin(false)
    this.rounds = 0
    this.embed = undefined
    this.doUpdate = false
    this.removePlayers()
    this.setDefaultGameRoundState()
  }
}

const defaultGameRoundState = {
  roundIndex: 0,
  rollIndex: 0,
  playerIndex: 0,
  currentPlayer: undefined,
}

const defaultSettings: ChannelSettings = {
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

export enum GameStatus {
  waitingRoom = 'waitingRoom',
  activeGame = 'activeGame',
  win = 'win',
}

type discordId = string
