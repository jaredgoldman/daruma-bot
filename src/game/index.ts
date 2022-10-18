import { Embed, Message, TextChannel } from 'discord.js'
import doEmbed from '../core/embeds'
import { Embeds } from '../constants/embeds'
import { games } from '..'
import { asyncForEach, wait } from '../utils/sharedUtils'
import { getChannelSettings } from '../database/operations/game'
import Game, { GameStatus } from '../models/game'
import Player from '../models/player'
// import util from 'util'
import { GameTypes } from '../types/game'
import win from './win'

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

    if (game.getType() !== GameTypes.OneVsOne) {
      game.addNpc()
    }

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

    await handleGameLoop(game, channel, turnRate)
    // HANDLE GAME WIN MESSAGE HERE
    // await channel.send(doEmbed(Embeds.win, game))
    await win(game, channel)
    await wait(4000)
    startWaitingRoom(channel)
  } catch (error) {
    console.log('****** ERROR STARTING WAITING ROOM ******', error)
  }
}

const handleGameLoop = async (
  game: Game,
  channel: TextChannel,
  turnRate: number
) => {
  //TODO: MAke something better for the player message
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
        game.setCurrentPlayer(player, playerIndex)
        const board = game.renderBoard()

        // if it's the first roll
        if (!channelMessage) {
          await channel.send(playerMessage)
          channelMessage = await channel.send(board)

          // if there's a win
        } else if (game.getWin()) {
          await channelMessage.edit(game.renderBoard(true))
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
}
