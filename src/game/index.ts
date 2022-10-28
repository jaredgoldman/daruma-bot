import { ClientUser, Message, TextChannel } from 'discord.js'

import { renderConfig } from '../config/board'
import { GameStatus } from '../constants/game'
import doEmbed from '../core/embeds'
import { updateMessageId } from '../database/operations/game'
import Game from '../models/game'
import Player from '../models/player'
import { RenderPhases } from '../types/board'
import { GameTypes } from '../types/game'
import { Logger } from '../utils/logger'
import { asyncForEach, randomNumber, wait } from '../utils/sharedUtils'
import * as GameImages from './images.json'

export class GameHandler {
  private waitingRoomChannel: TextChannel
  constructor(private game: Game) {
    this.waitingRoomChannel = this.game.client.channels.cache.get(
      this.game.settings.channelId
    ) as TextChannel
  }

  /**
   * Start game waiting room
   * @param channel {TextChannel}
   */
  async start(): Promise<void> {
    try {
      Logger.info(
        `Joining the Channel ${this.game.settings.channelId} of type ${this.game.type}.`
      )
      await this.sendWaitingRoomEmbed()
    } catch (error) {
      Logger.error('****** ERROR STARTING WAITING ROOM ******', error)
    }
  }

  async startChannelGame(): Promise<void> {
    await this.game.embed
      ?.edit(doEmbed(GameStatus.activeGame, this.game))
      .then(() => (this.game.status = GameStatus.activeGame))
      .then(() => this.handleGameLoop())
      .then(() => this.win())
      .then(() => this.sendWaitingRoomEmbed())
  }

  async sendWaitingRoomEmbed(): Promise<void> {
    this.game.resetGame()
    await this.waitingRoomChannel.messages
      .fetch(this.game.settings.messageId as string)
      .catch(e => {
        Logger.error(
          `Error when trying to fetch the message for ${this.game.type}\n`,
          e
        )
        Logger.info('Creating new message')
      })

    try {
      if (this.game.settings.messageId)
        this.waitingRoomChannel.messages.cache
          .get(this.game.settings.messageId)
          ?.delete()
    } catch (e: any) {
      Logger.error('Error when trying to delete the waiting room.', e)
    }

    switch (this.game.type) {
      case GameTypes.OneVsNpc:
        this.game.addNpc(
          this.game.client.user as ClientUser,
          'Karasu',
          GameImages.Karasu.url
        )
        break
      case GameTypes.OneVsOne:
        break
      case GameTypes.FourVsNpc:
        this.game.addNpc(
          this.game.client.user as ClientUser,
          'Taoshin',
          GameImages.Taoshin.url
        )
    }

    this.game.embed = await this.waitingRoomChannel
      ?.send(doEmbed(GameStatus.waitingRoom, this.game))
      .then(msg => {
        this.game.settings.messageId = msg.id
        updateMessageId(this.game.settings.channelId, msg.id)
        return msg
      })
  }

  /**
   * Handle main game loop
   * @param game {Game}
   * @param channel {TextChannel}
   */
  async handleGameLoop(): Promise<void> {
    let channelMessage: Message

    let hasWon = false
    if (process.env.SKIP_BATTLE) {
      Logger.warn('You are Skipping battles! Hope this is not Production')
      this.waitingRoomChannel.send('Skipping The Battle.. because well tests')
      await wait(2500)
        .then(() => (hasWon = true))
        .then(() => this.game.winGame())
    }
    await wait(1500)

    while (!hasWon) {
      const playerArr = this.game.playerArray

      // for each player render new board
      await asyncForEach(
        playerArr,
        async (player: Player, playerIndex: number) => {
          this.game.setCurrentPlayer(player, playerIndex)
          // for each render phase, pass enum to board
          for (const phase in RenderPhases) {
            const board = this.game.renderBoard(phase as RenderPhases)

            // if it's the first roll
            if (!channelMessage) {
              channelMessage = await this.waitingRoomChannel.send(board)
            } else {
              await channelMessage.edit(board)
            }
            await wait(
              randomNumber(
                renderConfig[phase].durMin,
                renderConfig[phase].durMax
              )
            )
          }
        }
      )
      //if win, stop loop
      if (this.game.win) {
        hasWon = true
      } else {
        // proceed to next roll
        this.game.incrementRollIndex()
      }
    }
  }
  /**
   * Send a winning embed for each winning player
   * @param game {Game}
   * @param channel {TextChannel}
   */
  async win(): Promise<void> {
    await asyncForEach(this.game.winningPlayers, async (player: Player) => {
      await this.waitingRoomChannel.send(
        doEmbed(GameStatus.win, this.game, { player })
      )
    })
  }
}
