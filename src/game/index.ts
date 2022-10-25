import { Message, TextChannel } from 'discord.js'

import { renderConfig } from '../config/board'
import { GameStatus } from '../constants/game'
import doEmbed from '../core/embeds'
import { getChannelSettings } from '../database/operations/game'
import { games } from '../models/bot'
import Game from '../models/game'
import Player from '../models/player'
import { RenderPhases } from '../types/board'
import { GameTypes } from '../types/game'
import { Logger } from '../utils/logger'
import { asyncForEach, wait } from '../utils/sharedUtils'
import win from './win'
/**
 * Start game waiting room
 * @param channel {TextChannel}
 */
export default async function startWaitingRoom(
  channel: TextChannel
): Promise<void> {
  try {
    const game = games[channel.id]
    game.resetGame()
    // console.log(util.inspect(game, false, null, true))
    const { maxCapacity } = (game.settings = await getChannelSettings(
      channel.id
    ))

    if (game.type !== GameTypes.OneVsOne) {
      game.addNpc(channel.client.user)
    }

    // Send first waiting room embed
    game.embed = await channel.send(doEmbed(GameStatus.waitingRoom, game))

    /**
     * *******************
     * WAITING ROOM LOOP *
     * *******************
     */

    while (
      game.playerCount < maxCapacity &&
      game.status === GameStatus.waitingRoom
    ) {
      // If game is in updating state, update embed
      if (game.doUpdate) {
        await game.editEmbed(doEmbed(GameStatus.waitingRoom, game))
      }
      await wait(1000)
    }
    await game.embed.delete()
    game.embed = await channel.send(doEmbed(GameStatus.activeGame, game))
    game.status = GameStatus.activeGame // Start the Game
    await handleGameLoop(game, channel)
    await win(game, channel)
    game.embed.delete()
    startWaitingRoom(channel)
  } catch (error) {
    Logger.error('****** ERROR STARTING WAITING ROOM ******', error)
  }
}

/**
 * Handle main game loop
 * @param game {Game}
 * @param channel {TextChannel}
 */
const handleGameLoop = async (
  game: Game,
  channel: TextChannel
): Promise<void> => {
  let channelMessage: Message

  let hasWon = false
  if (process.env.SKIP_BATTLE) {
    Logger.warn('You are Skipping battles! Hope this is not Production')
    channel.send('Skipping The Battle.. because well tests')
    await wait(2500)
    hasWon = true
    game.winGame()
  }
  await wait(1500)

  while (!hasWon) {
    const playerArr = game.playerArray

    // for each player render new board
    await asyncForEach(
      playerArr,
      async (player: Player, playerIndex: number) => {
        game.setCurrentPlayer(player, playerIndex)
        // for each render phase, pass enum to board
        for (const phase in RenderPhases) {
          const board = game.renderBoard(phase as RenderPhases)

          // if it's the first roll
          if (!channelMessage) {
            channelMessage = await channel.send(board)
          } else {
            await channelMessage.edit(board)
          }

          await wait(renderConfig[phase].duration)
        }
      }
    )
    //if win, stop loop
    if (game.win) {
      hasWon = true
    } else {
      // proceed to next roll
      game.incrementRollIndex()
    }
  }
}
