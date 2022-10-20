import { AttachmentBuilder, Message, TextChannel } from 'discord.js'

import { Embeds } from '../constants/embeds'
import doEmbed from '../core/embeds'
import { getChannelSettings } from '../database/operations/game'
import Game, { GameStatus } from '../models/game'
import Player from '../models/player'
import { RenderPhases } from '../types/board'
// import util from 'util'
import { GameTypes } from '../types/game'
import { asyncForEach, wait } from '../utils/sharedUtils'
import win from './win'
import { games } from '../'
import { renderConfig } from '../config/board'

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
    const settings = await getChannelSettings(channel.id)
    game.addSettings(settings)
    const gameType = game.getType()

    if (gameType !== GameTypes.OneVsOne) {
      game.addNpc()
    }

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

    game.setStatus(GameStatus.activeGame)

    await handleCommencingGameMessage(channel, game.getType())
    await wait(1500)
    await handleGameLoop(game, channel)
    await win(game, channel)
    startWaitingRoom(channel)
  } catch (error) {
    console.log('****** ERROR STARTING WAITING ROOM ******', error)
  }
}

const handleGameLoop = async (
  game: Game,
  channel: TextChannel
): Promise<void> => {
  //TODO: MAke something better for the player message
  let channelMessage: Message
  const playerMessage = game
    .getPlayerArray()
    .map((player: Player, index: number) => {
      return player.getIsNpc()
        ? `${index + 1} - ${player.getUsername()}`
        : `${index + 1} - <@${player.getDiscordId()}>`
    })
    .join('\n')

  let hasWon = false

  while (!hasWon) {
    const playerArr = game.getPlayerArray()

    // for each player render new board
    await asyncForEach(
      playerArr,
      async (player: Player, playerIndex: number) => {
        game.setCurrentPlayer(player, playerIndex)
        // for each render phase, pass enum to baord
        for (const phase in RenderPhases) {
          const board = game.renderBoard(false, phase as RenderPhases)

          // if it's the first roll
          if (!channelMessage) {
            await channel.send(playerMessage)
            channelMessage = await channel.send(board)
          } else {
            await channelMessage.edit(board)
          }

          await wait(renderConfig[phase].duration)
        }
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
}

const handleCommencingGameMessage = async (
  channel: TextChannel,
  gameType: GameTypes
): Promise<void> => {
  switch (gameType) {
    case GameTypes.OneVsOne:
      break
    case GameTypes.OneVsNpc:
      const attachment = new AttachmentBuilder('src/assets/NPC_1V1.gif')
      await channel.send({ files: [attachment] })
      break
    case GameTypes.FourVsNpc:
      break
    default:
      break
  }
}
