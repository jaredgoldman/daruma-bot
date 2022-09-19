import { TextChannel } from 'discord.js'
import doEmbed from '../embeds'
import { Embeds } from '../constants/embeds'
import { games } from '..'
import { asyncForEach, wait } from '../utils/shared'
import { getChannelSettings } from '../database/operations/game'
import { GameStatus } from '../models/game'
import Player from '../models/player'
import { renderBoard } from './board'

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

    // Waiting room loop
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

    // Active game lopp
    let rollIndex = 0
    let roundNumber = 1
    while (game.getStatus() === GameStatus.activeGame && !game.getWin()) {
      // also can think of this as rounds

      const playerArr = game.getPlayerArray()
      if ((rollIndex + 1) % 3 === 0) roundNumber++

      console.log('rollIndex: ', rollIndex)
      console.log('roundNumber: ', roundNumber)
      // for each player
      await asyncForEach(
        playerArr,
        async (player: Player, playerIndex: number) => {
          // for each roll
          // call reander board
          const board = renderBoard(
            rollIndex,
            roundNumber,
            playerIndex,
            game.getPlayerArray()
          )
          if (game.getWin()) {
            // handle winning logic
          }
          await wait(4000)
        }
      )

      rollIndex++
    }
  } catch (error) {
    console.log('****** ERROR STARTING WAITING ROOM ******', error)
  }
}
