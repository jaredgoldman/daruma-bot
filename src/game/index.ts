import { ClientUser, Message } from 'discord.js'

import { renderConfig } from '../config/board'
import { GameStatus } from '../constants/game'
import doEmbed from '../core/embeds'
import { updateMessageId } from '../database/operations/game'
import { games } from '../models/bot'
import Game from '../models/game'
import Player from '../models/player'
import { RenderPhases } from '../types/board'
import { GameTypes } from '../types/game'
import { Logger } from '../utils/logger'
import { asyncForEach, randomNumber, wait } from '../utils/sharedUtils'

/**
 * Start game waiting room
 * @param channel {TextChannel}
 */
export default async function startWaitingRoom(
  channelGame: Game
): Promise<void> {
  try {
    const game = games[channelGame.settings.channelId]
    Logger.info(
      `Joining the Channel ${game.settings.channelId} of type ${game.type}.`
    )
    await sendWaitingRoomEmbed(game)
  } catch (error) {
    Logger.error('****** ERROR STARTING WAITING ROOM ******', error)
  }
}

export const startChannelGame = async (game: Game): Promise<void> => {
  await game.embed
    ?.edit(doEmbed(GameStatus.activeGame, game))
    .then(() => (game.status = GameStatus.activeGame))
    .then(() => handleGameLoop(game))
    .then(() => win(game))
    .then(() => sendWaitingRoomEmbed(game))
}

const sendWaitingRoomEmbed = async (game: Game): Promise<void> => {
  game.resetGame()
  await game.waitingRoomChannel.messages
    .fetch(game.settings.messageId as string)
    .catch(e => {
      Logger.error(
        `Error when trying to fetch the message for ${game.type}\n`,
        e
      )
      Logger.info('Creating new message')
    })

  try {
    if (game.settings.messageId)
      game.waitingRoomChannel.messages.cache
        .get(game.settings.messageId)
        ?.delete()
  } catch (e: any) {
    Logger.error('Error when trying to delete the waiting room.', e)
  }

  if (game.type !== GameTypes.OneVsOne) {
    game.addNpc(game.client.user as ClientUser)
  }

  game.embed = await game.waitingRoomChannel
    ?.send(doEmbed(GameStatus.waitingRoom, game))
    .then(msg => {
      game.settings.messageId = msg.id
      updateMessageId(game.settings.channelId, msg.id)
      return msg
    })
}

/**
 * Handle main game loop
 * @param game {Game}
 * @param channel {TextChannel}
 */
const handleGameLoop = async (game: Game): Promise<void> => {
  let channelMessage: Message

  let hasWon = false
  if (process.env.SKIP_BATTLE) {
    Logger.warn('You are Skipping battles! Hope this is not Production')
    game.waitingRoomChannel.send('Skipping The Battle.. because well tests')
    await wait(2500)
      .then(() => (hasWon = true))
      .then(() => game.winGame())
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
            channelMessage = await game.waitingRoomChannel.send(board)
          } else {
            await channelMessage.edit(board)
          }
          await wait(
            randomNumber(renderConfig[phase].durMin, renderConfig[phase].durMax)
          )
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
/**
 * Send a winning embed for each winning player
 * @param game {Game}
 * @param channel {TextChannel}
 */
async function win(game: Game): Promise<void> {
  await asyncForEach(game.winningPlayers, async (player: Player) => {
    await game.waitingRoomChannel.send(
      doEmbed(GameStatus.win, game, { player })
    )
  })
}
