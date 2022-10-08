import { Message, TextChannel } from 'discord.js'
import doEmbed from '../core/embeds'
import { Embeds } from '../constants/embeds'
import { games } from '..'
import { asyncForEach, wait } from '../utils/sharedUtils'
import { getChannelSettings } from '../database/operations/game'
import { GameStatus } from '../models/game'
import Player from '../models/player'
import { renderBoard } from './board'
import util from 'util'

/**
 * Start game waiting room
 * @param channel {TextChannel}
 */
export default async function startWaitingRoom(channel: TextChannel) {
  try {
    const game = games[channel.id]
    game.resetGame()
    // console.log(util.inspect(game, false, null, true))
    const settings = await getChannelSettings(channel.id)
    game.addSettings(settings)
    const { maxCapacity, turnRate } = settings

    // Send first waiting room embed
    const waitingRoomEmbed = await channel.send(
      doEmbed(Embeds.waitingRoom, game)
    )

    game.setEmbed(waitingRoomEmbed)

    let playerCount = game.getPlayerCount()

    /**
     * *******************
     * WAITING ROOM LOOP *
     * *******************
     */
    while (
      playerCount < maxCapacity &&
      game.getStatus() === GameStatus.waitingRoom
    ) {
      // If game is in updating state, update embed
      if (game.isUpdating()) {
        await game.editEmbed(doEmbed(Embeds.waitingRoom, game))
        playerCount = game.getPlayerCount()
      }
      await wait(1000)
    }

    await wait(2000)

    game.setStatus(GameStatus.activeGame)

    /**
     * ******************
     * ACTIVE GAME LOOP *
     * ******************
     */

    let channelMessage: Message
    const playerMessage = game
      .getPlayerArray()
      .map(
        (player: Player, index: number) =>
          `${index + 1} - <@${player.getDiscordId()}>`
      )
      .join('\n')

    let hasWon = false

    while (!hasWon) {
      const playerArr = game.getPlayerArray()

      // for each player render new board
      await asyncForEach(
        playerArr,
        async (player: Player, playerIndex: number) => {
          // TODO: take care of this inside game logic
          game.setCurrentPlayer(playerIndex)
          const board = game.renderBoard()

          // await game.editEmbed(doEmbed(Embeds.activeGame, game, { board }))
          if (!channelMessage) {
            await channel.send(playerMessage)
            channelMessage = await channel.send(board)
          } else {
            await channelMessage.edit(board)
          }

          await wait(turnRate * 1000)
        }
      )
      //if win, stop loop
      if (game.getWin()) {
        hasWon = true
      } else {
        // proceed to next roll
        game.incrementRollIndex()
      }
    }

    // HANDLE GAME WIN MESSAGE HERE

    await wait(2000)
    startWaitingRoom(channel)
  } catch (error) {
    console.log('****** ERROR STARTING WAITING ROOM ******', error)
  }
}
