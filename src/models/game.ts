import Player from './player'
import NPC from './npc'
import { collections } from '../database/database.service'
import Encounter from './encounter'
import { GameRoundState, GameTypes } from '../types/game'
import { ChannelSettings } from '../types/game'
import { MessageOptions } from 'discord.js'
import util from 'util'

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
    this.gameRoundState = defaultGameRoundState
  }

  private players: { [key: string]: Player }
  private status: GameStatus
  private win: boolean
  private winningRoundIndex: number | undefined
  private winningRollIndex: number | undefined
  private winnerDiscordId: number | undefined
  private rounds: number
  private stopped: boolean
  private doUpdate: boolean
  private embed: any
  private npc: NPC | undefined
  private gameRoundState: GameRoundState

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
    this.players[player.getDiscordId()] = player
    // update games winning index
    const { gameWinRollIndex, gameWinRoundIndex, rounds } =
      player.getRoundsData()
    console.log(util.inspect(rounds, false, null, true))
    this.compareAndSetWinningIndexes(gameWinRollIndex, gameWinRoundIndex)
  }

  getPlayerCount() {
    return this.getPlayerArray().length
  }

  removePlayers() {
    this.players = {}
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

  setWinnerDiscordId(winnerDiscordId: number) {
    this.winnerDiscordId = winnerDiscordId
  }

  getWinnerDiscordId() {
    return this.winnerDiscordId
  }

  getWinningRoundIndex() {
    return this.winningRoundIndex
  }

  setWiningRoundIndex(roundIndex: number) {
    this.winningRoundIndex = roundIndex
  }

  getWinningRollIndex() {
    return this.winningRollIndex
  }

  setWinningRollIndex(rollIndex: number) {
    this.winningRollIndex = rollIndex
  }

  compareAndSetWinningIndexes(rollIndex: number, roundIndex: number) {
    if (!this.winningRollIndex) {
      this.winningRollIndex = rollIndex
    }
    if (!this.winningRoundIndex) {
      this.winningRoundIndex = roundIndex
    }
    // if the round index is lower  than the current orund index, change it
    if (roundIndex < this.winningRoundIndex) {
      this.winningRoundIndex = roundIndex
      this.winningRollIndex = rollIndex
    }
    // if the round index is the same, but the roll index is lower, change it
    if (
      roundIndex === this.winningRoundIndex &&
      rollIndex < this.winningRollIndex
    ) {
      this.winningRollIndex = rollIndex
      this.winningRoundIndex = roundIndex
    }

    console.log('winning roll index', this.winningRollIndex)
    console.log('winning round index', this.winningRoundIndex)
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
   * Stopped
   */

  isStopped() {
    return this.stopped
  }

  setStopped() {
    this.stopped = true
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

  // if it's the third round, reset the round index
  incrementRollIndex() {
    if (!this.getWin()) {
      if ((this.getRollIndex() + 1) % 3 === 0) {
        this.incrementRoundIndex()
        this.gameRoundState.rollIndex = 0
      } else {
        this.gameRoundState.rollIndex++
      }

      this.logState()

      // handle win if win
      if (
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

  // incrementPlayerIndex() {
  //   if (this.getPlayerCount() - 1 === this.getPlayerIndex()) {
  //     this.gameRoundState.playerIndex = 0
  //   } else {
  //     this.gameRoundState.playerIndex++
  //   }
  // }

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
  // /**
  //  * Finds an array of winningPlayers and the round index that the game was won
  //  * @returns { winningPlayers: Player[]; winIndex: number }
  //  */
  // findWinIndexAndWinners = (): {
  //   winningPlayers: Player[]
  //   winIndex: number
  // } => {
  //   const winningPlayers: Player[] = []
  //   const playerArr = this.getPlayerArray()

  //   // find who has the shortest array length
  //   const winningPlayer = playerArr.reduce(
  //     (prevPlayer: Player, currentPlayer: Player): Player => {
  //       return prevPlayer.getRoundsLength() < currentPlayer.getRoundsLength()
  //         ? prevPlayer
  //         : currentPlayer
  //     }
  //   )

  //   // Assing winner
  //   winningPlayer.setIsWinner()

  //   // Prase remaining players for win
  //   this.getPlayerArray().forEach((player: Player) => {
  //     if (player.getRoundsLength() && !player.getIsWinner()) {
  //       winningPlayers.push(player)
  //     }
  //   })

  //   const winIndex = winningPlayers[0].getRoundsLength()
  //   return { winningPlayers, winIndex }
  // }

  logState() {
    console.log(`****** ROUND ${this.gameRoundState.roundIndex + 1} ******`)
    console.log('winning round index', this.winningRoundIndex)
    console.log('winning roll index', this.winningRollIndex)
    console.log('gameRoundState', this.gameRoundState)
  }

  /** Returns the win roll and round index of the first player to reach it in game
   * @param players
   * @returns
   */
  getWinIndexes() {
    const winIndexes = this.getPlayerArray().reduce(
      ({ roll, round }, player) => {
        const { gameWinRollIndex, gameWinRoundIndex } = player.getRoundsData()

        // if round is highter replace
        if (gameWinRoundIndex > round) {
          return { roll: gameWinRollIndex, round: gameWinRoundIndex }
        }

        if (gameWinRoundIndex === round && gameWinRollIndex > roll) {
          return { roll: gameWinRollIndex, round: gameWinRoundIndex }
        }
        return { roll, round }
      },
      { roll: 0, round: 0 }
    )
    return winIndexes
  }

  /**
   * Saves an encounter
   */
  winGame() {
    this.setWin(true)
    // saveEncounter()
  }

  resetGame() {
    this.setStatus(GameStatus.waitingRoom)
    this.setWin(false)
    this.rounds = 0
    this.stopped = false
    this.embed = undefined
    this.doUpdate = false
    this.removePlayers()
    this.npc = undefined
    this.addSettings(defaultSettings)
    this.setDefaultGameRoundState()
  }
}

const defaultGameRoundState = {
  roundIndex: 0,
  rollIndex: 0,
  playerIndex: 0,
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
  turnRate: 2,
}

export enum GameStatus {
  waitingRoom = 'waitingRoom',
  activeGame = 'activeGame',
  win = 'win',
}

type discordId = string
