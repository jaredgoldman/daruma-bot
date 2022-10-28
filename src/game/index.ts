import { Client, ClientUser, Message, TextChannel } from 'discord.js'

import { renderConfig } from '../config/board'
import { GameStatus } from '../constants/game'
import doEmbed from '../core/embeds'
import {
  getChannelSettings,
  updateMessageId,
} from '../database/operations/game'
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
  client: Client,
  channelId: string
): Promise<void> {
  try {
    const game = games[channelId]
    const { maxCapacity, messageId } = (game.settings =
      await getChannelSettings(channelId))
    const waitingRoomChannel = (await client.channels.fetch(
      channelId
    )) as TextChannel

    await sendWaitingRoomEmbed(
      client,
      game,
      waitingRoomChannel,
      channelId,
      messageId as string
    )

    while (
      game.playerCount < maxCapacity &&
      game.status === GameStatus.waitingRoom
    ) {
      await wait(1000)
    }
    await game.embed
      ?.edit(doEmbed(GameStatus.activeGame, game))
      .then(() => (game.status = GameStatus.activeGame))
      .then(() => handleGameLoop(game, waitingRoomChannel))
      .then(() => win(game, waitingRoomChannel))
      .then(() => startWaitingRoom(client, channelId))
  } catch (error) {
    Logger.error('****** ERROR STARTING WAITING ROOM ******', error)
  }
}

const sendWaitingRoomEmbed = async (
  client: Client,
  game: Game,
  waitingRoomChannel: TextChannel,
  channelId: string,
  messageId: string
): Promise<void> => {
  Logger.info(`Joining the Channel ${channelId} of type ${game.type}.`)
  game.resetGame()
  await waitingRoomChannel.messages.fetch(messageId).catch(e => {
    Logger.error(`Error when trying to fetch the message for ${game.type}\n`, e)
    Logger.info('Creating new message')
  })

  try {
    if (messageId) waitingRoomChannel.messages.cache.get(messageId)?.delete()
  } catch (e: any) {
    Logger.error('Error when trying to delete the waiting room.', e)
  }

  if (game.type !== GameTypes.OneVsOne) {
    game.addNpc(client.user as ClientUser)
  }

  // Send first waiting room embed
  game.embed = await waitingRoomChannel
    .send(doEmbed(GameStatus.waitingRoom, game))
    .then(msg => {
      updateMessageId(channelId, msg.id)
      return msg
    })
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
            channelMessage = await channel.send(board)
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
async function win(game: Game, channel: TextChannel): Promise<void> {
  await asyncForEach(game.winningPlayers, async (player: Player) => {
    await channel.send(doEmbed(GameStatus.win, game, { player }))
  })
}
