import { TextChannel } from 'discord.js'

import doEmbed from '../embeds'
import { Embeds } from '../constants/embeds'
import { games } from '..'
import { wait } from '../utils/shared'
import runGame from './runGame'
import { getGameSettings } from '../database/operations/game'

export default async function startWaitingRoom(channel: TextChannel) {
  const game = games[channel.id]
  const settings = await getGameSettings(channel.id)
  game.addSettings(settings)
  const { maxCapacity } = settings

  const waitingRoomEmbed = await channel.send(doEmbed(Embeds.waitingRoom, game))
  game.setEmbed(waitingRoomEmbed)

  game.setIsWaitingRoom(true)
  let playerCount = game.getPlayerCount()

  while (playerCount < maxCapacity && game.getIsWaitingRoom()) {
    if (game.getDoUpdate()) {
      await game.editEmbed(doEmbed(Embeds.waitingRoom, game))
      playerCount = game.getPlayerCount()
      await wait(1000)
    }
  }

  game.setIsWaitingRoom(false)

  await wait(2000)

  game.setActive(true)

  runGame(game, false)
}
