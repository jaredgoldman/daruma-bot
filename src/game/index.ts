import { TextChannel } from 'discord.js'
import doEmbed from '../embeds'
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
    let rollIndex = 0
    let roundIndex = 0
    const { roll, round } = getWinIndexes(game.getPlayerArray())

    let channelMessage: any

    while (game.getStatus() === GameStatus.activeGame && !game.getWin()) {
      const playerArr = game.getPlayerArray()

      // for each player render new board
      await asyncForEach(
        playerArr,
        async (player: Player, playerIndex: number) => {
          try {
            console.log('*************************')
            // console.log(`player ${playerIndex + 1}s turn`)
            console.log('rollIndex', rollIndex)
            console.log('roundIndex', roundIndex)
            // console.log('playerIndex', playerIndex)
            console.log('winning roll index', roll)
            console.log('winning round index', round)
            console.log('*************************')

            const board: string = renderBoard(
              rollIndex,
              roundIndex,
              playerIndex,
              playerArr
            )

            console.log(board)

            // await game.editEmbed(doEmbed(Embeds.activeGame, game, { board }))
            if (!channelMessage) {
              channelMessage = await channel.send(board)
            } else {
              channelMessage.edit(board)
            }
          } catch (error) {
            console.log(error)
          }
          await wait(1000)
        }
      )

      if (roll === rollIndex && round === roundIndex) {
        console.log('WINNER')
        game.setWin(true)
        break
      }

      // Wait til round is over to stop game
      // iterate round index if we're on the third roll and reset rollIndex,
      // otherwise just increment rollIndex
      if ((rollIndex + 1) % 3 === 0) {
        // TODO keep track of these values in the game object
        roundIndex++
        rollIndex = 0
        // if we're on the third roll and there's a winner, set game win to true
      } else {
        rollIndex++
      }
    }
    console.log('game over')
  } catch (error) {
    console.log('****** ERROR STARTING WAITING ROOM ******', error)
  }
}
