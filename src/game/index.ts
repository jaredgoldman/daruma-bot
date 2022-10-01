import { TextChannel } from 'discord.js'
import doEmbed from '../core/embeds'
import { Embeds } from '../constants/embeds'
import { games } from '..'
import { asyncForEach, wait } from '../utils/sharedUtils'
import { getChannelSettings } from '../database/operations/game'
import { GameStatus } from '../models/game'
import Player from '../models/player'
import { renderBoard } from './board'
import { getWinIndexes } from '../utils/gameUtils'

/**
 * Start game waiting room
 * @param channel {TextChannel}
 */
export default async function startWaitingRoom(channel: TextChannel) {
  try {
    const game = games[channel.id]
    const settings = await getChannelSettings(channel.id)
    game.addSettings(settings)
    const { maxCapacity } = settings

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

    console.log('beginning game')

    await wait(2000)

    game.setStatus(GameStatus.activeGame)

    /**
     * ******************
     * ACTIVE GAME LOOP *
     * ******************
     */

    let channelMessage: any
    const playerMessage = game
      .getPlayerArray()
      .map(
        (player: Player, index: number) =>
          `${index + 1} - <@${player.getDiscordId()}>`
      )
      .join('\n')

    console.log('playerMessage', playerMessage)

    while (game.getStatus() === GameStatus.activeGame) {
      const playerArr = game.getPlayerArray()

      // for each player render new board
      await asyncForEach(
        playerArr,
        async (player: Player, playerIndex: number) => {
          const { rollIndex, roundIndex } = game.getGameRoundState()
          try {
            const board: string = renderBoard(
              rollIndex,
              roundIndex,
              playerIndex,
              playerArr
            )
            // console.log(board)

            // await game.editEmbed(doEmbed(Embeds.activeGame, game, { board }))
            if (!channelMessage) {
              channelMessage = await channel.send(playerMessage)
              channelMessage = await channel.send(board)
            } else {
              channelMessage.edit(board)
            }
          } catch (error) {
            console.log(error)
          }

          //if win, stop loop
          if (game.getWin()) {
            game.setStatus(GameStatus.win)
          } else {
            await wait(1000)
          }
        }
      )
      // proceed to next round
      // OR same game.win to true
      game.incrementRollIndex()
    }

    console.log('game over')
  } catch (error) {
    console.log('****** ERROR STARTING WAITING ROOM ******', error)
  }
}
